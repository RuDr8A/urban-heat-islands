from pathlib import Path
import pandas as pd
import numpy as np

INPUT = Path("ml/outputs/predictions/production_predictions.parquet")
OUTPUT_DIR = Path("ml/outputs/uhi")
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

print("Loading predictions...")
df = pd.read_parquet(INPUT)

def risk_category(p):
    if p >= 80:
        return "Very High"
    if p >= 60:
        return "High"
    if p >= 40:
        return "Moderate"
    return "Low"

print(f"Rows: {len(df):,}")

# Calculate temperature percentile within each city/year
df["LST_percentile"] = df.groupby(
    ["city", "year"]
)["LST"].rank(pct=True) * 100

df["risk_category"] = df["LST_percentile"].apply(risk_category)

# Numerical risk score: 0-100
df["risk_score"] = df["LST_percentile"].round(2)

# Hotspot = top 20% of thermal observations
df["is_hotspot"] = df["LST_percentile"] >= 80

# Count hotspot years for each persistent spatial cell
hotspot_counts = (
    df.groupby(["city", "sample_id"])
    .agg(
        hotspot_years=("is_hotspot", "sum"),
        mean_LST=("LST", "mean"),
        max_LST=("LST", "max"),
        mean_risk=("risk_score", "mean"),
        latitude=("latitude", "first"),
        longitude=("longitude", "first")
    )
    .reset_index()
)

hotspot_counts["persistence"] = (
    hotspot_counts["hotspot_years"] / 5 * 100
)

def persistence_category(x):
    if x >= 80:
        return "Persistent"
    if x >= 60:
        return "Frequent"
    if x >= 40:
        return "Occasional"
    return "Rare"

hotspot_counts["persistence_category"] = (
    hotspot_counts["persistence"].apply(persistence_category)
)

# City/year summary
summary = (
    df.groupby(["city", "year"])
    .agg(
        cells=("sample_id", "count"),
        mean_LST=("LST", "mean"),
        median_LST=("LST", "median"),
        max_LST=("LST", "max"),
        mean_risk=("risk_score", "mean"),
        high_risk_cells=("is_hotspot", "sum")
    )
    .reset_index()
)

summary["high_risk_fraction"] = (
    summary["high_risk_cells"] / summary["cells"]
)

# Save outputs
df.to_parquet(
    OUTPUT_DIR / "thermal_risk_cells.parquet",
    index=False
)

hotspot_counts.to_parquet(
    OUTPUT_DIR / "persistent_hotspots.parquet",
    index=False
)

summary.to_csv(
    OUTPUT_DIR / "city_thermal_summary.csv",
    index=False
)

print("\n" + "=" * 60)
print("THERMAL RISK ENGINE COMPLETE")
print("=" * 60)

print(f"Thermal cells: {len(df):,}")
print(f"Cities: {df['city'].nunique()}")
print(f"Years: {df['year'].nunique()}")
print(f"Hotspot observations: {df['is_hotspot'].sum():,}")

print("\nRISK DISTRIBUTION:")
print(df["risk_category"].value_counts())

print("\nPERSISTENT HOTSPOTS:")
print(
    hotspot_counts["persistence_category"]
    .value_counts()
)

print("\nSaved:")
print(OUTPUT_DIR / "thermal_risk_cells.parquet")
print(OUTPUT_DIR / "persistent_hotspots.parquet")
print(OUTPUT_DIR / "city_thermal_summary.csv")