import { useEffect, useMemo, useState } from 'react';
import { heatApi } from '../../services/api';
import SpatialMap from './SpatialMap';
import HistoricalTrends from './HistoricalTrends';
import ShapChart from './ShapChart';

const FEATURE_KEYS = ['NDVI', 'NDBI', 'NDWI', 'albedo', 'elevation', 'slope', 'landcover'];
const SUPPORTED_CITIES = [
  'Ahmedabad', 'Bengaluru', 'Bhubaneswar', 'Chennai',
  'Dehradun', 'Delhi', 'Guwahati', 'Hyderabad',
  'Jaipur', 'Kolkata', 'Mumbai', 'Nagpur', 'Pune', 'Raipur',
];

function featuresFromPoint(point) {
  return Object.fromEntries(FEATURE_KEYS.map((key) => [key, Number(point[key])]));
}

function hasMlFeatures(point) {
  return FEATURE_KEYS.every((key) => Number.isFinite(Number(point?.[key])));
}

function findSupportedCity(requestedCity, availableCities) {
  const normalized = requestedCity?.trim().toLowerCase();
  if (!normalized) return null;
  const cities = availableCities.length ? availableCities : SUPPORTED_CITIES;
  return cities.find((availableCity) => availableCity.toLowerCase() === normalized)
    || cities.find((availableCity) => normalized.startsWith(`${availableCity.toLowerCase()},`))
    || cities.find((availableCity) => normalized.split(',').map((part) => part.trim()).includes(availableCity.toLowerCase()))
    || null;
}

