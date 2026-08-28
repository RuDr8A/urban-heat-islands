import pandas as pd
import numpy as np
from pathlib import Path
from sklearn.neighbors import BallTree

DATA_FILE = Path("data/processed/india_uhi_complete.parquet")
OUTPUT_DIR = Path("outputs/uhi")
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

OUTPUT_FILE = OUTPUT_DIR / "india_uhi_analysis.parquet"
CITY_SUMMARY_FILE = OUTPUT_DIR / "city_uhi_summary.csv"

RADIUS_KM = 5.0
MIN_REFERENCE_POINTS = 3
EPSILON = 0.001

print("Loading dataset...")
df = pd.read_parquet(DATA_FILE)

print(f"Rows: {len(df):,}")
print(f"Cells: {df['sample_id'].nunique():,}")

# ---------------------------------------------------------
# Keep only named cities
# ---------------------------------------------------------

df = df[df["city"] != "OTHER"].copy()

print(f"Rows after removing OTHER: {len(df):,}")
print(f"Cities: {sorted(df['city'].unique())}")

# ---------------------------------------------------------
# Separate urban/reference observations
# ---------------------------------------------------------

urban = df[df["sample_type"] == "Urban"].copy()
reference = df[df["sample_type"] == "Reference"].copy()

print(f"Urban rows:     {len(urban):,}")
print(f"Reference rows: {len(reference):,}")

# ---------------------------------------------------------
# Haversine distance helper
# ---------------------------------------------------------

def calculate_local_reference(urban_df, reference_df):
    if len(reference_df) == 0 or len(urban_df) == 0:
        return np.full(len(urban_df), np.nan)

    ref_coords = np.radians(
        reference_df[["latitude", "longitude"]].to_numpy(dtype=float)
    )
    urban_coords = np.radians(
        urban_df[["latitude", "longitude"]].to_numpy(dtype=float)
    )

    ref_lst = reference_df["LST"].to_numpy(dtype=float)

    tree = BallTree(ref_coords, metric="haversine")
    radius = RADIUS_KM / 6371.0088

    distances, indices = tree.query_radius(
        urban_coords,
        r=radius,
        return_distance=True,
        sort_results=True
    )

    local_reference = np.full(
        len(urban_df),
        np.nan,
        dtype=float
    )

    for i in range(len(urban_df)):
        dists = np.asarray(distances[i], dtype=float)
        idxs = np.asarray(indices[i], dtype=int)

        if idxs.size < MIN_REFERENCE_POINTS:
            continue

        values = ref_lst[idxs]

        valid = np.isfinite(values) & np.isfinite(dists)

        if valid.sum() < MIN_REFERENCE_POINTS:
            continue

        dists = dists[valid] * 6371.0088
        values = values[valid]

        weights = 1.0 / (dists + EPSILON)

        local_reference[i] = np.sum(
            weights * values
        ) / np.sum(weights)

    return local_reference


# ---------------------------------------------------------
# Calculate UHI separately for every city/year
# ---------------------------------------------------------

results = []

cities = sorted(urban["city"].unique())
years = sorted(urban["year"].unique())

for city in cities:

    print("\n" + "=" * 60)
    print(f"CITY: {city}")
    print("=" * 60)

    for year in years:

        urban_subset = urban[
            (urban["city"] == city) &
            (urban["year"] == year)
        ].copy()

        reference_subset = reference[
            (reference["city"] == city) &
            (reference["year"] == year)
        ].copy()

        if len(urban_subset) == 0:
            continue

        if len(reference_subset) < MIN_REFERENCE_POINTS:
            print(
                f"{year}: insufficient reference points "
                f"({len(reference_subset)})"
            )
            urban_subset["local_reference_LST"] = np.nan
            urban_subset["UHI"] = np.nan
        else:
            urban_subset["local_reference_LST"] = (
                calculate_local_reference(
                    urban_subset,
                    reference_subset
                )
            )

            urban_subset["UHI"] = (
                urban_subset["LST"] -
                urban_subset["local_reference_LST"]
            )

        urban_subset["reference_count"] = len(
            reference_subset
        )

        results.append(urban_subset)

        valid_uhi = urban_subset["UHI"].dropna()

        if len(valid_uhi):
            print(
                f"{year}: "
                f"urban={len(urban_subset):,}, "
                f"reference={len(reference_subset):,}, "
                f"UHI mean={valid_uhi.mean():.2f}°C, "
                f"median={valid_uhi.median():.2f}°C"
            )


