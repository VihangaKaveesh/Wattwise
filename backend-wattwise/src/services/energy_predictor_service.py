# energy_predictor_service.py

import json
import joblib
import numpy as np
import pandas as pd
from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)  


# ----------------- Load model and artifacts -----------------
MODEL_PATH = "./ml-models/rf_energy_model.pkl"
DEFAULT_HOURS_PATH = "./datasets/median_daily_hours_per_appliance .json"

# Load model
model = joblib.load(MODEL_PATH)

# Load default daily hours
with open(DEFAULT_HOURS_PATH, "r") as f:
    default_daily_hours = json.load(f)

# Load supporting reference tables
appliances_df = pd.read_csv("./datasets/appliances_sl.csv")
weather_df = pd.read_csv("./datasets/weather_monthly_sl.csv")
holidays_df = pd.read_csv("./datasets/holidays_2025_monthly.csv")

appl_table = appliances_df.set_index("appliance").to_dict(orient="index")
weather_map = weather_df.set_index("month").to_dict(orient="index")
holidays_map = holidays_df.set_index("month").to_dict(orient="index")

# Make sure FEATURE_COLS matches your training
FEATURE_COLS = [
    "people",
    "num_appliances",
    "physics_kwh",
    "sum_monthly_hours_appliances",
    "month",
    "rainy_days",
    "public_holidays"
]

# ----------------- Utility Functions -----------------
def compute_bill_lkr(kwh: float) -> float:
    """Example tariff function (you can replace with actual slabs)."""
    rate = 28.0  # LKR per kWh placeholder
    return kwh * rate


def build_feature_from_input(user_input: dict, month_override: int = None):
    people = int(user_input.get("people", 1))
    month = int(month_override) if month_override is not None else int(user_input.get("month", 1))
    appliances = list(user_input.get("appliances", []))
    hours_per_day = user_input.get("hours_per_day", {})

    monthly_power_time_wh = 0.0
    monthly_standby_wh = 0.0
    sum_monthly_hours = 0.0

    for app in appliances:
        if app not in appl_table:
            print(f"Warning: appliance '{app}' not in appliance table — skipping")
            continue
        typ = float(appl_table[app]["typical_w"])
        standby = float(appl_table[app].get("standby_w", 0.0))
        hpd = float(hours_per_day.get(app, default_daily_hours.get(app, 0.5)))
        monthly_hours = hpd * 30.0
        monthly_power_time_wh += typ * monthly_hours
        monthly_standby_wh += standby * 30.0 * 24.0
        sum_monthly_hours += monthly_hours

    physics_kwh = (monthly_power_time_wh + monthly_standby_wh) / 1000.0
    num_appliances = len(appliances)

    rainy_days = int(weather_map.get(month, {}).get("rainy_days", 8))
    public_holidays = int(holidays_map.get(month, {}).get("public_holidays", 1))

    return {
        "people": people,
        "num_appliances": num_appliances,
        "physics_kwh": physics_kwh,
        "sum_monthly_hours_appliances": sum_monthly_hours,
        "month": month,
        "rainy_days": rainy_days,
        "public_holidays": public_holidays,
    }


def predict_for_user(user_input: dict, month_override: int = None):
    feat = build_feature_from_input(user_input, month_override=month_override)
    Xrow = pd.DataFrame([feat])[FEATURE_COLS]
    predicted_kwh = float(model.predict(Xrow)[0])
    predicted_kwh = max(0.0, predicted_kwh)
    predicted_bill = compute_bill_lkr(predicted_kwh)
    return {
        "predicted_kwh": float(np.round(predicted_kwh, 3)),
        "predicted_bill_lkr": float(np.round(predicted_bill, 2))
    }

# ----------------- Flask App -----------------

@app.route("/predict-usage", methods=["POST"])
def predict_usage():
    try:
        user_input = request.get_json(force=True)

        this_month = predict_for_user(user_input, month_override=user_input.get("month"))
        next_month = predict_for_user(
            user_input,
            month_override=(int(user_input.get("month", 1)) % 12) + 1
        )

        return jsonify({
            "this_month": this_month,
            "next_month": next_month
        })

    except Exception as e:
        return jsonify({
            "this_month": {"predicted_kwh": 0, "predicted_bill_lkr": 0},
            "next_month": {"predicted_kwh": 0, "predicted_bill_lkr": 0},
            "error": str(e)
        }), 400


if __name__ == "__main__":
    app.run(port=5002, debug=True)