export default function DashboardContent({ requestedCity, onAnalysisContextChange = () => {} }) {
  const [cities, setCities] = useState([]);
  const [years, setYears] = useState([]);
  const [city, setCity] = useState(() => findSupportedCity(requestedCity, SUPPORTED_CITIES));
  const [year, setYear] = useState(2026);
  const [heatmap, setHeatmap] = useState([]);
  const [risk, setRisk] = useState([]);
  const [hotspots, setHotspots] = useState([]);
  const [statistics, setStatistics] = useState([]);
  const [summary, setSummary] = useState([]);
  const [point, setPoint] = useState(null);
  const [pointHistory, setPointHistory] = useState([]);
  const [prediction, setPrediction] = useState(null);
  const [explanation, setExplanation] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState('');
  const [analysisNote, setAnalysisNote] = useState('');
  const [activeTab, setActiveTab] = useState('map');
  const [sliderValues, setSliderValues] = useState({ NDVI: 0, NDBI: 0, NDWI: 0 });

  useEffect(() => {
    heatApi.getCities()
      .then(({ cities: availableCities, years: availableYears }) => {
        setCities(availableCities);
        setYears(availableYears);
        setCity((currentCity) => currentCity || findSupportedCity(requestedCity, availableCities) || 'Raipur');
        setYear((currentYear) => availableYears.includes(currentYear) ? currentYear : availableYears.at(-1));
      })
      .catch((requestError) => setError(requestError.message));
  }, [requestedCity]);

  useEffect(() => {
    let cancelled = false;
    if (!city) return undefined;
    async function loadCityData() {
      setIsLoading(true);
      setError('');
      try {
        const [heatmapData, riskData, hotspotData, statisticsData, summaryData] = await Promise.all([
          heatApi.getPredictedHeatmap(city, year),
          heatApi.getRisk(city, year),
          heatApi.getHotspots(city),
          heatApi.getStatistics(city),
          heatApi.getCitySummary(city),
        ]);
        if (cancelled) return;
        setHeatmap(heatmapData);
        setRisk(riskData);
        setHotspots(hotspotData);
        setStatistics(statisticsData);
        setSummary(summaryData);
        const initialPoint = heatmapData[0] || null;
        setPoint(initialPoint);
        setAnalysisNote(initialPoint ? 'Exact dataset point' : '');
        if (initialPoint) {
          const initialFeatures = featuresFromPoint(initialPoint);
          setSliderValues({ NDVI: initialFeatures.NDVI, NDBI: initialFeatures.NDBI, NDWI: initialFeatures.NDWI });
        }
      } catch (requestError) {
        if (!cancelled) setError(requestError.message);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }
    loadCityData();
    return () => { cancelled = true; };
  }, [city, year]);

  useEffect(() => {
    let cancelled = false;

    if (!point || !hasMlFeatures(point)) return undefined;

    const pointFeatures = featuresFromPoint(point);

    Promise.all([
      heatApi.getLocationTrend(point.latitude, point.longitude, city),
      heatApi.getPrediction(pointFeatures),
      heatApi.getExplanation(pointFeatures),
    ])
      .then(([history, predictionData, explanationData]) => {
        if (cancelled) return;

        setPointHistory(history);
        setPrediction(predictionData);
        setExplanation(explanationData);
      })
      .catch((requestError) => {
        if (!cancelled) {
          setError(requestError.message);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setIsAnalyzing(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [point, city]);

  const selectedSummary = useMemo(
    () => summary.find((item) => item.year === year) || summary.at(-1),
    [summary, year]
  );

  const runSimulation = async () => {
    if (!point || isAnalyzing) return;

    try {
      setIsAnalyzing(true);
      setError("");

      const features = {
        ...featuresFromPoint(point),
        ...sliderValues,
      };

      const [predictionData, explanationData] = await Promise.all([
        heatApi.getPrediction(features),
        heatApi.getExplanation(features),
      ]);

      setPrediction(predictionData);
      setExplanation(explanationData);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const selectPoint = (nextPoint, note = "Exact dataset point") => {
    setError("");
    setAnalysisNote(note);
    setPoint(nextPoint);

    if (!hasMlFeatures(nextPoint)) {
      setIsAnalyzing(false);
      setError(
        "The selected record is missing required ML features and cannot be analyzed.",
      );
      return;
    }

    setIsAnalyzing(true);

    const nextFeatures = featuresFromPoint(nextPoint);

    setSliderValues({
      NDVI: nextFeatures.NDVI,
      NDBI: nextFeatures.NDBI,
      NDWI: nextFeatures.NDWI,
    });
  };

  const handleMapClick = async ({ latitude, longitude }) => {
    try {
      setError("");
      setIsAnalyzing(true);

      const nearest = await heatApi.getNearestLocation(
        city,
        year,
        latitude,
        longitude,
      );

      if (!nearest.within_coverage || !nearest.data) {
        setIsAnalyzing(false);
        setError(
          nearest.message ||
            "Selected location is outside ML-backed analysis coverage.",
        );
        return;
      }

      const distanceM = Math.round(
        nearest.distance_m ?? nearest.distance_km * 1000,
      );

      selectPoint(
        nearest.data,
        `Estimated from nearest ML-backed cell. Nearest cell: ${distanceM} m away.`,
      );
    } catch (requestError) {
      setIsAnalyzing(false);
      setError(requestError.message);
    }
  };

  const displayedPoint = point || {};
  useEffect(() => {
    onAnalysisContextChange({ city, location: point ? { latitude: point.latitude, longitude: point.longitude } : null });
  }, [city, point, onAnalysisContextChange]);
  return (
    <main className="flex-1 bg-black/40 backdrop-blur-xl border border-white/10 rounded-[2rem] shadow-2xl relative z-30 flex flex-col p-8 overflow-y-auto no-scrollbar text-white">
      <div className="max-w-6xl mx-auto w-full flex flex-col h-full gap-8">
        <header className="flex flex-col gap-2 mt-2">
          <h1 className="flex items-baseline gap-3">
            <span className="font-headline-xl text-headline-xl text-white font-bold tracking-tight">
              Urban Heat
            </span>
            <span className="font-accent-display text-4xl text-white italic">
              Intelligence
            </span>
          </h1>
          <p className="font-body-md text-white/70 text-lg">
            Machine learning LST prediction & spatial analysis.
          </p>
        </header>
        {error && (
          <p className="text-sm text-red-300 bg-red-500/10 border border-red-400/20 rounded-xl px-4 py-2">
            {error}
          </p>
        )}
        {analysisNote && (
          <p className="text-sm text-cyan-100 bg-cyan-500/10 border border-cyan-400/20 rounded-xl px-4 py-2">
            {analysisNote}
          </p>
        )}
        <div className="grid grid-cols-12 gap-10 h-full pb-5">
          <div className="col-span-12 md:col-span-4 flex flex-col gap-6 ml-1">
            <div className="bg-white/5 backdrop-blur-xl border border-white/20 rounded-3xl p-6 flex flex-col gap-6 shadow-[0_8px_32px_0_rgba(0,0,0,0.3)]">
              <div>
                <h3 className="text-white/60 font-medium text-xs tracking-widest uppercase font-label-caps mb-1">
                  Location Analysis
                </h3>
                <h2 className="text-2xl font-semibold">
                  {city ? `${city}, India` : "Loading city..."}
                </h2>
                <p className="text-sm text-white/40 font-mono mt-1">
                  {point
                    ? `${point.latitude.toFixed(4)}° N, ${point.longitude.toFixed(4)}° E`
                    : "Loading location..."}
                </p>
              </div>
              <label className="text-white/60 font-medium text-xs tracking-widest uppercase font-label-caps">
                Supported City
                <select
                  value={city || ""}
                  onChange={(event) => setCity(event.target.value)}
                  className="mt-2 w-full bg-white/10 border border-white/10 rounded-xl px-4 py-3 text-white font-medium outline-none"
                >
                  {cities.map((availableCity) => (
                    <option
                      key={availableCity}
                      value={availableCity}
                      className="bg-gray-900"
                    >
                      {availableCity}
                    </option>
                  ))}
                </select>
              </label>
              <label className="text-white/60 font-medium text-xs tracking-widest uppercase font-label-caps">
                Analysis Year
                <select
                  value={year}
                  onChange={(event) => setYear(Number(event.target.value))}
                  className="mt-2 w-full bg-white/10 border border-white/10 rounded-xl px-4 py-3 text-white font-medium outline-none"
                >
                  {years.map((availableYear) => (
                    <option
                      key={availableYear}
                      value={availableYear}
                      className="bg-gray-900"
                    >
                      {availableYear}
                    </option>
                  ))}
                </select>
              </label>
              <div className="flex flex-col gap-5 pt-2 border-t border-white/10">
                <h3 className="text-white/60 font-medium text-xs tracking-widest uppercase font-label-caps mb-1">
                  Environmental Indicators
                </h3>
                {[
                  [
                    "NDVI",
                    "Vegetation",
                    "bg-emerald-500",
                    "accent-emerald-500",
                  ],
                  ["NDBI", "Built-up", "bg-orange-500", "accent-orange-500"],
                  ["NDWI", "Water", "bg-blue-500", "accent-blue-500"],
                ].map(([key, label, dotClass, accentClass]) => (
                  <div key={key} className="flex flex-col gap-2">
                    <div className="flex justify-between text-sm items-center">
                      <span className="flex items-center gap-2">
                        <span
                          className={`w-2 h-2 rounded-full ${dotClass}`}
                        ></span>
                        {key} ({label})
                      </span>
                      <span className="font-mono text-white/80">
                        {Number(sliderValues[key] || 0).toFixed(3)}
                      </span>
                    </div>
                    <input
                      type="range"
                      min="-1"
                      max="1"
                      step="0.01"
                      value={sliderValues[key] || 0}
                      onChange={(event) =>
                        setSliderValues({
                          ...sliderValues,
                          [key]: Number(event.target.value),
                        })
                      }
                      className={`w-full h-1 bg-white/20 rounded-lg appearance-none cursor-pointer ${accentClass}`}
                    />
                  </div>
                ))}
                <button
                  onClick={runSimulation}
                  disabled={!point || isLoading || isAnalyzing}
                  aria-busy={isAnalyzing}
                  className="mt-2 w-full bg-white/10 hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed border border-white/20 text-white py-2.5 rounded-xl transition-all font-medium text-sm shadow-lg active:scale-[0.98] flex items-center justify-center gap-2"
                >
                  {isAnalyzing ? (
                    <>
                      <span className="material-symbols-outlined text-[18px] animate-spin">
                        progress_activity
                      </span>
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-[18px]">
                        science
                      </span>
                      Run Simulation
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
          <div className="col-span-12 md:col-span-8 flex flex-col gap-6">
            <div className="grid grid-cols-3 gap-6">
              <div className="bg-white/5 backdrop-blur-xl border border-white/20 rounded-3xl p-6 flex flex-col gap-3 shadow-[0_8px_32px_0_rgba(0,0,0,0.3)]">
                <h3 className="text-white/60 font-medium text-xs tracking-widest uppercase font-label-caps">
                  Predicted LST
                </h3>
                <div className="flex items-end gap-1">
                  <span className="text-4xl font-display-xl font-light text-white tracking-tighter">
                    {isLoading || isAnalyzing || !prediction
                      ? "--.--"
                      : prediction.predicted_LST.toFixed(2)}
                    °
                  </span>
                  <div className="flex items-center justify-center px-2 py-1 rounded-full bg-red-500/20 border border-red-500/30 text-red-400 mb-1 text-xs font-medium ml-2">
                    {displayedPoint.prediction_error?.toFixed(2) || "--"}°
                  </div>
                </div>
              </div>
              <div className="bg-white/5 backdrop-blur-xl border border-white/20 rounded-3xl p-6 flex flex-col gap-2 shadow-[0_8px_32px_0_rgba(0,0,0,0.3)]">
                <h3 className="text-white/60 font-medium text-xs tracking-widest uppercase font-label-caps">
                  Heat Risk Level
                </h3>
                <span
                  className={`text-2xl font-display-xl mt-1 ${prediction?.risk_category?.includes("HIGH") ? "text-red-500" : "text-orange-400"}`}
                >
                  {isLoading || isAnalyzing || !prediction
                    ? "..."
                    : prediction.risk_category}
                </span>
              </div>
              <div className="bg-white/5 backdrop-blur-xl border border-white/20 rounded-3xl p-6 flex flex-col gap-2 shadow-[0_8px_32px_0_rgba(0,0,0,0.3)]">
                <h3 className="text-white/60 font-medium text-xs tracking-widest uppercase font-label-caps">
                  High Heat Area
                </h3>
                <span className="text-2xl font-display-xl text-white mt-1">
                  {selectedSummary
                    ? `${(selectedSummary.high_risk_fraction * 100).toFixed(1)}%`
                    : "--.-"}
                </span>
              </div>
            </div>
            <div className="flex gap-8 border-b border-white/10 pb-4 relative mt-2">
              {[
                ["map", "Spatial Heat Map"],
                ["trends", "Historical Trends"],
                ["shap", "SHAP Contributions"],
              ].map(([key, label]) => (
                <button
                  key={key}
                  onClick={() => setActiveTab(key)}
                  className={`font-medium relative pb-1 transition-colors ${activeTab === key ? "text-white" : "text-white/50 hover:text-white"}`}
                >
                  {label}
                  {activeTab === key && (
                    <div className="absolute -bottom-[17px] left-0 right-0 h-[2px] bg-white rounded-t-full shadow-[0_-2px_8px_rgba(255,255,255,0.8)]"></div>
                  )}
                </button>
              ))}
            </div>
            <div className="bg-white/5 backdrop-blur-xl border border-white/20 flex-1 rounded-3xl p-4 relative overflow-hidden min-h-[400px] shadow-[0_8px_32px_0_rgba(0,0,0,0.3)]">
              {activeTab === "map" && (
                <SpatialMap
                  city={city}
                  heatmap={heatmap}
                  risk={risk}
                  hotspots={hotspots}
                  onPointSelect={selectPoint}
                  onMapClick={handleMapClick}
                  isAnalyzing={isAnalyzing}
                />
              )}
              {activeTab === "trends" && (
                <HistoricalTrends
                  data={statistics}
                  pointHistory={pointHistory}
                />
              )}
              {activeTab === "shap" && <ShapChart explanation={explanation} />}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
