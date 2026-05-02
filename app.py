from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestRegressor

app = Flask(__name__)
CORS(app)

df = pd.read_csv("ncr_ride_bookings.csv")

df["DateTime"] = pd.to_datetime(df["Date"] + " " + df["Time"])
df["Hour"] = df["DateTime"].dt.hour

trip_data = df.groupby("Hour").size().reset_index(name="Trips")

X = trip_data[["Hour"]]
y = trip_data["Trips"]

model = RandomForestRegressor(
    n_estimators=100,
    random_state=42
)

model.fit(X, y)

accuracy = round(model.score(X, y) * 100, 2)

@app.route("/")
def home():
    return "Uber DSS Backend Running Successfully 🚖"

@app.route("/predict", methods=["POST"])
def predict():

    data = request.get_json()
    hour = int(data["hour"])

    predicted = int(model.predict(np.array([[hour]]))[0])

    drivers_needed = int(predicted / 4)

    return jsonify({
        "hour": hour,
        "predicted_trips": predicted,
        "drivers_needed": drivers_needed,
        "model_used": "Random Forest",
        "accuracy": accuracy
    })

if __name__ == "__main__":
    app.run(debug=True)