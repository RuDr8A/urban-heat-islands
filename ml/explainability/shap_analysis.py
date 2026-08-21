import shap
import joblib
import pandas as pd


model = joblib.load(
    "model/first_prediction_model.pkl"
)


explainer = shap.TreeExplainer(model)


sample = pd.DataFrame(
    {
        "NDVI":[0.10],
        "NDBI":[0.08],
        "NDWI":[-0.15],
        "latitude":[21.25],
        "longitude":[81.63]
    }
)


shap_values = explainer.shap_values(sample)


print(shap_values)