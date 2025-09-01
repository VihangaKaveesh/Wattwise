from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import joblib
from pymongo import MongoClient

app = Flask(__name__)
CORS(app)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(BASE_DIR, 'ml-models', 'budget_recommender.pkl')

# Connect to MongoDB
mongo_uri = os.getenv("MONGO_URI", "mongodb://localhost:27017/WattWise")
client = MongoClient(mongo_uri)
db = client.get_default_database()
appliance_collection = db["appliances"]

# Load appliance table from DB
def load_appliance_table():
    table = {}
    for doc in appliance_collection.find({}, {"name": 1, "typical_w": 1, "standby_w": 1, "_id": 0}):
        table[doc["name"]] = {
            "typical_w": doc["typical_w"],
            "standby_w": doc.get("standby_w", 0)
        }
    return table

# Default daily hours fallback
default_daily_hours = {app: 1 for app in load_appliance_table().keys()}

# Define budget_optimizer class
class budget_optimizer:
    def __init__(self, appliance_table):
        self.appl_table = appliance_table

    def adjust_hours(self, hours_per_day, budget_lkr):
        estimated_kwh = sum(
            self.appl_table[a]['typical_w'] * hpd * 30 +
            self.appl_table[a].get('standby_w', 0) * 30 * 24
            for a, hpd in hours_per_day.items() if a in self.appl_table
        ) / 1000
        estimated_bill = estimated_kwh * 20 + 100
        if estimated_bill <= budget_lkr:
            return hours_per_day
        scale_factor = budget_lkr / estimated_bill
        return {app: round(hpd * scale_factor, 2) for app, hpd in hours_per_day.items()}

# Load pickled budget recommender
budget_model = joblib.load(MODEL_PATH)
if isinstance(budget_model, type):
    budget_model = budget_optimizer(load_appliance_table())

# Compute monthly kWh from hours
def compute_monthly_kwh(hours_per_day):
    appl_table = load_appliance_table()
    monthly_kwh = 0
    for app, hpd in hours_per_day.items():
        if app not in appl_table:
            continue
        monthly_hours = hpd * 30
        monthly_kwh += appl_table[app]['typical_w'] * monthly_hours
        monthly_kwh += appl_table[app].get('standby_w', 0) * 30 * 24
    return monthly_kwh / 1000

# Flask endpoint
@app.route('/recommend-budget', methods=['POST'])
def recommend_budget():
    data = request.get_json()
    budget_lkr = data.get('budget_lkr', None)
    hours_per_day = data.get('hours_per_day', None)

    if budget_lkr is None or hours_per_day is None:
        return jsonify({'error': 'budget_lkr or hours_per_day missing'}), 400

    try:
        recommended_hours = budget_model.adjust_hours(hours_per_day, budget_lkr)
        predicted_kwh = compute_monthly_kwh(recommended_hours)
        predicted_bill = round(predicted_kwh * 20 + 100, 2)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

    return jsonify({
        "within_budget": predicted_bill <= budget_lkr,
        "recommended_hours_per_day": recommended_hours,
        "predicted_bill": predicted_bill
    })

if __name__ == '__main__':
    app.run(port=5001, debug=True)