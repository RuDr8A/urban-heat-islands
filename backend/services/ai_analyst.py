import os
import pandas as pd
import joblib
import shap

from dotenv import load_dotenv

from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.prompts import ChatPromptTemplate


# --------------------------------------------------
# LOAD ENVIRONMENT VARIABLES
# --------------------------------------------------

load_dotenv()


# --------------------------------------------------
# GEMINI MODEL
# --------------------------------------------------

llm = ChatGoogleGenerativeAI(
    model="gemini-3.5-flash",
    temperature=0.2,
    google_api_key=os.getenv("GEMINI_API_KEY")
)


# --------------------------------------------------
# LOAD DATA
# --------------------------------------------------

DATA_PATH = (
    "../data/processed/"
    "raipur_5year_processed.csv"
)

df = pd.read_csv(DATA_PATH)


# --------------------------------------------------
# LOAD XGBOOST MODEL
# --------------------------------------------------

MODEL_PATH = (
    "../ml/models/"
    "final_first_xgboost_environmental.pkl"
)

model = joblib.load(MODEL_PATH)


MODEL_FEATURES = [
    "NDVI",
    "NDBI",
    "NDWI"
]


# --------------------------------------------------
# SHAP EXPLAINER
# --------------------------------------------------

shap_explainer = shap.TreeExplainer(
    model
)


# --------------------------------------------------
# FIND NEAREST LOCATION
# --------------------------------------------------

def find_nearest_location(
    latitude: float,
    longitude: float
):

    distances = (
        (df["latitude"] - latitude) ** 2
        +
        (df["longitude"] - longitude) ** 2
    )

    nearest_index = distances.idxmin()

    nearest_latitude = df.loc[
        nearest_index,
        "latitude"
    ]

    nearest_longitude = df.loc[
        nearest_index,
        "longitude"
    ]

    location_data = df[
        (
            df["latitude"]
            == nearest_latitude
        )
        &
        (
            df["longitude"]
            == nearest_longitude
        )
    ].sort_values("Year")

    return location_data


# --------------------------------------------------
# GET CITY STATISTICS
# --------------------------------------------------

def get_city_statistics(year: int):

    year_data = df[
        df["Year"] == year
    ]

    if year_data.empty:

        return None

    return {
        "year": year,

        "mean_LST": float(
            year_data["LST"].mean()
        ),

        "min_LST": float(
            year_data["LST"].min()
        ),

        "max_LST": float(
            year_data["LST"].max()
        ),

        "mean_NDVI": float(
            year_data["NDVI"].mean()
        ),

        "mean_NDBI": float(
            year_data["NDBI"].mean()
        ),

        "mean_NDWI": float(
            year_data["NDWI"].mean()
        )
    }


# --------------------------------------------------
# GET LOCATION HISTORY
# --------------------------------------------------

def get_location_history(
    latitude: float,
    longitude: float
):

    location_data = find_nearest_location(
        latitude,
        longitude
    )

    if location_data.empty:

        return None

    records = []

    for _, row in location_data.iterrows():

        records.append({

            "year": int(row["Year"]),

            "LST": float(row["LST"]),

            "NDVI": float(row["NDVI"]),

            "NDBI": float(row["NDBI"]),

            "NDWI": float(row["NDWI"])

        })

    return records


# --------------------------------------------------
# PREDICT LST
# --------------------------------------------------

def predict_lst(
    NDVI: float,
    NDBI: float,
    NDWI: float
):

    features = pd.DataFrame(
        [[
            NDVI,
            NDBI,
            NDWI
        ]],
        columns=MODEL_FEATURES
    )

    prediction = model.predict(
        features
    )[0]

    return float(prediction)


# --------------------------------------------------
# GET SHAP EXPLANATION
# --------------------------------------------------

def explain_prediction(
    NDVI: float,
    NDBI: float,
    NDWI: float
):

    features = pd.DataFrame(
        [[
            NDVI,
            NDBI,
            NDWI
        ]],
        columns=MODEL_FEATURES
    )

    prediction = float(
        model.predict(features)[0]
    )

    explanation = shap_explainer(
        features
    )

    shap_values = explanation.values[0]

    contributions = {}

    for feature, value in zip(
        MODEL_FEATURES,
        shap_values
    ):

        contributions[feature] = float(
            value
        )

    base_value = float(
        explanation.base_values[0]
    )

    return {
        "prediction": prediction,
        "base_value": base_value,
        "contributions": contributions
    }


# --------------------------------------------------
# BUILD DATA CONTEXT FOR GEMINI
# --------------------------------------------------

def build_location_context(
    latitude: float,
    longitude: float
):

    history = get_location_history(
        latitude,
        longitude
    )

    if not history:

        return {
            "error":
                "No matching location found."
        }


    latest = history[-1]

    earliest = history[0]


    lst_change = (
        latest["LST"]
        -
        earliest["LST"]
    )

    ndvi_change = (
        latest["NDVI"]
        -
        earliest["NDVI"]
    )

    ndbi_change = (
        latest["NDBI"]
        -
        earliest["NDBI"]
    )

    ndwi_change = (
        latest["NDWI"]
        -
        earliest["NDWI"]
    )


    prediction = predict_lst(
        latest["NDVI"],
        latest["NDBI"],
        latest["NDWI"]
    )


    explanation = explain_prediction(
        latest["NDVI"],
        latest["NDBI"],
        latest["NDWI"]
    )


    return {

        "location": {
            "latitude": latitude,
            "longitude": longitude
        },

        "historical_data": history,

        "changes_2022_to_2026": {

            "LST": lst_change,

            "NDVI": ndvi_change,

            "NDBI": ndbi_change,

            "NDWI": ndwi_change

        },

        "latest_data": latest,

        "ML_prediction": prediction,

        "SHAP_explanation": explanation

    }


# --------------------------------------------------
# AI ANALYST
# --------------------------------------------------

def analyze_location(
    question: str,
    latitude: float,
    longitude: float
):

    context = build_location_context(
        latitude,
        longitude
    )


    if "error" in context:

        return context


    system_prompt = """
You are an Urban Heat Intelligence Analyst.

You analyze satellite-derived environmental
indicators and machine-learning results for
Raipur, India.

You MUST base your answer on the supplied data.

Available indicators:

- LST = Land Surface Temperature
- NDVI = vegetation indicator
- NDBI = built-up indicator
- NDWI = water/moisture indicator

The ML model is an XGBoost regression model
trained to predict LST using NDVI, NDBI and NDWI.

SHAP values explain how each feature contributed
to the specific ML prediction.

Important rules:

1. Do not invent measurements.
2. Do not invent satellite observations.
3. Do not claim causation from correlation alone.
4. Clearly distinguish observed LST from predicted LST.
5. If the data is insufficient, say so.
6. Keep the answer understandable to an urban
   planning or environmental audience.
7. Give a concise analysis followed by useful
   observations.
8. When discussing SHAP, explain positive values
   as pushing the prediction upward and negative
   values as pushing it downward relative to the
   model baseline.

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
Here is the actual data for the selected
Raipur location:

{context}

User question:

{question}

Analyze the question using only the supplied
data.
"""
        )

    ])


    chain = (
        prompt
        |
        llm
    )


    response = chain.invoke({

        "context": str(context),

        "question": question

    })


    return {

        "answer": response.content,

        "location": context["location"],

        "data": context

    }