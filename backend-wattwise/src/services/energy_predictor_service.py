from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import pandas as pd
import joblib
from pymongo import MongoClient

app = Flask(__name__)
CORS(app)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(BASE_DIR, 'ml-models', 'rf_energy_model.pkl')
energy_model = joblib.load(MODEL_PATH)

mongo_uri = os.getenv("MONGO_URI", "mongodb://localhost:27017/WattWise")
client = MongoClient(mongo_uri)
db = client.get_default_database()
appliance_collection = db["appliances"]
monthly_collection = db["monthlydatas"]
tariff_collection = db["tariffs"]

def load_appliance_table():
    table = {}
    for doc in appliance_collection.find({}, {"name": 1, "typical_w": 1, "standby_w": 1, "_id": 0}):
        table[doc["name"]] = {
            "typical_w": max(doc["typical_w"], 0),
            "standby_w": max(doc.get("standby_w", 0), 0)
        }
    return table

default_daily_hours = {app: 1 for app in load_appliance_table().keys()}

def get_monthly_context(month):
    doc = monthly_collection.find_one({"month": month}, {"_id": 0})
    return {
        "rainy_days": max(doc.get("rainy_days", 8), 0),
        "public_holidays": max(doc.get("public_holidays", 1), 0)
    } if doc else {"rainy_days": 8, "public_holidays": 1}

def fetch_tariff_slabs(kwh):
    scheme = "<=60" if kwh <= 60 else ">60"
    slabs = list(tariff_collection.find({"scheme": scheme}, {"_id": 0}))
    return sorted(slabs, key=lambda s: s["kwh_from"])

def compute_bill_lkr(kwh):
    slabs = fetch_tariff_slabs(kwh)
    bill = 0
    remaining = max(kwh, 0)

    for slab in slabs:
        from_kwh = slab["kwh_from"]
        to_kwh = slab.get("kwh_to", float("inf"))
        rate = slab["energy_lkr_per_kwh"]
        fixed = slab["fixed_lkr"]

        if remaining <= 0:
            break

        slab_range = (to_kwh - from_kwh) if to_kwh != float("inf") else remaining
        slab_units = min(remaining, slab_range)

        if slab_units > 0:
            bill += slab_units * rate
            bill += fixed  # Only add fixed charge if this slab is used

        remaining -= slab_units

    return round(bill, 2)

FEATURE_COLS = [
    'people',
    'num_appliances',
    'physics_kwh',
    'sum_monthly_hours_appliances',
    'month',
    'rainy_days',
    'public_holidays'
]

def build_features_from_input(user_input: dict, month_override: int = None):
    appl_table = load_appliance_table()
    people = max(int(user_input.get('people', 1)), 1)
    month = int(month_override) if month_override else int(user_input.get('month', 1))
    appliances = user_input.get('appliances', [])
    hours_per_day = user_input.get('hours_per_day', {})

    monthly_power_time_wh = 0
    monthly_standby_wh = 0
    sum_monthly_hours = 0

    for app in appliances:
        if app not in appl_table:
            continue
        typ = max(appl_table[app]['typical_w'], 0)
        standby = max(appl_table[app].get('standby_w', 0), 0)
        hpd = max(float(hours_per_day.get(app, default_daily_hours.get(app, 1))), 0)
        monthly_hours = hpd * 30
        monthly_power_time_wh += typ * monthly_hours
        monthly_standby_wh += standby * 30 * 24
        sum_monthly_hours += monthly_hours

    physics_kwh = max((monthly_power_time_wh + monthly_standby_wh) / 1000, 0)
    num_appliances = max(len(appliances), 0)
    context = get_monthly_context(month)

    return {
        'people': people,
        'num_appliances': num_appliances,
        'physics_kwh': physics_kwh,
        'sum_monthly_hours_appliances': sum_monthly_hours,
        'month': month,
        'rainy_days': context["rainy_days"],
        'public_holidays': context["public_holidays"]
    }

@app.route('/predict-usage', methods=['POST'])
def predict_usage():
    data = request.get_json()
    try:
        features_this_month = build_features_from_input(data)
        features_next_month = build_features_from_input(data, month_override=(data.get('month', 1) % 12) + 1)

        for col in FEATURE_COLS:
            if features_this_month[col] < 0 or features_next_month[col] < 0:
                raise ValueError(f"Invalid feature: {col} is negative")

        X_this = pd.DataFrame([features_this_month])[FEATURE_COLS]
        X_next = pd.DataFrame([features_next_month])[FEATURE_COLS]

        predicted_kwh_this = max(float(energy_model.predict(X_this)[0]), 0)
        predicted_kwh_next = max(float(energy_model.predict(X_next)[0]), 0)

        predicted_bill_this = compute_bill_lkr(predicted_kwh_this)
        predicted_bill_next = compute_bill_lkr(predicted_kwh_next)

    except Exception as e:
        return jsonify({'error': str(e)}), 500

    return jsonify({
        "this_month": {
            "predicted_kwh": round(predicted_kwh_this, 3),
            "predicted_bill_lkr": round(predicted_bill_this, 2)
        },
        "next_month": {
            "predicted_kwh": round(predicted_kwh_next, 3),
            "predicted_bill_lkr": round(predicted_bill_next, 2)
        }
    })

if __name__ == '__main__':
    app.run(port=5002, debug=True)