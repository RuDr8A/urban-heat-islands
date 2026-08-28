import axios from "axios";

// 1. Auth API instance (Express - Port 5000)
const authApi = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000",
  withCredentials: true,
});

export const register = async (data) => (await authApi.post("/api/auth/register", data)).data;
export const login = async (data) => (await authApi.post("/api/auth/login", data)).data;
export const logout = async () => (await authApi.post("/api/auth/logout")).data;
export const getMe = async () => (await authApi.get("/api/auth/me")).data;

// 2. ML Prediction API (FastAPI - Port 8000)
const ML_URL = import.meta.env.VITE_ML_URL || "http://localhost:8000";

export const heatApi = {
  getPrediction: async (locationData) => {
    try {
      const response = await fetch(`${ML_URL}/api/predict`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(locationData),
      });

      if (!response.ok) {
        throw new Error(`Server Error: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("ML API Request Failed:", error);
      throw error;
    }
  },
  
  // eslint-disable-next-line no-unused-vars
  askAIAnalyst: async (prompt) => {
    // AI LLM endpoint logic here later
  }
};