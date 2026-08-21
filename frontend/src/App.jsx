import { useEffect, useState } from "react";

import HeatMap from "./components/HeatMap";


function App() {

  const [mapMode, setMapMode] =
  useState("observed");

  const [predictedData, setPredictedData] =
  useState([]);

  const [heatData, setHeatData] = useState([]);

  const [selectedPoint, setSelectedPoint] =
    useState(null);

  const [prediction, setPrediction] =
    useState(null);

  const [loading, setLoading] =
    useState(true);


  // Get heatmap data from FastAPI
  useEffect(() => {

    fetch("http://127.0.0.1:8000/heatmap")

      .then(response => response.json())

      .then(data => {

        setHeatData(data);

        setLoading(false);

      })

      .catch(error => {

        console.error(
          "Failed to load heatmap:",
          error
        );

        setLoading(false);

      });

  }, []);

  useEffect(() => {

    fetch(
      "http://127.0.0.1:8000/heatmap/predicted"
    )

      .then(response => response.json())

      .then(data => {

        setPredictedData(data);

      })

      .catch(error => {

        console.error(
          "Failed to load predictions:",
          error
        );

      });

  }, []);


  // Calculate dashboard statistics
  const temperatures =
    heatData.map(point => point.LST);

  const averageLST =
    temperatures.length > 0
      ? temperatures.reduce(
          (sum, value) => sum + value,
          0
        ) / temperatures.length
      : 0;

  const maxLST =
    temperatures.length > 0
      ? Math.max(...temperatures)
      : 0;

  const highRiskCount =
    temperatures.filter(
      temp => temp >= 48
    ).length;

  const extremeRiskCount =
    temperatures.filter(
      temp => temp >= 55
    ).length;


  // Send selected point to ML model
  async function predictTemperature() {

    if (!selectedPoint) return;


    const response = await fetch(
      "http://127.0.0.1:8000/predict",
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json"
        },

        body: JSON.stringify({

          NDVI: selectedPoint.NDVI,

          NDBI: selectedPoint.NDBI,

          NDWI: selectedPoint.NDWI,

          latitude:
            selectedPoint.latitude,

          longitude:
            selectedPoint.longitude

        })
      }
    );


    const result =
      await response.json();

    setPrediction(result);
  }


  if (loading) {

    return (
      <h2>
        Loading Raipur satellite data...
      </h2>
    );

  }


  return (

    <div>

      <header>

        <h1>
          Urban Heat Intelligence
        </h1>

        <p>
          Satellite-Based Urban Heat Analysis
        </p>

      </header>


      <main>

        {/* =========================
            DASHBOARD STATISTICS
            ========================= */}

        <div className="stats">

          <div>
            <h3>Average LST</h3>

            <p>
              {averageLST.toFixed(1)}°C
            </p>
          </div>


          <div>
            <h3>Maximum LST</h3>

            <p>
              {maxLST.toFixed(1)}°C
            </p>
          </div>


          <div>
            <h3>High Risk Zones</h3>

            <p>
              {highRiskCount}
            </p>
          </div>


          <div>
            <h3>Extreme Zones</h3>

            <p>
              {extremeRiskCount}
            </p>
          </div>

        </div>


        {/* =========================
            HEAT MAP
            ========================= */}

        <section>
          <div>

            <button
              onClick={() => setMapMode("observed")}
            >
              Satellite Observed
            </button>


            <button
              onClick={() => setMapMode("predicted")}
            >
              ML Predicted
            </button>

            <button
              onClick={() => setMapMode("error")}
            >
              Prediction Error
            </button>

          </div>

          <HeatMap
            data={
              mapMode === "observed"
                ? heatData
                : predictedData
            }

            mode={mapMode}

            onSelect={setSelectedPoint}
          />

        </section>


        {/* =========================
            SELECTED ZONE
            ========================= */}

        <section>

          <h2>
            Selected Zone
          </h2>


          {!selectedPoint && (

            <p>
              Click a point on the map
              to analyze it.
            </p>

          )}


          {selectedPoint && (

            <div>

              <p>
                Latitude:
                {" "}
                {selectedPoint.latitude.toFixed(5)}
              </p>

              <p>
                Longitude:
                {" "}
                {selectedPoint.longitude.toFixed(5)}
              </p>

              <p>
                Observed LST:
                {" "}
                {selectedPoint.LST.toFixed(2)}
                °C
              </p>

              <p>
                NDVI:
                {" "}
                {selectedPoint.NDVI.toFixed(3)}
              </p>

              <p>
                NDBI:
                {" "}
                {selectedPoint.NDBI.toFixed(3)}
              </p>

              <p>
                NDWI:
                {" "}
                {selectedPoint.NDWI.toFixed(3)}
              </p>


              <button
                onClick={predictTemperature}
              >
                Predict Heat
              </button>


              {prediction && (

                <div>

                  <h3>
                    ML Prediction
                  </h3>

                  <p>
                    Predicted LST:
                    {" "}
                    {prediction.predicted_LST}
                    °C
                  </p>

                  <p>
                    Heat Risk:
                    {" "}
                    {prediction.heat_risk}
                  </p>

                </div>

              )}

            </div>

          )}

        </section>

      </main>

    </div>

  );
}


export default App;