from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import pickle
import numpy as np

app = FastAPI(title="Urban Heat Intelligence API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load your ML Model
MODEL_PATH = "model/first_prediction_model.pkl"
try:
    with open(MODEL_PATH, "rb") as f:
        model = pickle.load(f)
    print("✅ ML Model loaded successfully!")
except Exception as e:
    print(f"⚠️ Warning: Could not load model at {MODEL_PATH}. Error: {e}")
    model = None

# The exact data structure React will send
class PredictionRequest(BaseModel):
    lat: float
    lon: float
    year: int
    ndvi: float
    ndbi: float
    ndwi: float

@app.post("/api/predict")
async def get_prediction(request: PredictionRequest):
    if model is None:
        raise HTTPException(status_code=500, detail="Model not loaded on server.")

    try:
        # 1. Format the incoming React data into a 2D numpy array.
        # CRITICAL: This array order MUST match the exact column order your model was trained on!
        features = np.array([[
            request.lat, 
            request.lon, 
            request.year, 
            request.ndvi, 
            request.ndbi, 
            request.ndwi
        ]])
        
        # 2. Run the actual XGBoost/Scikit-Learn prediction
        raw_prediction = model.predict(features)[0]
        predicted_lst = round(float(raw_prediction), 2)
        
        # 3. Calculate Risk based on the REAL prediction
        if predicted_lst >= 45.0:
            risk = "SEVERE"
        elif predicted_lst >= 40.0:
            risk = "HIGH"
        elif predicted_lst >= 35.0:
            risk = "MODERATE"
        else:
            risk = "LOW"
            
        # 4. Calculate secondary metrics
        variance = f"+{round((predicted_lst - 40.0), 2)}°" if predicted_lst > 40.0 else f"{round((predicted_lst - 40.0), 2)}°"
        high_heat_area = round((predicted_lst / 2.5), 1) 

        # 5. Send the live data back to React
        return {
            "lst": predicted_lst,
            "variance": variance,
            "risk": risk,
            "highHeatArea": high_heat_area
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))