import pandas as pd
import numpy as np
import joblib
from pathlib import Path

from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import OneHotEncoder
from sklearn.pipeline import Pipeline
from sklearn.ensemble import RandomForestRegressor, ExtraTreesRegressor
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
from xgboost import XGBRegressor

DATA_FILE = Path("data/processed/india_uhi_complete.parquet")
MODEL_DIR = Path("models")
OUTPUT_DIR = Path("outputs")
METRIC_DIR = OUTPUT_DIR / "metrics"
PRED_DIR = OUTPUT_DIR / "predictions"

MODEL_DIR.mkdir(parents=True, exist_ok=True)
METRIC_DIR.mkdir(parents=True, exist_ok=True)
PRED_DIR.mkdir(parents=True, exist_ok=True)

TARGET = "LST"
FEATURES = ["NDVI", "NDBI", "NDWI", "albedo", "elevation", "slope", "landcover"]
RANDOM_STATE = 42

print("Loading dataset...")
df = pd.read_parquet(DATA_FILE)

df = df[
    (df["sample_type"] == "Urban") &
    (df["city"] != "OTHER")
].copy()

print(f"Rows: {len(df):,}")
print(f"Cities: {df['city'].nunique()}")
print(f"Years: {sorted(df['year'].unique())}")

train_df = df[df["year"].isin([2022, 2023, 2024])].copy()
val_df = df[df["year"] == 2025].copy()
test_df = df[df["year"] == 2026].copy()

print("\n" + "=" * 60)
print("TEMPORAL SPLIT")
print("=" * 60)
print(f"Training years:   2022-2024")
print(f"Training rows:    {len(train_df):,}")
print(f"Validation year:  2025")
print(f"Validation rows:  {len(val_df):,}")
print(f"Test year:        2026")
print(f"Test rows:        {len(test_df):,}")

X_train = train_df[FEATURES]
y_train = train_df[TARGET]

X_val = val_df[FEATURES]
y_val = val_df[TARGET]

X_test = test_df[FEATURES]
y_test = test_df[TARGET]

categorical = ["landcover"]
numerical = [f for f in FEATURES if f not in categorical]

preprocessor = ColumnTransformer([
    ("num", "passthrough", numerical),
    ("cat", OneHotEncoder(handle_unknown="ignore", sparse_output=False), categorical)
])

models = {
    "XGBoost": XGBRegressor(
        n_estimators=500,
        max_depth=8,
        learning_rate=0.05,
        subsample=0.8,
        colsample_bytree=0.8,
        objective="reg:squarederror",
        random_state=RANDOM_STATE,
        n_jobs=-1
    ),
    "RandomForest": RandomForestRegressor(
        n_estimators=300,
        min_samples_leaf=2,
        max_features="sqrt",
        random_state=RANDOM_STATE,
        n_jobs=-1
    ),
    "ExtraTrees": ExtraTreesRegressor(
        n_estimators=300,
        min_samples_leaf=2,
        max_features=1.0,
        random_state=RANDOM_STATE,
        n_jobs=-1
    )
}

results = []
test_predictions = []

for model_name, model in models.items():
    print("\n" + "=" * 60)
    print(f"TRAINING {model_name}")
    print("=" * 60)

    pipeline = Pipeline([
        ("preprocessor", preprocessor),
        ("model", model)
    ])

    pipeline.fit(X_train, y_train)

    val_pred = pipeline.predict(X_val)
    test_pred = pipeline.predict(X_test)

    val_mae = mean_absolute_error(y_val, val_pred)
    val_rmse = np.sqrt(mean_squared_error(y_val, val_pred))
    val_r2 = r2_score(y_val, val_pred)

    test_mae = mean_absolute_error(y_test, test_pred)
    test_rmse = np.sqrt(mean_squared_error(y_test, test_pred))
    test_r2 = r2_score(y_test, test_pred)

    print(
        f"Validation 2025 -> "
        f"MAE: {val_mae:.3f}, "
        f"RMSE: {val_rmse:.3f}, "
        f"R²: {val_r2:.4f}"
    )

    print(
        f"Test 2026       -> "
        f"MAE: {test_mae:.3f}, "
        f"RMSE: {test_rmse:.3f}, "
        f"R²: {test_r2:.4f}"
    )

    results.append({
        "model": model_name,
        "validation_year": 2025,
        "test_year": 2026,
        "val_MAE": val_mae,
        "val_RMSE": val_rmse,
        "val_R2": val_r2,
        "test_MAE": test_mae,
        "test_RMSE": test_rmse,
        "test_R2": test_r2
    })

    pred = test_df[
        [
            "sample_id",
            "city",
            "year",
            "latitude",
            "longitude",
            "sample_type",
            "LST"
        ]
    ].copy()

    pred["predicted_LST"] = test_pred
    pred["absolute_error"] = (
        pred["LST"] - pred["predicted_LST"]
    ).abs()
    pred["model"] = model_name

    test_predictions.append(pred)

    model_file = MODEL_DIR / f"{model_name.lower()}_temporal_2022_2026.joblib"
    joblib.dump(pipeline, model_file)

results_df = pd.DataFrame(results)
predictions_df = pd.concat(test_predictions, ignore_index=True)

results_file = METRIC_DIR / "temporal_model_comparison.csv"
predictions_file = PRED_DIR / "temporal_predictions_2026.parquet"

results_df.to_csv(results_file, index=False)
predictions_df.to_parquet(predictions_file, index=False)

print("\n" + "=" * 60)
print("TEMPORAL MODEL COMPARISON")
print("=" * 60)
print(results_df.round(4).to_string(index=False))

best = results_df.sort_values("test_MAE").iloc[0]

print("\n" + "=" * 60)
print("BEST TEMPORAL MODEL")
print("=" * 60)
print(f"Model:     {best['model']}")
print(f"MAE:       {best['test_MAE']:.4f} °C")
print(f"RMSE:      {best['test_RMSE']:.4f} °C")
print(f"R²:        {best['test_R2']:.4f}")

print("\nSaved:")
print(results_file)
print(predictions_file)
print("Temporal validation complete.")