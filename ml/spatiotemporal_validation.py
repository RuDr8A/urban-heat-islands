import pandas as pd
import numpy as np
import joblib
from pathlib import Path

from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import OneHotEncoder
from sklearn.pipeline import Pipeline
from sklearn.ensemble import RandomForestRegressor, ExtraTreesRegressor
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
from sklearn.model_selection import GroupShuffleSplit
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
TEST_CITIES = ["Raipur", "Mumbai", "Jaipur", "Bengaluru"]

BLOCK_SIZE = 0.05
TEST_SIZE = 0.20
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

df["lat_block"] = np.floor(df["latitude"] / BLOCK_SIZE).astype(int)
df["lon_block"] = np.floor(df["longitude"] / BLOCK_SIZE).astype(int)

df["spatial_block"] = (
    df["city"].astype(str) + "_" +
    df["lat_block"].astype(str) + "_" +
    df["lon_block"].astype(str)
)

results = []
predictions = []

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

for city in TEST_CITIES:

    print("\n" + "=" * 70)
    print(f"SPATIO-TEMPORAL VALIDATION: {city}")
    print("=" * 70)

    city_df = df[df["city"] == city].copy()

    # ---------------------------------------------------------
    # Create spatial split using locations only
    # ---------------------------------------------------------

    unique_blocks = city_df[
        ["spatial_block"]
    ].drop_duplicates()

    splitter = GroupShuffleSplit(
        n_splits=1,
        test_size=TEST_SIZE,
        random_state=RANDOM_STATE
    )

    train_block_idx, test_block_idx = next(
        splitter.split(
            unique_blocks,
            groups=unique_blocks["spatial_block"]
        )
    )

    train_blocks = set(
        unique_blocks.iloc[train_block_idx]["spatial_block"]
    )

    test_blocks = set(
        unique_blocks.iloc[test_block_idx]["spatial_block"]
    )

    # ---------------------------------------------------------
    # Critical split:
    #
    # TRAIN = 2022-2025 + training spatial blocks
    # TEST  = 2026 + testing spatial blocks
    # ---------------------------------------------------------

    train_df = city_df[
        city_df["year"].isin([2022, 2023, 2024, 2025]) &
        city_df["spatial_block"].isin(train_blocks)
    ].copy()

    test_df = city_df[
        (city_df["year"] == 2026) &
        city_df["spatial_block"].isin(test_blocks)
    ].copy()

    print(f"Total city rows:       {len(city_df):,}")
    print(f"Training rows:         {len(train_df):,}")
    print(f"Testing rows:          {len(test_df):,}")
    print(f"Training blocks:       {len(train_blocks):,}")
    print(f"Testing blocks:        {len(test_blocks):,}")

    overlap = train_blocks & test_blocks
    print(f"Spatial block overlap: {len(overlap)}")

    print(
        f"Training years:        "
        f"{sorted(train_df['year'].unique())}"
    )

    print(
        f"Testing years:         "
        f"{sorted(test_df['year'].unique())}"
    )

    if len(overlap) != 0:
        raise RuntimeError(
            "Spatial leakage detected: training and testing blocks overlap."
        )

    if len(test_df) == 0:
        print("WARNING: No test observations for this city.")
        continue

    X_train = train_df[FEATURES]
    y_train = train_df[TARGET]

    X_test = test_df[FEATURES]
    y_test = test_df[TARGET]

    # ---------------------------------------------------------
    # Baseline
    # ---------------------------------------------------------

    baseline_pred = np.full(
        len(y_test),
        y_train.mean()
    )

    baseline_mae = mean_absolute_error(
        y_test,
        baseline_pred
    )

    baseline_rmse = np.sqrt(
        mean_squared_error(
            y_test,
            baseline_pred
        )
    )

    baseline_r2 = r2_score(
        y_test,
        baseline_pred
    )

    print(
        f"\nBaseline -> "
        f"MAE: {baseline_mae:.3f}, "
        f"RMSE: {baseline_rmse:.3f}, "
        f"R²: {baseline_r2:.4f}"
    )

    results.append({
        "city": city,
        "model": "MeanBaseline",
        "MAE": baseline_mae,
        "RMSE": baseline_rmse,
        "R2": baseline_r2,
        "train_rows": len(train_df),
        "test_rows": len(test_df),
        "train_blocks": len(train_blocks),
        "test_blocks": len(test_blocks)
    })

    # ---------------------------------------------------------
    # ML models
    # ---------------------------------------------------------

    for model_name, model in models.items():

        print(f"\nTraining {model_name}...")

        numerical = [
            "NDVI",
            "NDBI",
            "NDWI",
            "albedo",
            "elevation",
            "slope"
        ]

        categorical = ["landcover"]

        preprocessor = ColumnTransformer([
            ("num", "passthrough", numerical),
            (
                "cat",
                OneHotEncoder(
                    handle_unknown="ignore",
                    sparse_output=False
                ),
                categorical
            )
        ])

        pipeline = Pipeline([
            ("preprocessor", preprocessor),
            ("model", model)
        ])

        pipeline.fit(
            X_train,
            y_train
        )

        pred = pipeline.predict(
            X_test
        )

        mae = mean_absolute_error(
            y_test,
            pred
        )

        rmse = np.sqrt(
            mean_squared_error(
                y_test,
                pred
            )
        )

        r2 = r2_score(
            y_test,
            pred
        )

        print(
            f"{model_name} -> "
            f"MAE: {mae:.3f}, "
            f"RMSE: {rmse:.3f}, "
            f"R²: {r2:.4f}"
        )

        results.append({
            "city": city,
            "model": model_name,
            "MAE": mae,
            "RMSE": rmse,
            "R2": r2,
            "train_rows": len(train_df),
            "test_rows": len(test_df),
            "train_blocks": len(train_blocks),
            "test_blocks": len(test_blocks)
        })

        pred_df = test_df[
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

        pred_df["predicted_LST"] = pred
        pred_df["absolute_error"] = (
            pred_df["LST"] -
            pred_df["predicted_LST"]
        ).abs()

        pred_df["model"] = model_name

        predictions.append(pred_df)

        model_file = (
            MODEL_DIR /
            f"{model_name.lower()}_spatiotemporal_{city.lower()}.joblib"
        )

        joblib.dump(
            pipeline,
            model_file
        )


# =============================================================
# SAVE RESULTS
# =============================================================

results_df = pd.DataFrame(results)

predictions_df = pd.concat(
    predictions,
    ignore_index=True
)

results_file = (
    METRIC_DIR /
    "spatiotemporal_model_comparison_by_city.csv"
)

overall_file = (
    METRIC_DIR /
    "spatiotemporal_model_comparison_overall.csv"
)

predictions_file = (
    PRED_DIR /
    "spatiotemporal_predictions_2026.parquet"
)

results_df.to_csv(
    results_file,
    index=False
)

predictions_df.to_parquet(
    predictions_file,
    index=False
)


# =============================================================
# OVERALL RESULTS
# =============================================================

overall = (
    results_df[
        results_df["model"] != "MeanBaseline"
    ]
    .groupby("model")[["MAE", "RMSE", "R2"]]
    .mean()
    .reset_index()
    .sort_values("MAE")
)

overall.to_csv(
    overall_file,
    index=False
)


# =============================================================
# PRINT RESULTS
# =============================================================

print("\n" + "=" * 70)
print("SPATIO-TEMPORAL RESULTS BY CITY")
print("=" * 70)

print(
    results_df.round(4).to_string(index=False)
)

print("\n" + "=" * 70)
print("OVERALL SPATIO-TEMPORAL MODEL COMPARISON")
print("=" * 70)

print(
    overall.round(4).to_string(index=False)
)

best = overall.iloc[0]

print("\n" + "=" * 70)
print("BEST SPATIO-TEMPORAL MODEL")
print("=" * 70)

print(f"Model:     {best['model']}")
print(f"Mean MAE:  {best['MAE']:.4f} °C")
print(f"Mean RMSE: {best['RMSE']:.4f} °C")
print(f"Mean R²:   {best['R2']:.4f}")

print("\nSaved:")
print(results_file)
print(overall_file)
print(predictions_file)

print("\nSpatio-temporal validation complete.")