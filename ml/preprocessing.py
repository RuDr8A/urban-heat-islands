import pandas as pd
from pathlib import Path

INPUT = Path("data/processed/india_uhi_master_v2.parquet")
CLEAN = Path("./data/processed/india_uhi_clean.parquet")
COMPLETE = Path("./data/processed/india_uhi_complete.parquet")

REQUIRED = [
    "sample_id", "city", "year", "latitude", "longitude",
    "sample_type", "LST", "NDVI", "NDBI", "NDWI",
    "albedo", "elevation", "slope", "landcover"
]

print("Loading dataset...")
df = pd.read_parquet(INPUT)
print(f"Original rows: {len(df):,}")
print(f"Original cells: {df['sample_id'].nunique():,}")

missing_cols = [c for c in REQUIRED if c not in df.columns]
if missing_cols:
    raise ValueError(f"Missing columns: {missing_cols}")

before = len(df)
df = df.drop_duplicates().copy()
print(f"Duplicate rows removed: {before - len(df):,}")

before = len(df)
df = df[df["LST"].between(15, 70)].copy()
print(f"Invalid LST rows removed: {before - len(df):,}")

for col in ["LST", "NDVI", "NDBI", "NDWI", "albedo", "elevation", "slope"]:
    df[col] = df[col].astype("float32")

df["year"] = df["year"].astype("int16")
df["landcover"] = df["landcover"].astype("int16")

CLEAN.parent.mkdir(parents=True, exist_ok=True)
df.to_parquet(CLEAN, index=False)

coverage = df.groupby("sample_id")["year"].nunique()
complete_ids = coverage[coverage == 5].index
complete = df[df["sample_id"].isin(complete_ids)].copy()
complete.to_parquet(COMPLETE, index=False)

print("\n" + "=" * 50)
print("PREPROCESSING COMPLETE")
print("=" * 50)
print(f"Clean rows:          {len(df):,}")
print(f"Clean cells:         {df['sample_id'].nunique():,}")
print(f"Complete cells:      {len(complete_ids):,}")
print(f"Complete rows:       {len(complete):,}")
print(f"Years:               {sorted(df['year'].unique())}")
print(f"Missing values:      {df.isna().sum().sum():,}")
print(f"Clean dataset:       {CLEAN}")
print(f"Complete dataset:    {COMPLETE}")