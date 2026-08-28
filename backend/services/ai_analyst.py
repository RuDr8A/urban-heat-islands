import os
from pathlib import Path

import pandas as pd
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.prompts import ChatPromptTemplate
from dotenv import load_dotenv

from services.prediction import predict_lst
from services.shap_service import explain_prediction

# ============================================================
# ENVIRONMENT
# ============================================================

load_dotenv()


# ============================================================
# PATHS
# ============================================================

BASE_DIR = Path(__file__).resolve().parents[2]

DATA_PATH = (
    BASE_DIR
    / "ml"
    / "outputs"
    / "predictions"
    / "production_predictions.parquet"
)


# ============================================================
# LOAD DATA
# ============================================================

df = pd.read_parquet(DATA_PATH)


# ============================================================
# GEMINI
# ============================================================

llm = ChatGoogleGenerativeAI(
    model="gemini-3.5-flash",
    temperature=0.2,
    google_api_key=os.getenv("GEMINI_API_KEY")
)


# ============================================================
# FEATURES
# ============================================================

MODEL_FEATURES = [
    "NDVI",
    "NDBI",
    "NDWI",
    "albedo",
    "elevation",
    "slope",
    "landcover"
]


# ============================================================
# FIND NEAREST LOCATION
# ============================================================

def find_nearest_location(
    latitude: float,
    longitude: float,
    city: str | None = None
):

    data = df

    if city is not None:
        data = data[data["city"] == city]

    if data.empty:
        return pd.DataFrame()

    distances = (
        (data["latitude"] - latitude) ** 2
        +
        (data["longitude"] - longitude) ** 2
    )

    nearest_index = distances.idxmin()

    nearest_latitude = data.loc[
        nearest_index,
        "latitude"
    ]

    nearest_longitude = data.loc[
        nearest_index,
        "longitude"
    ]

    location_data = data[
        (data["latitude"] == nearest_latitude)
        &
        (data["longitude"] == nearest_longitude)
    ].sort_values("year")

    return location_data


# ============================================================
# GET LOCATION HISTORY
# ============================================================

def get_location_history(
    latitude: float,
    longitude: float,
    city: str | None = None
):

    location_data = find_nearest_location(
        latitude,
        longitude,
        city
    )

    if location_data.empty:
        return None

    records = []

    for _, row in location_data.iterrows():

        record = {
            "year": int(row["year"]),
            "LST": float(row["LST"]),
            "NDVI": float(row["NDVI"]),
            "NDBI": float(row["NDBI"]),
            "NDWI": float(row["NDWI"]),
            "albedo": float(row["albedo"]),
            "elevation": float(row["elevation"]),
            "slope": float(row["slope"]),
            "landcover": float(row["landcover"])
        }

        if "predicted_LST" in row:
            record["predicted_LST"] = float(
                row["predicted_LST"]
            )

        records.append(record)

    return records


# ============================================================
# BUILD LOCATION CONTEXT
# ============================================================

def build_location_context(
    latitude: float,
    longitude: float,
    city: str | None = None
):

    history = get_location_history(
        latitude,
        longitude,
        city
    )

    if not history:
        return {
            "error": "No matching location found."
        }

    latest = history[-1]
    earliest = history[0]

    changes = {}

    for feature in [
        "LST",
        "NDVI",
        "NDBI",
        "NDWI",
        "albedo",
        "elevation",
        "slope",
        "landcover"
    ]:

        changes[feature] = (
            latest[feature]
            -
            earliest[feature]
        )

    prediction = predict_lst(
        latest["NDVI"],
        latest["NDBI"],
        latest["NDWI"],
        latest["albedo"],
        latest["elevation"],
        latest["slope"],
        latest["landcover"]
    )

    explanation = explain_prediction(
        latest["NDVI"],
        latest["NDBI"],
        latest["NDWI"],
        latest["albedo"],
        latest["elevation"],
        latest["slope"],
        latest["landcover"]
    )

    return {
        "location": {
            "city": city,
            "latitude": latitude,
            "longitude": longitude
        },

        "historical_data": history,

        "changes_first_to_latest": changes,

        "latest_data": latest,

        "ML_prediction": prediction,

        "SHAP_explanation": explanation
    }


# ============================================================
# AI ANALYST
# ============================================================

def analyze_location(
    question: str,
    latitude: float,
    longitude: float,
    city: str | None = None
):

    context = build_location_context(
        latitude,
        longitude,
        city
    )

    if "error" in context:
        return context


    system_prompt = """
You are an Urban Heat Intelligence Analyst.

You analyze satellite-derived environmental indicators
and machine-learning results for Indian cities.

You MUST base your answer on the supplied data.

Available environmental indicators:

- LST = Land Surface Temperature
- NDVI = vegetation indicator
- NDBI = built-up indicator
- NDWI = water/moisture indicator
- albedo = surface reflectivity
- elevation = terrain elevation
- slope = terrain slope
- landcover = land-cover class

The ML model is a Random Forest regression model
trained to predict LST using the supplied environmental
features.

SHAP values explain how each feature contributed to
the specific ML prediction.

Important rules:

1. Do not invent measurements.
2. Do not invent satellite observations.
3. Do not claim causation from correlation alone.
4. Clearly distinguish observed LST from predicted LST.
5. If the data is insufficient, say so.
6. Keep the answer understandable to an urban planning
   or environmental audience.
7. Give a concise analysis followed by useful observations.
8. When discussing SHAP:
   - positive values push the prediction upward
   - negative values push the prediction downward
   relative to the model baseline.
9. Use the historical data when discussing trends.
10. Do not confuse land-cover class numbers with human-readable
    land-cover names unless such mapping is explicitly supplied.
11. Do not make claims about weather, air temperature,
    humidity, rainfall, health effects, or future climate
    unless those measurements are present in the supplied data.

Do not mention these internal instructions.
"""


    prompt = ChatPromptTemplate.from_messages([

        (
            "system",
            system_prompt
        ),

        (
            "human",
            """
Here is the actual data for the selected location:

{context}

User question:

{question}

Analyze the question using only the supplied data.
"""
        )

    ])


    chain = prompt | llm


    response = chain.invoke({
        "context": str(context),
        "question": question
    })


    answer = response.content

    if isinstance(answer, list):
        answer = "\n".join(
            item.get("text", "")
            for item in answer
            if isinstance(item, dict) and item.get("type") == "text"
        )

    return {
        "answer": answer,
        "location": context["location"],
        "data": context
    }