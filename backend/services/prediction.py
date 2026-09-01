from pathlib import Path
import joblib
import pandas as pd

BASE_DIR = Path(__file__).resolve().parents[2]

MODEL_PATH = BASE_DIR / "ml" / "models" / "uhi_random_forest_production.joblib"
PREDICTIONS_PATH = BASE_DIR / "ml" / "outputs" / "predictions" / "production_predictions.parquet"

MODEL_FEATURES = [
    "NDVI", "NDBI", "NDWI", "albedo",
    "elevation", "slope", "landcover"
]

_model = None


def get_model():
    global _model

    if _model is None:
        if not MODEL_PATH.exists():
            raise FileNotFoundError(f"Production model not found: {MODEL_PATH}")

        package = joblib.load(MODEL_PATH)
        _model = package["model"]

    return _model


def predict_lst(NDVI, NDBI, NDWI, albedo, elevation, slope, landcover):
    features = pd.DataFrame([[
        NDVI, NDBI, NDWI, albedo,
        elevation, slope, landcover
    ]], columns=MODEL_FEATURES)

    return float(get_model().predict(features)[0])


def load_production_predictions():
    if not PREDICTIONS_PATH.exists():
        raise FileNotFoundError(
            f"Prediction dataset not found: {PREDICTIONS_PATH}"
        )

    return pd.read_parquet(PREDICTIONS_PATH)