const ML_URL = import.meta.env.VITE_ML_URL || "http://localhost:8000";

export const heatApi = {
  getPrediction: async (locationData) => {
    try {
      const response = await fetch(`${ML_URL}/api/predict`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(locationData),
      });

      if (!response.ok) throw new Error(`Server Error: ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error("ML API Request Failed:", error);
      throw error;
    }
  },
  
  askAIAnalyst: async () => {
    // AI LLM endpoint logic here later
  }
};