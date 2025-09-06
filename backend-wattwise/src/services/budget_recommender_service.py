from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
import numpy as np
import joblib
import json
from pathlib import Path


# Flask setup
app = Flask(__name__)
CORS(app)

BASE_DIR = Path(__file__).parent


# Load appliance data & default hours
APPLIANCE_CSV = './datasets/appliances_sl.csv'
appliances_df = pd.read_csv(APPLIANCE_CSV)
appl_table = appliances_df.set_index('appliance').to_dict(orient='index')

# Default median hours per appliance
with open(BASE_DIR / './datasets/median_daily_hours_per_appliance .json', 'r') as f:
    default_daily_hours = json.load(f)

# Load monthly weather and holiday data (optional, needed for model features)
weather_df = pd.read_csv('./datasets/weather_monthly_sl.csv').set_index('month').to_dict(orient='index')
holidays_df = pd.read_csv('./datasets/holidays_2025_monthly.csv').set_index('month').to_dict(orient='index')

FEATURE_COLS = ['people','num_appliances','physics_kwh','sum_monthly_hours_appliances','month','rainy_days','public_holidays']


# Load RF model (optional, you can skip this if using iterative approximation)
RF_MODEL_PATH ='./ml-models/rf_energy_model.pkl'
rf_model = joblib.load(RF_MODEL_PATH)


# Helper functions
def build_feature(people, month, appliances, hours_per_day):
    monthly_power_time_wh = 0
    monthly_standby_wh = 0
    sum_monthly_hours = 0
    for app in appliances:
        typ = float(appl_table[app]['typical_w'])
        standby = float(appl_table[app].get('standby_w', 0))
        hpd = float(hours_per_day.get(app, default_daily_hours.get(app, 0.5)))
        monthly_hours = hpd * 30
        monthly_power_time_wh += typ * monthly_hours
        monthly_standby_wh += standby * 30*24
        sum_monthly_hours += monthly_hours

    physics_kwh = (monthly_power_time_wh + monthly_standby_wh) / 1000.0
    num_appliances = len(appliances)
    rainy_days = int(weather_df.get(month, {}).get('rainy_days', 8))
    public_holidays = int(holidays_df.get(month, {}).get('public_holidays', 1))

    return pd.DataFrame([{
        'people': people,
        'num_appliances': num_appliances,
        'physics_kwh': physics_kwh,
        'sum_monthly_hours_appliances': sum_monthly_hours,
        'month': month,
        'rainy_days': rainy_days,
        'public_holidays': public_holidays
    }])[FEATURE_COLS]

def predict_kwh(people, month, appliances, hours_per_day):
    X = build_feature(people, month, appliances, hours_per_day)
    return float(rf_model.predict(X)[0])

# ---------------------------
# Iterative budget optimizer (outputs only hours)
# ---------------------------
def budget_optimizer_exact(people, month, appliances, budget_lkr, tol=1.0):
    # Initialize hours with median defaults
    recommended_hours = {app: default_daily_hours.get(app, 1.0) for app in appliances}

    # Iteratively scale hours to stay within budget
    for _ in range(20):
        scaled_hours = {app: h for app, h in recommended_hours.items()}
        predicted_kwh = predict_kwh(people, month, appliances, scaled_hours)
        # Simple bill approximation using RF kWh prediction
        # Only used internally for scaling, not returned
        blocks = [(0,30,4,75), (30,60,6,200), (60,90,14,400),
                  (90,120,20,1000), (120,180,33,1500), (180,np.inf,52,2000)]
        cost = 0
        for low, high, rate, fixed in blocks:
            if predicted_kwh > low:
                used = min(predicted_kwh, high) - low if np.isfinite(high) else predicted_kwh - low
                cost += used * rate
                last_fixed = fixed
        predicted_bill = cost + last_fixed

        if abs(predicted_bill - budget_lkr) <= tol:
            break
        scale_factor = budget_lkr / max(predicted_bill, 1e-3)
        recommended_hours = {app: min(max(h * scale_factor, 0.1), 24.0) for app, h in recommended_hours.items()}

    return {app: round(h, 2) for app, h in recommended_hours.items()}


# Flask endpoint
@app.route('/recommend-budget', methods=['POST'])
def recommend_budget():
    data = request.get_json()
    people = data.get('people')
    month = data.get('month')
    appliances = data.get('appliances')
    budget_lkr = data.get('budget_lkr')

    if None in [people, month, appliances, budget_lkr]:
        return jsonify({"error": "Missing required fields: people, month, appliances, budget_lkr"}), 400

    try:
        recommended_hours = budget_optimizer_exact(people, month, appliances, budget_lkr)
        return jsonify({"recommended_hours_per_day": recommended_hours})
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# Run server
if __name__ == '__main__':
    app.run(port=5001, debug=True)
