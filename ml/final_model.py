from pathlib import Path
import joblib
import pandas as pd
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score

DATA = Path("data/processed/india_uhi_complete.parquet")
MODEL_DIR = Path("ml/models")
MODEL_DIR.mkdir(parents=True, exist_ok=True)

FEATURES = ["NDVI", "NDBI", "NDWI", "albedo", "elevation", "slope", "landcover"]
TARGET = "LST"

print("Loading dataset...")
df = pd.read_parquet(DATA)
df = df[df["sample_type"] == "Urban"].copy()
df = df.dropna(subset=FEATURES + [TARGET])

X = df[FEATURES]
y = df[TARGET]

print(f"Rows: {len(df):,}")
print(f"Cities: {df['city'].nunique()}")
print(f"Years: {sorted(df['year'].unique())}")
print(f"Features: {FEATURES}")

model = RandomForestRegressor(
    n_estimators=400,
    max_depth=18,
    min_samples_leaf=2,
    max_features="sqrt",
    n_jobs=-1,
    random_state=42
)

print("\nTraining production Random Forest...")
model.fit(X, y)

pred = model.predict(X)

print("\n" + "=" * 60)
print("PRODUCTION MODEL")
print("=" * 60)
print(f"Training MAE  : {mean_absolute_error(y, pred):.3f} °C")
print(f"Training RMSE : {mean_squared_error(y, pred) ** 0.5:.3f} °C")
print(f"Training R²   : {r2_score(y, pred):.4f}")

print("\nFEATURE IMPORTANCE")
for feature, importance in sorted(
    zip(FEATURES, model.feature_importances_),
    key=lambda x: x[1],
    reverse=True
):
    print(f"{feature:12s}: {importance:.4f}")

artifact = {
    "model": model,
    "features": FEATURES,
    "target": TARGET,
    "model_type": "RandomForestRegressor",
    "training_cities": sorted(df["city"].unique().tolist()),
    "training_years": sorted(df["year"].unique().tolist())
}

path = MODEL_DIR / "uhi_random_forest_production.joblib"
joblib.dump(artifact, path)

print(f"\nModel saved to:\n{path}")