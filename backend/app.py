from pathlib import Path
import pandas as pd
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from services.prediction import predict_lst, load_production_predictions
from services.shap_service import explain_prediction
from services.ai_analyst import analyze_location

BASE_DIR = Path(__file__).resolve().parents[1]

PREDICTIONS_PATH = BASE_DIR / "ml" / "outputs" / "predictions" / "production_predictions.parquet"
RISK_PATH = BASE_DIR / "ml" / "outputs" / "uhi" / "thermal_risk_cells.parquet"
HOTSPOT_PATH = BASE_DIR / "ml" / "outputs" / "uhi" / "persistent_hotspots.parquet"
SUMMARY_PATH = BASE_DIR / "ml" / "outputs" / "uhi" / "city_thermal_summary.csv"

YEARS = [2022, 2023, 2024, 2025, 2026]
FEATURES = ["NDVI", "NDBI", "NDWI", "albedo", "elevation", "slope", "landcover"]
PUBLIC_CITIES = [
    "Ahmedabad", "Bengaluru", "Bhubaneswar", "Chennai",
    "Dehradun", "Delhi", "Guwahati", "Hyderabad",
    "Jaipur", "Kolkata", "Mumbai", "Nagpur", "Pune", "Raipur"
]


def load_parquet(path):
    if not path.exists():
        raise FileNotFoundError(f"Required data not found: {path}")
    return pd.read_parquet(path)


predictions_df = load_production_predictions()
risk_df = load_parquet(RISK_PATH)
hotspots_df = load_parquet(HOTSPOT_PATH)
summary_df = pd.read_csv(SUMMARY_PATH)


def normalize_columns(df):
    rename = {}
    for c in df.columns:
        if c.lower() == "year":
            rename[c] = "year"
        elif c.lower() == "city":
            rename[c] = "city"
        elif c.lower() == "lst":
            rename[c] = "LST"
        elif c.lower() in ("predicted_lst", "predicted-lst"):
            rename[c] = "predicted_LST"
    return df.rename(columns=rename)


predictions_df = normalize_columns(predictions_df)
risk_df = normalize_columns(risk_df)
hotspots_df = normalize_columns(hotspots_df)
summary_df = normalize_columns(summary_df)

