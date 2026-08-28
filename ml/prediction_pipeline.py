from pathlib import Path
import joblib
import pandas as pd
import numpy as np

DATA = Path("data/processed/india_uhi_complete.parquet")
MODEL = Path("ml/models/uhi_random_forest_production.joblib")
OUTPUT = Path("ml/outputs/predictions/production_predictions.parquet")
OUTPUT.parent.mkdir(parents=True, exist_ok=True)

print("Loading dataset...")
df = pd.read_parquet(DATA)
df = df[df["sample_type"] == "Urban"].copy()

artifact = joblib.load(MODEL)
model = artifact["model"]
features = artifact["features"]

print(f"Rows: {len(df):,}")
print(f"Features: {features}")

X = df[features]
df["predicted_LST"] = model.predict(X)
df["prediction_error"] = df["LST"] - df["predicted_LST"]

df = df[[
    "sample_id", "city", "year", "latitude", "longitude",
    "LST", "predicted_LST", "prediction_error",
    "NDVI", "NDBI", "NDWI", "albedo",
    "elevation", "slope", "landcover"
]]

df.to_parquet(OUTPUT, index=False)

print("\n" + "=" * 60)
print("PREDICTION PIPELINE COMPLETE")
print("=" * 60)
print(f"Rows: {len(df):,}")
print(f"Cities: {df['city'].nunique()}")
print(f"Years: {sorted(df['year'].unique())}")
print(f"Mean absolute error: {df['prediction_error'].abs().mean():.3f} °C")
print(f"Output:\n{OUTPUT}")