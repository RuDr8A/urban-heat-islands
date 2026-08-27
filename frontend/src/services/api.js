const BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const heatApi = {
  // Function to fetch ML prediction from your backend
  getPrediction: async (locationData) => {
    try {
      const response = await fetch(`${BASE_URL}/predict`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(locationData), // Sends NDVI, NDBI, etc.
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Error fetching prediction:", error);
      throw error;
    }
  },

  // Future function for the AI Chatbot
  askAIAnalyst: async (question, context) => {
    // We will wire this up later!
  }
};