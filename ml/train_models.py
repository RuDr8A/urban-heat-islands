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


# =========================
# CONFIG
# =========================

DATA_FILE = Path("data/processed/india_uhi_complete.parquet")
MODEL_DIR = Path("models")
OUTPUT_DIR = Path("outputs")
METRIC_DIR = OUTPUT_DIR / "metrics"
PRED_DIR = OUTPUT_DIR / "predictions"

MODEL_DIR.mkdir(parents=True, exist_ok=True)
METRIC_DIR.mkdir(parents=True, exist_ok=True)
PRED_DIR.mkdir(parents=True, exist_ok=True)

TARGET = "LST"

BASE_FEATURES = ["NDVI", "NDBI", "elevation"]

ENHANCED_FEATURES = [
    "NDVI", "NDBI", "NDWI", "albedo",
    "elevation", "slope", "landcover"
]

TEST_CITIES = ["Raipur", "Mumbai", "Jaipur", "Bengaluru"]

RANDOM_STATE = 42


# =========================
# LOAD DATA
# =========================

print("Loading dataset...")

df = pd.read_parquet(DATA_FILE)

print(f"Rows: {len(df):,}")
print(f"Cells: {df['sample_id'].nunique():,}")

df = df[
    (df["sample_type"] == "Urban") &
    (df["city"] != "OTHER")
].copy()

print("\nAfter filtering:")
print(f"Urban rows: {len(df):,}")
print(f"Cities: {sorted(df['city'].unique())}")


# =========================
# MODEL FACTORIES
# =========================

def get_models():
    return {
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
            max_depth=None,
            min_samples_leaf=2,
            max_features="sqrt",
            random_state=RANDOM_STATE,
            n_jobs=-1
        ),
        "ExtraTrees": ExtraTreesRegressor(
            n_estimators=300,
            max_depth=None,
            min_samples_leaf=2,
            max_features=1.0,
            random_state=RANDOM_STATE,
            n_jobs=-1
        )
    }


# =========================
# PREPROCESSOR
# =========================

def build_pipeline(model, features):
    categorical = ["landcover"] if "landcover" in features else []
    numerical = [f for f in features if f not in categorical]

    transformers = [
        ("num", "passthrough", numerical)
    ]

    if categorical:
        transformers.append(
            ("cat", OneHotEncoder(
                handle_unknown="ignore",
                sparse_output=False
            ), categorical)
        )

    preprocessor = ColumnTransformer(
        transformers=transformers,
        remainder="drop"
    )

    return Pipeline([
        ("preprocessor", preprocessor),
        ("model", model)
    ])


# =========================
# EXPERIMENT
# =========================

results = []
all_predictions = []

feature_sets = {
    "baseline_3_features": BASE_FEATURES,
    "enhanced_7_features": ENHANCED_FEATURES
}

for feature_name, features in feature_sets.items():

    print("\n" + "=" * 70)
    print(f"FEATURE SET: {feature_name}")
    print("=" * 70)
    print("Features:", features)

    for test_city in TEST_CITIES:

        print("\n" + "-" * 60)
        print(f"TEST CITY: {test_city}")
        print("-" * 60)

        train_df = df[df["city"] != test_city].copy()
        test_df = df[df["city"] == test_city].copy()

        X_train = train_df[features]
        y_train = train_df[TARGET]

        X_test = test_df[features]
        y_test = test_df[TARGET]

        print(f"Training rows: {len(train_df):,}")
        print(f"Testing rows:  {len(test_df):,}")

        # Mean baseline
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

        results.append({
            "feature_set": feature_name,
            "model": "MeanBaseline",
            "test_city": test_city,
            "MAE": baseline_mae,
            "RMSE": baseline_rmse,
            "R2": baseline_r2,
            "train_rows": len(train_df),
            "test_rows": len(test_df)
        })

        print(
            f"Baseline -> MAE: {baseline_mae:.3f}, "
            f"RMSE: {baseline_rmse:.3f}, "
            f"R²: {baseline_r2:.4f}"
        )

        # ML models
        for model_name, model in get_models().items():

            print(f"\nTraining {model_name}...")

            pipeline = build_pipeline(
                model,
                features
            )

            pipeline.fit(
                X_train,
                y_train
            )

            predictions = pipeline.predict(
                X_test
            )

            mae = mean_absolute_error(
                y_test,
                predictions
            )

            rmse = np.sqrt(
                mean_squared_error(
                    y_test,
                    predictions
                )
            )

            r2 = r2_score(
                y_test,
                predictions
            )

            print(
                f"{model_name} -> "
                f"MAE: {mae:.3f}, "
                f"RMSE: {rmse:.3f}, "
                f"R²: {r2:.4f}"
            )

            results.append({
                "feature_set": feature_name,
                "model": model_name,
                "test_city": test_city,
                "MAE": mae,
                "RMSE": rmse,
                "R2": r2,
                "train_rows": len(train_df),
                "test_rows": len(test_df)
            })

            prediction_df = test_df[
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

            prediction_df["predicted_LST"] = predictions
            prediction_df["absolute_error"] = (
                prediction_df["LST"] -
                prediction_df["predicted_LST"]
            ).abs()

            prediction_df["feature_set"] = feature_name
            prediction_df["model"] = model_name

            all_predictions.append(
                prediction_df
            )

            # Save individual model
            model_file = (
                MODEL_DIR /
                f"{model_name.lower()}_{feature_name}_{test_city.lower()}.joblib"
            )

            joblib.dump(
                pipeline,
                model_file
            )


# =========================
# RESULTS DATAFRAME
# =========================

results_df = pd.DataFrame(results)

predictions_df = pd.concat(
    all_predictions,
    ignore_index=True
)


# =========================
# SAVE RESULTS
# =========================

results_file = (
    METRIC_DIR /
    "model_comparison_by_city.csv"
)

results_df.to_csv(
    results_file,
    index=False
)

predictions_file = (
    PRED_DIR /
    "all_model_predictions.parquet"
)

predictions_df.to_parquet(
    predictions_file,
    index=False
)


# =========================
# OVERALL MODEL COMPARISON
# =========================

overall = (
    results_df[
        results_df["model"] != "MeanBaseline"
    ]
    .groupby(
        ["feature_set", "model"]
    )[["MAE", "RMSE", "R2"]]
    .mean()
    .reset_index()
    .sort_values("MAE")
)

overall_file = (
    METRIC_DIR /
    "model_comparison_overall.csv"
)

overall.to_csv(
    overall_file,
    index=False
)


# =========================
# PRINT RESULTS
# =========================

print("\n" + "=" * 70)
print("RESULTS BY CITY")
print("=" * 70)

print(
    results_df.round(4).to_string(index=False)
)

print("\n" + "=" * 70)
print("OVERALL MODEL COMPARISON")
print("=" * 70)

print(
    overall.round(4).to_string(index=False)
)

# =========================
# BEST MODEL
# =========================

best = overall.iloc[0]

print("\n" + "=" * 70)
print("BEST MODEL")
print("=" * 70)

print(f"Feature set: {best['feature_set']}")
print(f"Model:       {best['model']}")
print(f"Mean MAE:    {best['MAE']:.4f} °C")
print(f"Mean RMSE:   {best['RMSE']:.4f} °C")
print(f"Mean R²:     {best['R2']:.4f}")

print("\nSaved:")
print(results_file)
print(overall_file)
print(predictions_file)

print("\nTraining complete.")