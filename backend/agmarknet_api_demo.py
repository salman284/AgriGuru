from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

# Sample data for demonstration
DATA = [
    {"S.No": "1", "City": "Bangalore", "Commodity": "Potato", "Min Prize": "1500", "Max Prize": "1800", "Model Prize": "1600", "Date": "04 Nov 2023"},
    {"S.No": "2", "City": "Bangalore", "Commodity": "Potato", "Min Prize": "1400", "Max Prize": "1700", "Model Prize": "1500", "Date": "04 Nov 2023"},
    {"S.No": "3", "City": "Bangalore", "Commodity": "Potato", "Min Prize": "1500", "Max Prize": "1800", "Model Prize": "1600", "Date": "03 Nov 2023"},
    {"S.No": "4", "City": "Bangalore", "Commodity": "Potato", "Min Prize": "1400", "Max Prize": "1700", "Model Prize": "1500", "Date": "03 Nov 2023"},
    {"S.No": "5", "City": "Bangalore", "Commodity": "Potato", "Min Prize": "1500", "Max Prize": "1800", "Model Prize": "1600", "Date": "02 Nov 2023"},
    {"S.No": "6", "City": "Bangalore", "Commodity": "Potato", "Min Prize": "1400", "Max Prize": "1700", "Model Prize": "1500", "Date": "02 Nov 2023"},
    {"S.No": "7", "City": "Bangalore", "Commodity": "Potato", "Min Prize": "1800", "Max Prize": "2000", "Model Prize": "1900", "Date": "30 Oct 2023"},
    {"S.No": "8", "City": "Bangalore", "Commodity": "Potato", "Min Prize": "1300", "Max Prize": "1600", "Model Prize": "1400", "Date": "30 Oct 2023"}
]

@app.route('/request')
def get_market_data():
    commodity = request.args.get('commodity')
    state = request.args.get('state')
    market = request.args.get('market')
    # For demo, filter only by commodity and city
    filtered = [row for row in DATA if row['Commodity'].lower() == commodity.lower() and row['City'].lower() == market.lower()]
    return jsonify(filtered)

if __name__ == '__main__':
    app.run(host='127.0.0.1', port=5000, debug=True)