# ---------------------------------------------------------
# Combine
# ---------------------------------------------------------

uhi = pd.concat(
    results,
    ignore_index=True
)

# ---------------------------------------------------------
# UHI percentiles
# ---------------------------------------------------------

uhi["UHI_percentile"] = (
    uhi.groupby("year")["UHI"]
    .rank(pct=True) * 100
)

# ---------------------------------------------------------
# UHI categories
#
# Based on intensity relative to local background.
# ---------------------------------------------------------

def classify_uhi(value):
    if pd.isna(value):
        return "Unknown"
    if value < 0:
        return "Cooler"
    if value < 1:
        return "Low"
    if value < 2:
        return "Moderate"
    if value < 4:
        return "High"
    return "Very High"

uhi["UHI_category"] = (
    uhi["UHI"]
    .apply(classify_uhi)
)

# ---------------------------------------------------------
# Temporal UHI features
# ---------------------------------------------------------

uhi_sorted = uhi.sort_values(
    ["sample_id", "year"]
).copy()

uhi_sorted["UHI_change_from_previous_year"] = (
    uhi_sorted.groupby("sample_id")["UHI"]
    .diff()
)

uhi_sorted["UHI_change_2022_2026"] = (
    uhi_sorted.groupby("sample_id")["UHI"]
    .transform(
        lambda x: (
            x.iloc[-1] - x.iloc[0]
            if x.notna().sum() >= 2
            else np.nan
        )
    )
)

# ---------------------------------------------------------
# Persistence
#
# Number of years with UHI >= 2°C.
# ---------------------------------------------------------

uhi_sorted["high_UHI_year"] = (
    uhi_sorted["UHI"] >= 2.0
)

persistence = (
    uhi_sorted.groupby("sample_id")["high_UHI_year"]
    .transform("sum")
)

uhi_sorted["high_UHI_years"] = persistence

# ---------------------------------------------------------
# Persistent hotspot
# ---------------------------------------------------------

uhi_sorted["persistent_hotspot"] = (
    uhi_sorted["high_UHI_years"] >= 3
)

# ---------------------------------------------------------
# Save complete UHI dataset
# ---------------------------------------------------------

uhi_sorted.to_parquet(
    OUTPUT_FILE,
    index=False
)

# ---------------------------------------------------------
# City/year summary
# ---------------------------------------------------------

summary = (
    uhi_sorted
    .groupby(["city", "year"])
    .agg(
        urban_cells=("sample_id", "nunique"),
        valid_UHI_cells=("UHI", "count"),
        mean_LST=("LST", "mean"),
        mean_reference_LST=(
            "local_reference_LST",
            "mean"
        ),
        mean_UHI=("UHI", "mean"),
        median_UHI=("UHI", "median"),
        max_UHI=("UHI", "max"),
        high_UHI_fraction=(
            "UHI",
            lambda x: (x >= 2).mean()
        )
    )
    .reset_index()
)

summary.to_csv(
    CITY_SUMMARY_FILE,
    index=False
)

# ---------------------------------------------------------
# Final statistics
# ---------------------------------------------------------

print("\n" + "=" * 60)
print("UHI ANALYSIS COMPLETE")
print("=" * 60)

print(f"UHI rows: {len(uhi_sorted):,}")
print(
    f"Valid UHI rows: "
    f"{uhi_sorted['UHI'].notna().sum():,}"
)
print(
    f"Missing UHI rows: "
    f"{uhi_sorted['UHI'].isna().sum():,}"
)

print("\nUHI categories:")
print(
    uhi_sorted["UHI_category"]
    .value_counts()
)

print("\nCity/year summary:")
print(
    summary.round(3).to_string(index=False)
)

print("\nSaved:")
print(OUTPUT_FILE)
print(CITY_SUMMARY_FILE)