const BASE_URL = import.meta.env.VITE_API_URL;

export const heatApi = {
  // Method to fetch the LST prediction
  getPrediction: async (locationData) => {
    try {
      const response = await fetch(`${BASE_URL}/predict`, {
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
      console.error("API Request Failed:", error);
      throw error;
    }
  },
  
  // You can add your AI LLM endpoint here later!
  // eslint-disable-next-line no-unused-vars
  askAIAnalyst: async (prompt) => {
    
   }
};