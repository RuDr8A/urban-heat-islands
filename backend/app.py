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

app = FastAPI(
    title="Urban Heat Intelligence API",
    description="Satellite-based urban heat analysis for Raipur",
    version="2.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

DATA_PATH = (
    "../data/processed/"
    "raipur_5year_processed.csv"
)

heatmap_df = pd.read_csv(DATA_PATH)

MODEL_PATH = (
    "../ml/models/"
    "final_first_xgboost_environmental.pkl"
)

model = joblib.load(MODEL_PATH)

MODEL_FEATURES = [
    "NDVI",
    "NDBI",
    "NDWI"
]

@app.get("/")
def root():

    return {
        "message": "Urban Heat Intelligence API",
        "status": "running"
    }

@app.get("/dataset/info")
def dataset_info():

    return {
        "location": "Raipur",
        "years": sorted(
            heatmap_df["Year"]
            .unique()
            .tolist()
        ),
        "total_records": len(heatmap_df),
        "locations": int(
            heatmap_df[
                ["latitude", "longitude"]
            ]
            .drop_duplicates()
            .shape[0]
        )
    }

@app.get("/heatmap")
def get_heatmap(year: int = 2026):

    year_data = heatmap_df[
        heatmap_df["Year"] == year
    ].copy()

    if year_data.empty:

        return {
            "error": f"No data available for year {year}"
        }

    columns = [
        "latitude",
        "longitude",
        "Year",
        "LST",
        "NDVI",
        "NDBI",
        "NDWI"
    ]

    return year_data[
        columns
    ].to_dict(
        orient="records"
    )

@app.get("/heatmap")
def get_heatmap(year: int = 2026):

    available_years = sorted(
        heatmap_df["Year"]
        .unique()
        .tolist()
    )

    if year not in available_years:

        return {
            "error": "Invalid year",
            "available_years": available_years
        }

    year_data = heatmap_df[
        heatmap_df["Year"] == year
    ].copy()

    columns = [
        "latitude",
        "longitude",
        "Year",
        "LST",
        "NDVI",
        "NDBI",
        "NDWI"
    ]

    return year_data[
        columns
    ].to_dict(
        orient="records"
    )


@app.get("/location/trend")
def get_location_trend(
    latitude: float,
    longitude: float
):

    distances = (
        (heatmap_df["latitude"] - latitude) ** 2
        +
        (heatmap_df["longitude"] - longitude) ** 2
    )

    nearest_index = distances.idxmin()

    nearest_latitude = heatmap_df.loc[
        nearest_index,
        "latitude"
    ]

    nearest_longitude = heatmap_df.loc[
        nearest_index,
        "longitude"
    ]

    location_data = heatmap_df[
        (
            heatmap_df["latitude"]
            == nearest_latitude
        )
        &
        (
            heatmap_df["longitude"]
            == nearest_longitude
        )
    ].sort_values("Year")

    return location_data[
        [
            "latitude",
            "longitude",
            "Year",
            "LST",
            "NDVI",
            "NDBI",
            "NDWI"
        ]
    ].to_dict(
        orient="records"
    )


class PredictionRequest(BaseModel):

    NDVI: float
    NDBI: float
    NDWI: float

@app.post("/predict")
def predict_temperature(
    data: PredictionRequest
):

    features = pd.DataFrame(
        [[
            data.NDVI,
            data.NDBI,
            data.NDWI
        ]],
        columns=MODEL_FEATURES
    )

    prediction = model.predict(
        features
    )[0]

    return {
        "predicted_LST": float(prediction)
    }

def get_heat_risk(lst):

    if lst < 40:
        return "LOW"

    elif lst < 48:
        return "MODERATE"

    elif lst < 55:
        return "HIGH"

    else:
        return "EXTREME"

@app.post("/predict")
def predict_temperature(
    data: PredictionRequest
):

    features = pd.DataFrame(
        [[
            data.NDVI,
            data.NDBI,
            data.NDWI
        ]],
        columns=MODEL_FEATURES
    )

    prediction = float(
        model.predict(features)[0]
    )

    return {
        "predicted_LST": prediction,
        "heat_risk": get_heat_risk(
            prediction
        )
    }

@app.get("/heatmap/predicted")
def get_predicted_heatmap():

    year_data = heatmap_df[
        heatmap_df["Year"] == 2026
    ].copy()

    features = year_data[
        MODEL_FEATURES
    ]

    predictions = model.predict(
        features
    )

    year_data[
        "predicted_LST"
    ] = predictions

    year_data[
        "prediction_error"
    ] = (
        year_data["LST"]
        - year_data["predicted_LST"]
    )

    return year_data[
        [
            "latitude",
            "longitude",
            "Year",
            "LST",
            "NDVI",
            "NDBI",
            "NDWI",
            "predicted_LST",
            "prediction_error"
        ]
    ].to_dict(
        orient="records"
    )

@app.get("/statistics")
def get_statistics():

    stats = (
        heatmap_df
        .groupby("Year")
        .agg(
            mean_LST=("LST", "mean"),
            min_LST=("LST", "min"),
            max_LST=("LST", "max"),
            mean_NDVI=("NDVI", "mean"),
            mean_NDBI=("NDBI", "mean"),
            mean_NDWI=("NDWI", "mean")
        )
        .reset_index()
    )

    return stats.to_dict(
        orient="records"
    )
# model_features = heatmap_df[
#     [
#         "NDVI",
#         "NDBI",
#         "NDWI",
#         "latitude",
#         "longitude"
#     ]
# ]

# actual_values = heatmap_df["LST"]

# model_predictions = model.predict(
#     model_features
# )

# model_mae = mean_absolute_error(
#     actual_values,
#     model_predictions
# )

# model_rmse = np.sqrt(
#     mean_squared_error(
#         actual_values,
#         model_predictions
#     )
# )

# model_r2 = r2_score(
#     actual_values,
#     model_predictions
# )

# class LocationData(BaseModel):

#     NDVI: float
#     NDBI: float
#     NDWI: float
#     latitude: float
#     longitude: float

# @app.get("/")
# def root():

#     return {
#         "message": "Urban Heat Intelligence API",
#         "status": "running"
#     }

# @app.post("/explain")
# def explain(data: LocationData):

#     explanation = explain_prediction(
#         data.NDVI,
#         data.NDBI,
#         data.NDWI,
#         data.latitude,
#         data.longitude
#     )

#     return {
#         "explanation": explanation
#     }

# @app.get("/heatmap/predicted")
# def get_predicted_heatmap():

#     prediction_df = heatmap_df[
#         [
#             "latitude",
#             "longitude",
#             "LST",
#             "NDVI",
#             "NDBI",
#             "NDWI"
#         ]
#     ].copy()

#     features = prediction_df[
#         [
#             "NDVI",
#             "NDBI",
#             "NDWI",
#             "latitude",
#             "longitude"
#         ]
#     ]

#     predictions = model.predict(features)

#     prediction_df["predicted_LST"] = predictions

#     prediction_df["prediction_error"] = (
#         prediction_df["LST"]
#         - prediction_df["predicted_LST"]
#     )

#     prediction_df = prediction_df.rename(
#         columns={
#             "LST": "observed_LST"
#         }
#     )

#     return prediction_df.to_dict(
#         orient="records"
#     )

# @app.get("/")
# def home():

#     return {
#         "message":
#         "Urban Heat Intelligence API"
#     }

# @app.get("/heatmap")
# def get_heatmap():

#     data = heatmap_df[
#         [
#             "latitude",
#             "longitude",
#             "LST",
#             "NDVI",
#             "NDBI",
#             "NDWI"
#         ]
#     ].copy()

#     return data.to_dict(
#         orient="records"
#     )

# @app.post("/predict")
# def predict(data: LocationData):

#     features = np.array(
#         [[
#             data.NDVI,
#             data.NDBI,
#             data.NDWI,
#             data.latitude,
#             data.longitude
#         ]]
#     )


#     prediction = model.predict(
#         features
#     )[0]


#     if prediction < 40:
#         risk="Low"

#     elif prediction <48:
#         risk="Medium"

#     elif prediction <55:
#         risk="High"

#     else:
#         risk="Extreme"



#     return {

#         "predicted_LST":
#         round(float(prediction),2),

#         "heat_risk":
#         risk
#     }