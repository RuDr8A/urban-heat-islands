from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import pandas as pd
import pickle
import os

# 1. INITIALIZE APP FIRST
app = FastAPI(title="Urban Heat Intelligence API")

# 2. CONFIGURE CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 3. LOAD THE MODEL
MODEL_PATH = "model/first_prediction_model.pkl"
try:
    with open(MODEL_PATH, "rb") as f:
        model = pickle.load(f)
    print("✅ ML Model loaded successfully!")
except Exception as e:
    print(f"⚠️ Warning: Could not load model at {MODEL_PATH}. Error: {e}")
    model = None

# 4. DEFINE DATA STRUCTURE
class PredictionRequest(BaseModel):
    lat: float
    lon: float
    year: int
    ndvi: float
    ndbi: float
    ndwi: float

# 5. DEFINE ENDPOINTS
@app.post("/api/predict")
async def get_prediction(request: PredictionRequest):
    try:
        if model is None:
            print("🔥 CRASH: Model is None. Pickle file failed to load.")
            raise HTTPException(status_code=500, detail="Model failed to load")

        # Create a DataFrame matching your model's exact expected column names
        input_df = pd.DataFrame([{
            "lat": request.lat, 
            "lon": request.lon, 
            "year": request.year, 
            "ndvi": request.ndvi, 
            "ndbi": request.ndbi, 
            "ndwi": request.ndwi
        }])
        
        # Run prediction
        raw_prediction = model.predict(input_df)[0]
        predicted_lst = round(float(raw_prediction), 2)
        
        # Determine Risk
        if predicted_lst >= 45.0: 
            risk = "SEVERE"
        elif predicted_lst >= 40.0: 
            risk = "HIGH"
        elif predicted_lst >= 35.0: 
            risk = "MODERATE"
        else: 
            risk = "LOW"
            
        variance = f"+{round((predicted_lst - 40.0), 2)}°" if predicted_lst > 40.0 else f"{round((predicted_lst - 40.0), 2)}°"
        high_heat_area = round((predicted_lst / 2.5), 1)
        
        return {
            "lst": predicted_lst,
            "variance": variance,
            "risk": risk,
            "highHeatArea": high_heat_area
        }

    except Exception as e:
        print(f"🔥 ML CRASH: {str(e)}") 
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/")
def read_root():
    return {"status": "Backend is running!"}