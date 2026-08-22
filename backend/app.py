from fastapi import FastAPI
from pydantic import BaseModel
import joblib
import pandas as pd
import shap

from fastapi.middleware.cors import CORSMiddleware

from services.ai_analyst import analyze_location


# ============================================================
# FASTAPI APP
# ============================================================

app = FastAPI(
    title="Urban Heat Intelligence API",
    description="Satellite-based urban heat analysis for Raipur",
    version="2.0.0"
)


# ============================================================
# CORS
# ============================================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ============================================================
# DATA
# ============================================================

DATA_PATH = (
    "../data/processed/"
    "raipur_5year_processed.csv"
)

heatmap_df = pd.read_csv(DATA_PATH)


# ============================================================
# MODEL
# ============================================================

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


# ============================================================
# SHAP
# ============================================================

shap_explainer = shap.TreeExplainer(
    model
)


# ============================================================
# ROOT
# ============================================================

@app.get("/")
def root():

    return {
        "message": "Urban Heat Intelligence API",
        "status": "running"
    }


# ============================================================
# DATASET INFO
# ============================================================

@app.get("/dataset/info")
def dataset_info():

    return {

        "location": "Raipur",

        "years": sorted(
            heatmap_df["Year"]
            .unique()
            .tolist()
        ),

        "total_records":
            len(heatmap_df),

        "locations": int(
            heatmap_df[
                [
                    "latitude",
                    "longitude"
                ]
            ]
            .drop_duplicates()
            .shape[0]
        )

    }


# ============================================================
# HEATMAP
# ============================================================

@app.get("/heatmap")
def get_heatmap(
    year: int = 2026
):

    available_years = sorted(
        heatmap_df["Year"]
        .unique()
        .tolist()
    )


    if year not in available_years:

        return {

            "error":
                "Invalid year",

            "available_years":
                available_years

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


# ============================================================
# LOCATION TREND
# ============================================================

@app.get("/location/trend")
def get_location_trend(
    latitude: float,
    longitude: float
):

    # --------------------------------------------
    # Find nearest available spatial point
    # --------------------------------------------

    distances = (

        (
            heatmap_df["latitude"]
            - latitude
        ) ** 2

        +

        (
            heatmap_df["longitude"]
            - longitude
        ) ** 2

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


    # --------------------------------------------
    # Get all years for that location
    # --------------------------------------------

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
    ].sort_values(
        "Year"
    )


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


# ============================================================
# PREDICTION REQUEST
# ============================================================

class PredictionRequest(BaseModel):

    NDVI: float
    NDBI: float
    NDWI: float


# ============================================================
# HEAT RISK
# ============================================================

def get_heat_risk(
    lst: float
):

    if lst < 40:

        return "LOW"

    elif lst < 48:

        return "MODERATE"

    elif lst < 55:

        return "HIGH"

    else:

        return "EXTREME"


# ============================================================
# ML PREDICTION
# ============================================================

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
        model.predict(
            features
        )[0]
    )


    return {

        "predicted_LST":
            prediction,

        "heat_risk":
            get_heat_risk(
                prediction
            )

    }


# ============================================================
# PREDICTED HEATMAP
# ============================================================

@app.get("/heatmap/predicted")
def get_predicted_heatmap():

    # --------------------------------------------
    # Only 2026 hold-out data
    # --------------------------------------------

    year_data = heatmap_df[
        heatmap_df["Year"] == 2026
    ].copy()


    # --------------------------------------------
    # Model features
    # --------------------------------------------

    features = year_data[
        MODEL_FEATURES
    ]


    # --------------------------------------------
    # Predictions
    # --------------------------------------------

    predictions = model.predict(
        features
    )


    year_data[
        "predicted_LST"
    ] = predictions


    # --------------------------------------------
    # Prediction error
    #
    # Observed - Predicted
    # --------------------------------------------

    year_data[
        "prediction_error"
    ] = (

        year_data["LST"]

        -

        year_data["predicted_LST"]

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


# ============================================================
# CITY STATISTICS
# ============================================================

@app.get("/statistics")
def get_statistics():

    stats = (

        heatmap_df

        .groupby("Year")

        .agg(

            mean_LST=(
                "LST",
                "mean"
            ),

            min_LST=(
                "LST",
                "min"
            ),

            max_LST=(
                "LST",
                "max"
            ),

            mean_NDVI=(
                "NDVI",
                "mean"
            ),

            mean_NDBI=(
                "NDBI",
                "mean"
            ),

            mean_NDWI=(
                "NDWI",
                "mean"
            )

        )

        .reset_index()

    )


    return stats.to_dict(
        orient="records"
    )


# ============================================================
# SHAP EXPLANATION
# ============================================================

@app.post("/explain")
def explain_prediction(
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


    # --------------------------------------------
    # Prediction
    # --------------------------------------------

    prediction = float(
        model.predict(
            features
        )[0]
    )


    # --------------------------------------------
    # SHAP explanation
    # --------------------------------------------

    explanation = shap_explainer(
        features
    )


    shap_values = (
        explanation.values[0]
    )


    contributions = {}


    for feature, value in zip(
        MODEL_FEATURES,
        shap_values
    ):

        contributions[
            feature
        ] = float(value)


    return {

        "predicted_LST":
            prediction,

        "base_value":
            float(
                explanation.base_values[0]
            ),

        "contributions":
            contributions

    }


# ============================================================
# AI ANALYST
# ============================================================

class AIAnalysisRequest(BaseModel):

    question: str

    latitude: float

    longitude: float


@app.post("/ai/analyze")
def ai_analyze(
    request: AIAnalysisRequest
):

    result = analyze_location(

        question=
            request.question,

        latitude=
            request.latitude,

        longitude=
            request.longitude

    )


    return result


# ============================================================
# 2022 → 2026 LST CHANGE MAP
# ============================================================

@app.get("/heatmap/change")
def heatmap_change():

    # --------------------------------------------
    # Get 2022 data
    # --------------------------------------------

    df_2022 = heatmap_df[
        heatmap_df["Year"] == 2022
    ].copy()


    # --------------------------------------------
    # Get 2026 data
    # --------------------------------------------

    df_2026 = heatmap_df[
        heatmap_df["Year"] == 2026
    ].copy()


    # --------------------------------------------
    # Make sure both years exist
    # --------------------------------------------

    if df_2022.empty:

        return {
            "error":
                "No data available for 2022"
        }


    if df_2026.empty:

        return {
            "error":
                "No data available for 2026"
        }


    # --------------------------------------------
    # Match identical spatial locations
    # --------------------------------------------

    merged = df_2022.merge(

        df_2026,

        on=[
            "latitude",
            "longitude"
        ],

        suffixes=(
            "_2022",
            "_2026"
        )

    )


    # --------------------------------------------
    # Calculate LST change
    #
    # Positive = warming
    # Negative = cooling
    # --------------------------------------------

    merged[
        "LST_change"
    ] = (

        merged["LST_2026"]

        -

        merged["LST_2022"]

    )


    # --------------------------------------------
    # Build API response
    # --------------------------------------------

    result = []


    for _, row in merged.iterrows():

        result.append({

            "latitude":
                float(
                    row["latitude"]
                ),

            "longitude":
                float(
                    row["longitude"]
                ),

            "LST_2022":
                float(
                    row["LST_2022"]
                ),

            "LST_2026":
                float(
                    row["LST_2026"]
                ),

            "LST_change":
                float(
                    row["LST_change"]
                )

        })


    return result