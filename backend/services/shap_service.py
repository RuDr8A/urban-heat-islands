import joblib
import shap
import pandas as pd


model = joblib.load(
    "model/first_prediction_model.pkl"
)

explainer = shap.TreeExplainer(model)


def explain_prediction(
    ndvi,
    ndbi,
    ndwi,
    latitude,
    longitude
):

    features = pd.DataFrame(
        [[
            ndvi,
            ndbi,
            ndwi,
            latitude,
            longitude
        ]],
        columns=[
            "NDVI",
            "NDBI",
            "NDWI",
            "latitude",
            "longitude"
        ]
    )

    shap_values = explainer.shap_values(
        features
    )

    values = shap_values[0]

    explanation = []

    for feature, value in zip(
        features.columns,
        values
    ):

        explanation.append({
            "feature": feature,
            "contribution": float(value)
        })

    return explanation