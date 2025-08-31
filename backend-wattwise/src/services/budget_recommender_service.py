from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import joblib

# -------------------------------
# Flask app
# -------------------------------
app = Flask(__name__)
CORS(app)

# -------------------------------
# Paths
# -------------------------------
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(BASE_DIR, 'ml-models', 'budget_recommender.pkl')

# -------------------------------
# Example appliance table (replace with real CSV or DB)
# -------------------------------
appl_table = {
    "Ceiling Fan": {"typical_w": 65, "standby_w": 0},
    "Refrigerator (200–300L)": {"typical_w": 160, "standby_w": 5},
    "LED TV (40–50 in)": {"typical_w": 90, "standby_w": 1},
    "Rice Cooker": {"typical_w": 500, "standby_w": 0},
    "Electric Kettle": {"typical_w": 2000, "standby_w": 0},
}

# Default daily hours fallback
default_daily_hours = {app: 1 for app in appl_table.keys()}

# -------------------------------
# Define budget_optimizer class (needed for unpickling)
# -------------------------------
class budget_optimizer:
    def __init__(self, appliance_table):
        self.appl_table = appliance_table

    def adjust_hours(self, hours_per_day, budget_lkr):
        """
        Adjust appliance hours proportionally to meet the budget
        """
        # Compute estimated kWh
        estimated_kwh = sum(
            self.appl_table[a]['typical_w'] * hpd * 30 + self.appl_table[a].get('standby_w', 0) * 30*24
            for a, hpd in hours_per_day.items() if a in self.appl_table
        ) / 1000

        # Compute estimated bill
        estimated_bill = estimated_kwh * 20 + 100

        if estimated_bill <= budget_lkr:
            return hours_per_day  # already within budget

        # Scale hours to meet budget
        scale_factor = budget_lkr / estimated_bill
        return {app: round(hpd*scale_factor, 2) for app, hpd in hours_per_day.items()}

# -------------------------------
# Load pickled budget recommender
# -------------------------------
budget_model = joblib.load(MODEL_PATH)

# If joblib contains the class itself, instantiate with appliance table
if isinstance(budget_model, type):
    budget_model = budget_optimizer(appl_table)

# -------------------------------
# Function to compute monthly kWh from hours
# -------------------------------
def compute_monthly_kwh(hours_per_day):
    monthly_kwh = 0
    for app, hpd in hours_per_day.items():
        if app not in appl_table:
            continue
        monthly_hours = hpd * 30
        monthly_kwh += appl_table[app]['typical_w'] * monthly_hours
        monthly_kwh += appl_table[app].get('standby_w', 0) * 30 * 24
    return monthly_kwh / 1000  # kWh

# -------------------------------
# Flask endpoint
# -------------------------------
@app.route('/recommend-budget', methods=['POST'])
def recommend_budget():
    data = request.get_json()
    budget_lkr = data.get('budget_lkr', None)
    hours_per_day = data.get('hours_per_day', None)

    if budget_lkr is None or hours_per_day is None:
        return jsonify({'error': 'budget_lkr or hours_per_day missing'}), 400

    try:
        # Adjust hours using budget_model
        recommended_hours = budget_model.adjust_hours(hours_per_day, budget_lkr)

        # Compute predicted kWh and bill
        predicted_kwh = compute_monthly_kwh(recommended_hours)
        predicted_bill = round(predicted_kwh * 20 + 100, 2)

    except Exception as e:
        return jsonify({'error': str(e)}), 500

    return jsonify({
        "within_budget": predicted_bill <= budget_lkr,
        "recommended_hours_per_day": recommended_hours,
        "predicted_bill": predicted_bill
    })

# -------------------------------
# Run Flask
# -------------------------------
if __name__ == '__main__':
    app.run(port=5001, debug=True)
