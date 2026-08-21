from fastapi import FastAPI
from pydantic import BaseModel
import joblib
import numpy as np
import pandas as pd
from fastapi.middleware.cors import CORSMiddleware
from sklearn.metrics import mean_absolute_error
from sklearn.metrics import mean_squared_error
from sklearn.metrics import r2_score
from services.shap_service import explain_prediction

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

heatmap_df = pd.read_csv(
    "../data/processed/raipur_features.csv"
)

model = joblib.load(
    "./model/first_prediction_model.pkl"
)

model_features = heatmap_df[
    [
        "NDVI",
        "NDBI",
        "NDWI",
        "latitude",
        "longitude"
    ]
]

actual_values = heatmap_df["LST"]

model_predictions = model.predict(
    model_features
)

model_mae = mean_absolute_error(
    actual_values,
    model_predictions
)

model_rmse = np.sqrt(
    mean_squared_error(
        actual_values,
        model_predictions
    )
)

model_r2 = r2_score(
    actual_values,
    model_predictions
)

class LocationData(BaseModel):

    NDVI: float
    NDBI: float
    NDWI: float
    latitude: float
    longitude: float

@app.post("/explain")
def explain(data: LocationData):

    explanation = explain_prediction(
        data.NDVI,
        data.NDBI,
        data.NDWI,
        data.latitude,
        data.longitude
    )

    return {
        "explanation": explanation
    }

@app.get("/heatmap/predicted")
def get_predicted_heatmap():

    prediction_df = heatmap_df[
        [
            "latitude",
            "longitude",
            "LST",
            "NDVI",
            "NDBI",
            "NDWI"
        ]
    ].copy()

    features = prediction_df[
        [
            "NDVI",
            "NDBI",
            "NDWI",
            "latitude",
            "longitude"
        ]
    ]

    predictions = model.predict(features)

    prediction_df["predicted_LST"] = predictions

    prediction_df["prediction_error"] = (
        prediction_df["LST"]
        - prediction_df["predicted_LST"]
    )

    prediction_df = prediction_df.rename(
        columns={
            "LST": "observed_LST"
        }
    )

    return prediction_df.to_dict(
        orient="records"
    )

@app.get("/")
def home():

    return {
        "message":
        "Urban Heat Intelligence API"
    }

@app.get("/heatmap")
def get_heatmap():

    data = heatmap_df[
        [
            "latitude",
            "longitude",
            "LST",
            "NDVI",
            "NDBI",
            "NDWI"
        ]
    ].copy()

    return data.to_dict(
        orient="records"
    )

@app.post("/predict")
def predict(data: LocationData):

    features = np.array(
        [[
            data.NDVI,
            data.NDBI,
            data.NDWI,
            data.latitude,
            data.longitude
        ]]
    )


    prediction = model.predict(
        features
    )[0]


    if prediction < 40:
        risk="Low"

    elif prediction <48:
        risk="Medium"

    elif prediction <55:
        risk="High"

    else:
        risk="Extreme"



    return {

        "predicted_LST":
        round(float(prediction),2),

        "heat_risk":
        risk
    }