app = FastAPI(
    title="Urban Heat Intelligence API",
    description="Multi-city satellite-based urban heat intelligence system",
    version="3.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class PredictionRequest(BaseModel):
    NDVI: float
    NDBI: float
    NDWI: float
    albedo: float
    elevation: float
    slope: float
    landcover: float

class AIAnalysisRequest(BaseModel):
    question: str
    city: str
    latitude: float
    longitude: float


@app.get("/")
def root():
    return {
        "message": "Urban Heat Intelligence API",
        "status": "running",
        "version": "3.0.0"
    }


@app.get("/dataset/info")
def dataset_info():
    return {
        "cities": PUBLIC_CITIES,
        "years": YEARS,
        "total_records": int(len(predictions_df)),
        "locations": int(predictions_df["sample_id"].nunique()) if "sample_id" in predictions_df else None,
        "features": FEATURES,
        "model": "RandomForestRegressor"
    }


@app.get("/cities")
def get_cities():
    return {
        "cities": PUBLIC_CITIES,
        "years": YEARS
    }


@app.get("/heatmap")
def get_heatmap(city: str = "Raipur", year: int = 2026):
    if city not in PUBLIC_CITIES:
        raise HTTPException(400, f"Unknown city: {city}")

    if year not in YEARS:
        raise HTTPException(400, f"Invalid year: {year}")

    data = predictions_df[
        (predictions_df["city"] == city) &
        (predictions_df["year"] == year)
    ].copy()

    if data.empty:
        return []

    columns = [
        "latitude", "longitude", "year", "LST",
        "NDVI", "NDBI", "NDWI", "albedo",
        "elevation", "slope", "landcover"
    ]

    columns = [c for c in columns if c in data.columns]

    return data[columns].to_dict(orient="records")


@app.get("/heatmap/predicted")
def get_predicted_heatmap(city: str = "Raipur", year: int = 2026):
    if city not in PUBLIC_CITIES:
        raise HTTPException(400, f"Unknown city: {city}")

    data = predictions_df[
        (predictions_df["city"] == city) &
        (predictions_df["year"] == year)
    ].copy()

    if data.empty:
        return []

    if "predicted_LST" not in data.columns:
        data["predicted_LST"] = predict_batch(data)

    if "prediction_error" not in data.columns:
        data["prediction_error"] = data["LST"] - data["predicted_LST"]

    columns = [
        "latitude", "longitude", "year",
        "LST", "predicted_LST", "prediction_error",
        "NDVI", "NDBI", "NDWI", "albedo",
        "elevation", "slope", "landcover"
    ]

    columns = [c for c in columns if c in data.columns]

    return data[columns].to_dict(orient="records")


def predict_batch(data):
    return predict_dataframe(data)


def predict_dataframe(data):
    model_features = data[FEATURES]
    from services.prediction import get_model
    return get_model().predict(model_features)


@app.get("/location/trend")
def get_location_trend(latitude: float, longitude: float, city: str | None = None):
    data = predictions_df.copy()

    if city:
        if city not in PUBLIC_CITIES:
            raise HTTPException(400, f"Unknown city: {city}")
        data = data[data["city"] == city]

    if data.empty:
        return []

    distances = (
        (data["latitude"] - latitude) ** 2 +
        (data["longitude"] - longitude) ** 2
    )

    nearest_index = distances.idxmin()
    point = data.loc[nearest_index]

    location_data = data[
        (data["latitude"] == point["latitude"]) &
        (data["longitude"] == point["longitude"])
    ].sort_values("year")

    columns = [
        "city", "sample_id", "latitude", "longitude",
        "year", "LST", "predicted_LST",
        "NDVI", "NDBI", "NDWI", "albedo",
        "elevation", "slope", "landcover"
    ]

    columns = [c for c in columns if c in location_data.columns]

    return location_data[columns].to_dict(orient="records")


@app.get("/statistics")
def get_statistics(city: str = "Raipur"):
    if city not in PUBLIC_CITIES:
        raise HTTPException(400, f"Unknown city: {city}")

    data = predictions_df[predictions_df["city"] == city]

    if data.empty:
        return []

    result = (
        data.groupby("year")
        .agg(
            mean_LST=("LST", "mean"),
            min_LST=("LST", "min"),
            max_LST=("LST", "max"),
            mean_NDVI=("NDVI", "mean"),
            mean_NDBI=("NDBI", "mean"),
            mean_NDWI=("NDWI", "mean"),
            mean_albedo=("albedo", "mean"),
            mean_elevation=("elevation", "mean"),
            mean_slope=("slope", "mean")
        )
        .reset_index()
    )

    return result.to_dict(orient="records")


@app.get("/heatmap/change")
def heatmap_change(city: str = "Raipur"):
    if city not in PUBLIC_CITIES:
        raise HTTPException(400, f"Unknown city: {city}")

    data = predictions_df[predictions_df["city"] == city]

    d2022 = data[data["year"] == 2022][
        ["sample_id", "latitude", "longitude", "LST"]
    ].rename(columns={"LST": "LST_2022"})

    d2026 = data[data["year"] == 2026][
        ["sample_id", "latitude", "longitude", "LST"]
    ].rename(columns={"LST": "LST_2026"})

    merged = d2022.merge(
        d2026,
        on=["sample_id", "latitude", "longitude"],
        how="inner"
    )

    merged["LST_change"] = merged["LST_2026"] - merged["LST_2022"]

    return merged.to_dict(orient="records")


@app.get("/risk")
def get_risk(city: str = "Raipur", year: int = 2026):
    if city not in PUBLIC_CITIES:
        raise HTTPException(400, f"Unknown city: {city}")

    data = risk_df[
        (risk_df["city"] == city) &
        (risk_df["year"] == year)
    ].copy()

    if data.empty:
        return []

    return data.to_dict(orient="records")


@app.get("/hotspots")
def get_hotspots(city: str = "Raipur"):
    if city not in PUBLIC_CITIES:
        raise HTTPException(400, f"Unknown city: {city}")

    data = hotspots_df[hotspots_df["city"] == city].copy()

    if data.empty:
        return []

    return data.to_dict(orient="records")


@app.get("/city/summary")
def get_city_summary(city: str = "Raipur"):
    if city not in PUBLIC_CITIES:
        raise HTTPException(400, f"Unknown city: {city}")

    data = summary_df[summary_df["city"] == city]

    return data.to_dict(orient="records")


@app.post("/predict")
def predict_temperature(data: PredictionRequest):
    prediction = predict_lst(
        data.NDVI,
        data.NDBI,
        data.NDWI,
        data.albedo,
        data.elevation,
        data.slope,
        data.landcover
    )

    if prediction < 40:
        risk = "LOW"
    elif prediction < 48:
        risk = "MODERATE"
    elif prediction < 55:
        risk = "HIGH"
    else:
        risk = "VERY HIGH"

    return {
        "predicted_LST": prediction,
        "risk_category": risk
    }


@app.post("/explain")
def explain(data: PredictionRequest):
    return explain_prediction(
        data.NDVI,
        data.NDBI,
        data.NDWI,
        data.albedo,
        data.elevation,
        data.slope,
        data.landcover
    )

@app.post("/ai/analyze")
def ai_analyze(data: AIAnalysisRequest):
    if data.city not in PUBLIC_CITIES:
        raise HTTPException(400, f"Unknown city: {data.city}")

    try:
        return analyze_location(
            question=data.question,
            city=data.city,
            latitude=data.latitude,
            longitude=data.longitude
        )
    except Exception as e:
        raise HTTPException(500, f"AI analysis failed: {str(e)}")