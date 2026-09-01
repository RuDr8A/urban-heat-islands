const BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:8000').replace(/\/$/, '');

async function request(path, options = {}) {
  let response;

  try {
    response = await fetch(`${BASE_URL}${path}`, {
      headers: { 'Content-Type': 'application/json', ...options.headers },
      ...options,
    });
  } catch {
    throw new Error('Unable to reach the Urban Heat API. Check that FastAPI is running.');
  }

  if (!response.ok) {
    let message = `API request failed (${response.status})`;
    try {
      const body = await response.json();
      message = body.detail || message;
    } catch {
      // The status message is enough when the response is not JSON.
    }
    throw new Error(message);
  }

  return response.json();
}

function query(params) {
  const search = new URLSearchParams(
    Object.entries(params).filter(([, value]) => value !== undefined && value !== null)
  );
  return `?${search.toString()}`;
}

export const heatApi = {
  getCities: () => request('/cities'),
  getPrediction: (features) => request('/predict', { method: 'POST', body: JSON.stringify(features) }),
  getPredictedHeatmap: (city, year) => request(`/heatmap/predicted${query({ city, year })}`),
  getRisk: (city, year) => request(`/risk${query({ city, year })}`),
  getHotspots: (city) => request(`/hotspots${query({ city })}`),
  getStatistics: (city) => request(`/statistics${query({ city })}`),
  getLocationTrend: (latitude, longitude, city) => request(`/location/trend${query({ latitude, longitude, city })}`),
  getNearestLocation: (city, year, latitude, longitude) => request(`/location/nearest${query({ city, year, latitude, longitude })}`),
  getCitySummary: (city) => request(`/city/summary${query({ city })}`),
  getExplanation: (features) => request('/explain', { method: 'POST', body: JSON.stringify(features) }),
  analyzeLocation: (data) => request('/ai/analyze', { method: 'POST', body: JSON.stringify(data) }),
};
