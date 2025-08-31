from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import pandas as pd
import joblib

# Flask app
app = Flask(__name__)
CORS(app)

# Paths
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(BASE_DIR, 'ml-models', 'rf_energy_model.pkl')

# Load pre-trained RandomForestRegressor
energy_model = joblib.load(MODEL_PATH)

# Columns expected by the model
FEATURE_COLS = [
    'people',
    'num_appliances',
    'physics_kwh',
    'sum_monthly_hours_appliances',
    'month',
    'rainy_days',
    'public_holidays'
]

# Example appliance table (load your CSV in production)
appl_table = {
    "Ceiling Fan": {"typical_w": 65, "standby_w": 0},
    "Refrigerator (200–300L)": {"typical_w": 160, "standby_w": 5},
    "LED TV (40–50 in)": {"typical_w": 90, "standby_w": 1},
    "Rice Cooker": {"typical_w": 500, "standby_w": 0},
    "Electric Kettle": {"typical_w": 2000, "standby_w": 0},
    # add all appliances here...
}

# Default daily hours fallback
default_daily_hours = {app: 1 for app in appl_table.keys()}

# Example weather and holiday maps (replace with CSV or DB)
weather_map = {month: {"rainy_days": 8} for month in range(1,13)}
holidays_map = {month: {"public_holidays": 1} for month in range(1,13)}

# Example function to compute bill from kWh (replace with real tariffs)
def compute_bill_lkr(kwh):
    # Simple linear tariff example
    return round(kwh * 20 + 100, 2)

# Feature builder function
def build_features_from_input(user_input: dict, month_override: int=None):
    people = int(user_input.get('people', 1))
    month = int(month_override) if month_override else int(user_input.get('month', 1))
    appliances = user_input.get('appliances', [])
    hours_per_day = user_input.get('hours_per_day', {})

    monthly_power_time_wh = 0
    monthly_standby_wh = 0
    sum_monthly_hours = 0

    for app in appliances:
        if app not in appl_table:
            continue
        typ = appl_table[app]['typical_w']
        standby = appl_table[app].get('standby_w', 0)
        hpd = float(hours_per_day.get(app, default_daily_hours.get(app, 1)))
        monthly_hours = hpd * 30
        monthly_power_time_wh += typ * monthly_hours
        monthly_standby_wh += standby * 30 * 24
        sum_monthly_hours += monthly_hours

    physics_kwh = (monthly_power_time_wh + monthly_standby_wh) / 1000
    num_appliances = len(appliances)
    rainy_days = weather_map.get(month, {}).get('rainy_days', 8)
    public_holidays = holidays_map.get(month, {}).get('public_holidays', 1)

    return {
        'people': people,
        'num_appliances': num_appliances,
        'physics_kwh': physics_kwh,
        'sum_monthly_hours_appliances': sum_monthly_hours,
        'month': month,
        'rainy_days': rainy_days,
        'public_holidays': public_holidays
    }


# Flask endpoint
@app.route('/predict-usage', methods=['POST'])
def predict_usage():
    data = request.get_json()
    try:
        # Build features
        features_this_month = build_features_from_input(data)
        features_next_month = build_features_from_input(data, month_override=(data.get('month',1)%12)+1)

        X_this = pd.DataFrame([features_this_month])[FEATURE_COLS]
        X_next = pd.DataFrame([features_next_month])[FEATURE_COLS]

        # Predict kWh
        predicted_kwh_this = float(energy_model.predict(X_this)[0])
        predicted_kwh_next = float(energy_model.predict(X_next)[0])

        # Compute bill
        predicted_bill_this = compute_bill_lkr(predicted_kwh_this)
        predicted_bill_next = compute_bill_lkr(predicted_kwh_next)

    except Exception as e:
        return jsonify({'error': str(e)}), 500

    return jsonify({
        "this_month": {
            "predicted_kwh": round(predicted_kwh_this, 3),
            "predicted_bill_lkr": round(predicted_bill_this,2)
        },
        "next_month": {
            "predicted_kwh": round(predicted_kwh_next,3),
            "predicted_bill_lkr": round(predicted_bill_next,2)
        }
    })


# Run Flask
if __name__ == '__main__':
    app.run(port=5002, debug=True)
