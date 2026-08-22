import { useEffect, useMemo, useState } from "react";
import HeatMap from "./components/HeatMap";
import TrendChart from "./components/TrendChart";
import EnvironmentalChart from "./components/EnvironmentalChart";
import "./App.css";

const API_URL = "http://127.0.0.1:8000";

const YEARS = [2022, 2023, 2024, 2025, 2026];

function getHeatRisk(lst) {
  if (lst < 40) return "LOW";
  if (lst < 48) return "MODERATE";
  if (lst < 55) return "HIGH";
  return "EXTREME";
}

function formatNumber(value, digits = 2) {
  if (value === null || value === undefined || Number.isNaN(Number(value))) {
    return "—";
  }

  return Number(value).toFixed(digits);
}

function App() {
  const [selectedYear, setSelectedYear] = useState(2026);
  const [mapMode, setMapMode] = useState("observed");

  const [heatData, setHeatData] = useState([]);
  const [predictedData, setPredictedData] = useState([]);
  const [changeData, setChangeData] = useState([]);
  const [statistics, setStatistics] = useState([]);

  const [selectedPoint, setSelectedPoint] = useState(null);
  const [locationTrend, setLocationTrend] = useState([]);

  const [prediction, setPrediction] = useState(null);
  const [explanation, setExplanation] = useState(null);

  const [loadingMap, setLoadingMap] = useState(true);
  const [loadingTrend, setLoadingTrend] = useState(false);
  const [loadingPrediction, setLoadingPrediction] = useState(false);
  const [loadingExplanation, setLoadingExplanation] = useState(false);

  const [aiQuestion, setAiQuestion] = useState("");
  const [aiResponse, setAiResponse] = useState(null);
  const [loadingAI, setLoadingAI] = useState(false);
  const [aiError, setAiError] = useState(null);

  const [error, setError] = useState(null);

  /* =====================================================
     LOAD YEAR MAP
     ===================================================== */

  useEffect(() => {
    async function loadHeatmap() {
      setLoadingMap(true);
      setError(null);

      try {
        const response = await fetch(
          `${API_URL}/heatmap?year=${selectedYear}`
        );

        if (!response.ok) {
          throw new Error("Failed to load heatmap");
        }

        const data = await response.json();
        setHeatData(data);
      } catch (err) {
        console.error("Heatmap loading error:", err);
        setError("Unable to load heatmap data.");
        setHeatData([]);
      } finally {
        setLoadingMap(false);
      }
    }

    loadHeatmap();
  }, [selectedYear]);

  /* =====================================================
     LOAD PREDICTIONS
     ===================================================== */

  useEffect(() => {
    async function loadPredictions() {
      try {
        const response = await fetch(
          `${API_URL}/heatmap/predicted`
        );

        if (!response.ok) {
          throw new Error("Failed to load predictions");
        }

        const data = await response.json();
        setPredictedData(data);
      } catch (err) {
        console.error("Prediction loading error:", err);
        setPredictedData([]);
      }
    }

    loadPredictions();
  }, []);

  /* =====================================================
     LOAD CHANGE DATA
     ===================================================== */

  useEffect(() => {
    async function loadChangeData() {
      try {
        const response = await fetch(
          `${API_URL}/heatmap/change`
        );

        if (!response.ok) {
          throw new Error("Failed to load change data");
        }

        const data = await response.json();
        setChangeData(data);
      } catch (err) {
        console.error("Change map loading error:", err);
        setChangeData([]);
      }
    }

    loadChangeData();
  }, []);

  /* =====================================================
     LOAD STATISTICS
     ===================================================== */

  useEffect(() => {
    async function loadStatistics() {
      try {
        const response = await fetch(
          `${API_URL}/statistics`
        );

        if (!response.ok) {
          throw new Error("Failed to load statistics");
        }

        const data = await response.json();
        setStatistics(data);
      } catch (err) {
        console.error("Statistics loading error:", err);
        setStatistics([]);
      }
    }

    loadStatistics();
  }, []);

  /* =====================================================
     LOCATION TREND
     ===================================================== */

  async function loadLocationTrend(latitude, longitude) {
    setLoadingTrend(true);
    setPrediction(null);
    setExplanation(null);
    setAiResponse(null);
    setAiError(null);

    try {
      const response = await fetch(
        `${API_URL}/location/trend?latitude=${latitude}&longitude=${longitude}`
      );

      if (!response.ok) {
        throw new Error("Failed to load location trend");
      }

      const data = await response.json();
      setLocationTrend(data);
    } catch (err) {
      console.error("Trend loading error:", err);
      setLocationTrend([]);
    } finally {
      setLoadingTrend(false);
    }
  }

  /* =====================================================
     MAP SELECTION
     ===================================================== */

  function handlePointSelect(point) {
    setSelectedPoint(point);
    setPrediction(null);
    setExplanation(null);
    setAiResponse(null);
    setAiError(null);

    loadLocationTrend(
      point.latitude,
      point.longitude
    );

    setTimeout(() => {
      document
        .getElementById("location-analysis")
        ?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
    }, 100);
  }

  /* =====================================================
     PREDICTION
     ===================================================== */

  async function predictSelectedPoint() {
    if (!selectedPoint) return;

    setLoadingPrediction(true);
    setPrediction(null);

    try {
      const response = await fetch(
        `${API_URL}/predict`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            NDVI: selectedPoint.NDVI,
            NDBI: selectedPoint.NDBI,
            NDWI: selectedPoint.NDWI,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Prediction failed");
      }

      const result = await response.json();
      setPrediction(result);
    } catch (err) {
      console.error("Prediction error:", err);
      setPrediction(null);
    } finally {
      setLoadingPrediction(false);
    }
  }

  /* =====================================================
     SHAP
     ===================================================== */

  async function explainSelectedPoint() {
    if (!selectedPoint) return;

    setLoadingExplanation(true);
    setExplanation(null);

    try {
      const response = await fetch(
        `${API_URL}/explain`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            NDVI: selectedPoint.NDVI,
            NDBI: selectedPoint.NDBI,
            NDWI: selectedPoint.NDWI,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Explanation failed");
      }

      const data = await response.json();
      setExplanation(data);
    } catch (err) {
      console.error("Explanation error:", err);
      setExplanation(null);
    } finally {
      setLoadingExplanation(false);
    }
  }

  /* =====================================================
     AI ANALYST
     ===================================================== */

  async function askAI(questionOverride = null) {
    if (!selectedPoint) return;

    const question =
      questionOverride !== null
        ? questionOverride
        : aiQuestion.trim();

    if (!question) return;

    setLoadingAI(true);
    setAiError(null);
    setAiResponse(null);

    try {
      const response = await fetch(
        `${API_URL}/ai/analyze`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            question,
            latitude: selectedPoint.latitude,
            longitude: selectedPoint.longitude,
          }),
        }
      );

      if (!response.ok) {
        let message = "AI analysis failed.";

        try {
          const errorData = await response.json();

          if (errorData.detail) {
            message = errorData.detail;
          }
        } catch {
          // Ignore parsing error.
        }

        throw new Error(message);
      }

      const data = await response.json();

      setAiResponse(data);
      setAiQuestion(question);
    } catch (err) {
      console.error("AI analysis error:", err);

      setAiError(
        err.message ||
        "Unable to get AI analysis."
      );
    } finally {
      setLoadingAI(false);
    }
  }

  const quickQuestions = [
    "Why is this location getting hotter?",
    "What changed between 2022 and 2026?",
    "Which factor contributes most to the predicted heat?",
    "Explain the ML prediction simply.",
  ];

  /* =====================================================
     CURRENT MAP DATA
     ===================================================== */

  const mapData = useMemo(() => {
    if (mapMode === "change") {
      return changeData;
    }

    if (
      mapMode === "predicted" ||
      mapMode === "error"
    ) {
      return selectedYear === 2026
        ? predictedData
        : [];
    }

    return heatData;
  }, [
    mapMode,
    selectedYear,
    heatData,
    predictedData,
    changeData,
  ]);

  /* =====================================================
     CURRENT STATISTICS
     ===================================================== */

  const currentStats = statistics.find(
    (item) =>
      Number(item.Year) === selectedYear
  );

  /* =====================================================
     SELECTED LOCATION DATA
     ===================================================== */

  const selectedYearData =
    locationTrend.find(
      (item) =>
        Number(item.Year) === selectedYear
    );

  const baselineData =
    locationTrend.find(
      (item) =>
        Number(item.Year) === 2022
    );

  const latestLocationData =
    locationTrend.find(
      (item) =>
        Number(item.Year) === 2026
    );

  const temperatureChange =
    selectedYearData && baselineData
      ? selectedYearData.LST -
      baselineData.LST
      : null;

  const fiveYearChange =
    latestLocationData && baselineData
      ? latestLocationData.LST -
      baselineData.LST
      : null;

  /* =====================================================
     CITY-LEVEL METRICS
     ===================================================== */

  const cityAverageChange = useMemo(() => {
    if (!changeData.length) return null;

    const values = changeData
      .map((item) =>
        Number(item.LST_change)
      )
      .filter(Number.isFinite);

    if (!values.length) return null;

    return (
      values.reduce(
        (sum, value) => sum + value,
        0
      ) / values.length
    );
  }, [changeData]);

  const highHeatPercentage = useMemo(() => {
    if (!heatData.length) return null;

    const valid = heatData.filter(
      (point) =>
        Number.isFinite(
          Number(point.LST)
        )
    );

    if (!valid.length) return null;

    const highHeat = valid.filter(
      (point) =>
        Number(point.LST) >= 48
    ).length;

    return (
      (highHeat / valid.length) * 100
    );
  }, [heatData]);

  const hottestPoint = useMemo(() => {
    if (!heatData.length) return null;

    return heatData.reduce(
      (max, point) =>
        Number(point.LST) >
          Number(max.LST)
          ? point
          : max,
      heatData[0]
    );
  }, [heatData]);

  /* =====================================================
     RENDER
     ===================================================== */

  return (
    <div className="app-shell">

      {/* =================================================
          HEADER
          ================================================= */}

      <header className="topbar">

        <div className="brand">

          <div className="brand-mark">
            UH
          </div>

          <div>
            <div className="brand-name">
              Urban Heat Intelligence
            </div>

            <div className="brand-subtitle">
              Satellite-based urban heat monitoring
            </div>
          </div>

        </div>

        <div className="header-location">
          <span className="status-dot" />
          Raipur, Chhattisgarh
        </div>

      </header>


      <main className="dashboard">

        {/* =================================================
            HERO
            ================================================= */}

        <section className="hero">

          <div className="hero-copy">

            <div className="eyebrow">
              URBAN CLIMATE ANALYTICS
            </div>

            <h1>
              Understand where
              <br />
              Raipur is getting hotter.
            </h1>

            <p>
              Explore five years of
              satellite-derived land surface
              temperature and environmental
              indicators, with machine-learning
              prediction and location-level
              analysis.
            </p>

          </div>

          <div className="hero-control">

            <label htmlFor="year-select">
              ANALYSIS YEAR
            </label>

            <select
              id="year-select"
              value={selectedYear}
              onChange={(e) =>
                setSelectedYear(
                  Number(e.target.value)
                )
              }
            >

              {YEARS.map((year) => (
                <option
                  key={year}
                  value={year}
                >
                  {year}
                </option>
              ))}

            </select>

          </div>

        </section>


        {/* =================================================
            KPI CARDS
            ================================================= */}

        <section className="kpi-grid">

          <div className="kpi-card">

            <div className="kpi-label">
              Average LST
            </div>

            <div className="kpi-value">
              {currentStats
                ? `${formatNumber(
                  currentStats.mean_LST
                )}°`
                : "—"}
            </div>

            <div className="kpi-meta">
              {selectedYear} monitored surface
            </div>

          </div>


          <div className="kpi-card">

            <div className="kpi-label">
              Maximum LST
            </div>

            <div className="kpi-value">
              {currentStats
                ? `${formatNumber(
                  currentStats.max_LST
                )}°`
                : "—"}
            </div>

            <div className="kpi-meta">
              Highest observed location
            </div>

          </div>


          <div className="kpi-card">

            <div className="kpi-label">
              High heat area
            </div>

            <div className="kpi-value">
              {highHeatPercentage !== null
                ? `${formatNumber(
                  highHeatPercentage,
                  1
                )}%`
                : "—"}
            </div>

            <div className="kpi-meta">
              Locations at 48°C or above
            </div>

          </div>


          <div className="kpi-card kpi-accent">

            <div className="kpi-label">
              Avg. change since 2022
            </div>

            <div className="kpi-value">

              {cityAverageChange !== null
                ? `${cityAverageChange >= 0
                  ? "+"
                  : ""
                }${formatNumber(
                  cityAverageChange
                )}°`
                : "—"}

            </div>

            <div className="kpi-meta">
              2022 → 2026 observed LST
            </div>

          </div>

        </section>


        {/* =================================================
            MAP SECTION
            ================================================= */}

        <section className="panel map-panel">

          <div className="panel-header">

            <div>

              <div className="section-kicker">
                SPATIAL VIEW
              </div>

              <h2>
                Urban heat map
              </h2>

              <p>
                Select a location to inspect
                its environmental history.
              </p>

            </div>

            <div className="map-year">
              {selectedYear}
            </div>

          </div>


          <div className="map-toolbar">

            <div className="map-tabs">

              <button
                className={
                  mapMode === "observed"
                    ? "map-tab active"
                    : "map-tab"
                }
                onClick={() =>
                  setMapMode("observed")
                }
              >
                Observed
              </button>


              <button
                className={
                  mapMode === "predicted"
                    ? "map-tab active"
                    : "map-tab"
                }
                disabled={
                  selectedYear !== 2026
                }
                onClick={() =>
                  setMapMode("predicted")
                }
              >
                ML predicted
              </button>


              <button
                className={
                  mapMode === "error"
                    ? "map-tab active"
                    : "map-tab"
                }
                disabled={
                  selectedYear !== 2026
                }
                onClick={() =>
                  setMapMode("error")
                }
              >
                Prediction error
              </button>


              <button
                className={
                  mapMode === "change"
                    ? "map-tab active"
                    : "map-tab"
                }
                onClick={() =>
                  setMapMode("change")
                }
              >
                2022 → 2026
              </button>

            </div>


            <div className="map-mode-note">

              {mapMode === "observed" &&
                "Observed land surface temperature"}

              {mapMode === "predicted" &&
                "XGBoost model prediction"}

              {mapMode === "error" &&
                "Observed minus predicted LST"}

              {mapMode === "change" &&
                "Observed temperature change"}

            </div>

          </div>


          {error && (
            <div className="error-banner">
              {error}
            </div>
          )}


          <div className="map-wrapper">

            {loadingMap &&
              mapMode !== "change" ? (

              <div className="map-loading">
                <div className="loading-spinner" />
                Loading satellite data…
              </div>

            ) : mapMode !== "change" &&
              mapData.length === 0 ? (

              <div className="map-loading">
                No prediction data available
                for this year.
              </div>

            ) : (

              <HeatMap
                data={mapData}
                mode={mapMode}
                onSelect={
                  handlePointSelect
                }
              />

            )}

          </div>

        </section>


        {/* =================================================
            SELECTED LOCATION
            ================================================= */}

        <section
          id="location-analysis"
          className="location-section"
        >

          <div className="section-heading">

            <div>

              <div className="section-kicker">
                LOCATION ANALYSIS
              </div>

              <h2>
                Selected location
              </h2>

            </div>

            {selectedPoint && (
              <div className="coordinates">

                {formatNumber(
                  selectedPoint.latitude,
                  5
                )}
                ° N&nbsp;&nbsp;

                {formatNumber(
                  selectedPoint.longitude,
                  5
                )}
                ° E

              </div>
            )}

          </div>


          {!selectedPoint ? (

            <div className="empty-location">

              <div className="empty-icon">
                +
              </div>

              <div>

                <strong>
                  Select a point on the map
                </strong>

                <p>
                  Click any monitored location
                  to view its five-year heat
                  history, environmental indicators,
                  model prediction and AI analysis.
                </p>

              </div>

            </div>

          ) : (

            <>

              {/* LOCATION METRICS */}

              <div className="location-metrics">

                <div className="location-metric primary">

                  <span className="metric-label">
                    Observed LST
                  </span>

                  <strong>
                    {selectedYearData
                      ? `${formatNumber(
                        selectedYearData.LST
                      )}°C`
                      : "—"}
                  </strong>

                  <span className="metric-sub">
                    {selectedYear}
                  </span>

                </div>


                <div className="location-metric">

                  <span className="metric-label">
                    Heat risk
                  </span>

                  <strong className="risk-text">
                    {selectedYearData
                      ? getHeatRisk(
                        selectedYearData.LST
                      )
                      : "—"}
                  </strong>

                  <span className="metric-sub">
                    Based on observed LST
                  </span>

                </div>


                <div className="location-metric">

                  <span className="metric-label">
                    Change since 2022
                  </span>

                  <strong>

                    {temperatureChange !== null
                      ? `${temperatureChange >= 0
                        ? "+"
                        : ""
                      }${formatNumber(
                        temperatureChange
                      )}°C`
                      : "—"}

                  </strong>

                  <span className="metric-sub">
                    At this location
                  </span>

                </div>


                <div className="location-metric">

                  <span className="metric-label">
                    2026 LST
                  </span>

                  <strong>

                    {latestLocationData
                      ? `${formatNumber(
                        latestLocationData.LST
                      )}°C`
                      : "—"}

                  </strong>

                  <span className="metric-sub">
                    Latest observation
                  </span>

                </div>

              </div>


              {/* ENVIRONMENTAL INDICATORS */}

              {selectedYearData && (

                <div className="environment-strip">

                  <div className="environment-title">
                    Environmental indicators
                  </div>

                  <div className="environment-values">

                    <div>
                      <span>NDVI</span>
                      <strong>
                        {formatNumber(
                          selectedYearData.NDVI,
                          3
                        )}
                      </strong>
                    </div>

                    <div>
                      <span>NDBI</span>
                      <strong>
                        {formatNumber(
                          selectedYearData.NDBI,
                          3
                        )}
                      </strong>
                    </div>

                    <div>
                      <span>NDWI</span>
                      <strong>
                        {formatNumber(
                          selectedYearData.NDWI,
                          3
                        )}
                      </strong>
                    </div>

                  </div>

                </div>

              )}


              {/* CHARTS */}

              <div className="chart-grid">

                <div className="panel chart-panel">

                  <div className="chart-heading">

                    <div>
                      <div className="section-kicker">
                        5-YEAR HISTORY
                      </div>

                      <h3>
                        Land surface temperature
                      </h3>
                    </div>

                    {fiveYearChange !== null && (
                      <span className="change-badge">

                        {fiveYearChange >= 0
                          ? "+"
                          : ""}

                        {formatNumber(
                          fiveYearChange
                        )}°C

                      </span>
                    )}

                  </div>


                  {loadingTrend ? (

                    <div className="chart-loading">
                      Loading history…
                    </div>

                  ) : locationTrend.length > 0 ? (

                    <TrendChart
                      data={locationTrend}
                    />

                  ) : (

                    <div className="chart-loading">
                      No historical data available.
                    </div>

                  )}

                </div>


                <div className="panel chart-panel">

                  <div className="chart-heading">

                    <div>
                      <div className="section-kicker">
                        VEGETATION • BUILT • WATER
                      </div>

                      <h3>
                        Environmental indicators
                      </h3>
                    </div>

                  </div>


                  {locationTrend.length > 0 ? (

                    <EnvironmentalChart
                      data={locationTrend}
                    />

                  ) : (

                    <div className="chart-loading">
                      Select a location to view
                      environmental trends.
                    </div>

                  )}

                </div>

              </div>


              {/* ML + SHAP */}

              <div className="analysis-grid">

                <div className="panel model-panel">

                  <div className="panel-header compact">

                    <div>

                      <div className="section-kicker">
                        MACHINE LEARNING
                      </div>

                      <h3>
                        XGBoost analysis
                      </h3>

                    </div>

                  </div>


                  <p className="panel-description">
                    Estimate land surface
                    temperature from the selected
                    location's environmental
                    indicators.
                  </p>


                  <button
                    className="primary-button"
                    onClick={
                      predictSelectedPoint
                    }
                    disabled={
                      loadingPrediction
                    }
                  >

                    {loadingPrediction
                      ? "Running model…"
                      : "Predict LST"}

                  </button>


                  {prediction && (

                    <div className="prediction-result">

                      <div>

                        <span>
                          Predicted LST
                        </span>

                        <strong>
                          {formatNumber(
                            prediction.predicted_LST
                          )}°C
                        </strong>

                      </div>

                      <div>

                        <span>
                          Heat risk
                        </span>

                        <strong className="risk-text">
                          {prediction.heat_risk}
                        </strong>

                      </div>

                    </div>

                  )}

                </div>


                <div className="panel model-panel">

                  <div className="panel-header compact">

                    <div>

                      <div className="section-kicker">
                        MODEL EXPLANATION
                      </div>

                      <h3>
                        Feature contribution
                      </h3>

                    </div>

                  </div>


                  <p className="panel-description">
                    SHAP explains how each
                    environmental variable affects
                    the model's prediction.
                  </p>


                  <button
                    className="secondary-button"
                    onClick={
                      explainSelectedPoint
                    }
                    disabled={
                      loadingExplanation
                    }
                  >

                    {loadingExplanation
                      ? "Calculating…"
                      : "Explain prediction"}

                  </button>


                  {explanation && (

                    <div className="shap-result">

                      <div className="shap-baseline">

                        <span>
                          Model baseline
                        </span>

                        <strong>
                          {formatNumber(
                            explanation.base_value
                          )}°C
                        </strong>

                      </div>


                      {Object.entries(
                        explanation.contributions || {}
                      ).map(
                        ([feature, value]) => {

                          const numericValue =
                            Number(value);

                          const width = Math.min(
                            Math.abs(
                              numericValue
                            ) * 55,
                            100
                          );

                          return (

                            <div
                              className="shap-row"
                              key={feature}
                            >

                              <div className="shap-label">
                                {feature}
                              </div>

                              <div className="shap-bar-track">

                                <div
                                  className={
                                    numericValue >= 0
                                      ? "shap-bar positive"
                                      : "shap-bar negative"
                                  }
                                  style={{
                                    width: `${Math.max(
                                      width,
                                      4
                                    )}%`,
                                  }}
                                />

                              </div>

                              <div className="shap-value">

                                {numericValue >= 0
                                  ? "+"
                                  : ""}

                                {formatNumber(
                                  numericValue,
                                  3
                                )}

                              </div>

                            </div>

                          );
                        }
                      )}

                    </div>

                  )}

                </div>

              </div>


              {/* =================================================
                  AI ANALYST
                  ================================================= */}

              <section className="ai-panel">

                <div className="ai-header">

                  <div className="ai-mark">
                    UH
                  </div>

                  <div>

                    <div className="section-kicker">
                      ANALYTICAL ASSISTANT
                    </div>

                    <h2>
                      Urban Heat Analyst
                    </h2>

                    <p>
                      Ask questions about this
                      location using its satellite
                      history, ML prediction and
                      model explanation.
                    </p>

                  </div>

                </div>


                <div className="quick-questions">

                  {quickQuestions.map(
                    (question) => (

                      <button
                        key={question}
                        className="question-chip"
                        onClick={() =>
                          askAI(question)
                        }
                        disabled={loadingAI}
                      >
                        {question}
                      </button>

                    )
                  )}

                </div>


                <div className="ai-input-row">

                  <textarea
                    value={aiQuestion}
                    onChange={(e) =>
                      setAiQuestion(
                        e.target.value
                      )
                    }
                    placeholder="Ask about this location…"
                    rows={3}
                  />

                  <button
                    className="primary-button ai-submit"
                    onClick={() =>
                      askAI()
                    }
                    disabled={
                      loadingAI ||
                      !aiQuestion.trim()
                    }
                  >

                    {loadingAI
                      ? "Analysing…"
                      : "Ask analyst"}

                  </button>

                </div>


                {aiError && (

                  <div className="ai-error">
                    {aiError}
                  </div>

                )}


                {loadingAI && (

                  <div className="ai-loading">

                    <div className="loading-spinner small" />

                    Analysing the selected
                    location…

                  </div>

                )}


                {aiResponse &&
                  !loadingAI && (

                    <div className="ai-response">

                      <div className="ai-response-label">
                        ANALYSIS
                      </div>


                      <div className="ai-answer">

                        {Array.isArray(
                          aiResponse.answer
                        ) ? (

                          aiResponse.answer.map(
                            (item, index) => (

                              <div
                                key={index}
                              >
                                {item.text}
                              </div>

                            )
                          )

                        ) : (

                          aiResponse.answer

                        )}

                      </div>


                      {aiResponse.data && (

                        <div className="ai-data">

                          <div>

                            <span>
                              ML prediction
                            </span>

                            <strong>

                              {aiResponse.data.ML_prediction !==
                                undefined
                                ? `${formatNumber(
                                  aiResponse.data
                                    .ML_prediction
                                )}°C`
                                : "—"}

                            </strong>

                          </div>


                          <div>

                            <span>
                              2026 LST
                            </span>

                            <strong>

                              {aiResponse.data.latest_data
                                ? `${formatNumber(
                                  aiResponse.data
                                    .latest_data.LST
                                )}°C`
                                : "—"}

                            </strong>

                          </div>


                          <div>

                            <span>
                              Change since 2022
                            </span>

                            <strong>

                              {aiResponse.data
                                .changes_2022_to_2026
                                ? `${aiResponse.data
                                  .changes_2022_to_2026
                                  .LST >= 0
                                  ? "+"
                                  : ""
                                }${formatNumber(
                                  aiResponse.data
                                    .changes_2022_to_2026
                                    .LST
                                )}°C`
                                : "—"}

                            </strong>

                          </div>

                        </div>

                      )}

                    </div>

                  )}

              </section>

            </>

          )}

        </section>


        {/* =================================================
            FOOTER
            ================================================= */}

        <footer className="footer">

          <div>
            Urban Heat Intelligence
          </div>

          <div>
            Raipur • 2022–2026 satellite observations
          </div>

        </footer>

      </main>

    </div>
  );
}

export default App;