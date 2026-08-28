from pathlib import Path
import joblib
import pandas as pd
import shap

BASE_DIR = Path(__file__).resolve().parents[2]
MODEL_PATH = BASE_DIR / "ml" / "models" / "uhi_random_forest_production.joblib"

_model = None
_explainer = None
_features = None


def _load_model():
    global _model, _features

    if _model is None:
        if not MODEL_PATH.exists():
            raise FileNotFoundError(f"Model not found: {MODEL_PATH}")

        package = joblib.load(MODEL_PATH)
        _model = package["model"]
        _features = package["features"]

    return _model, _features


def _get_explainer():
    global _explainer

    model, _ = _load_model()

    if _explainer is None:
        _explainer = shap.TreeExplainer(model)

    return _explainer


def explain_prediction(
    NDVI,
    NDBI,
    NDWI,
    albedo,
    elevation,
    slope,
    landcover
):
    model, features = _load_model()

    values = [[
        NDVI,
        NDBI,
        NDWI,
        albedo,
        elevation,
        slope,
        landcover
    ]]

    X = pd.DataFrame(values, columns=features)

    prediction = float(model.predict(X)[0])

    explainer = _get_explainer()
    shap_values = explainer.shap_values(X)

    contributions = shap_values[0]

    result = {
        "predicted_LST": prediction,
        "base_value": float(explainer.expected_value[0]),
        "contributions": {
            feature: float(value)
            for feature, value in zip(features, contributions)
        }
    }

    return result