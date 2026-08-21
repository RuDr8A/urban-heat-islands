import {
    MapContainer,
    TileLayer,
    CircleMarker,
    Popup
} from "react-leaflet";

import "leaflet/dist/leaflet.css";


// Decide marker color based on temperature
function getColor(temp) {
    if (temp < 40) return "green";
    if (temp < 48) return "yellow";
    if (temp < 55) return "orange";
    return "red";
}

function getErrorColor(error) {

    const absoluteError = Math.abs(error);

    if (absoluteError < 1) {
        return "green";
    }

    if (absoluteError < 2) {
        return "yellow";
    }

    if (absoluteError < 3) {
        return "orange";
    }

    return "red";
}


// Get the temperature that should be displayed
function getTemperature(point, mode) {
    if (mode === "predicted") {
        return point.predicted_LST;
    }

    // Supports both the old /heatmap response
    // and the new /heatmap/predicted response
    return point.observed_LST ?? point.LST;
}


export default function HeatMap({
    data,
    onSelect,
    mode
}) {

    return (

        <MapContainer
            center={[21.2514, 81.6296]}
            zoom={11}
            style={{
                height: "600px",
                width: "100%"
            }}
        >

            <TileLayer
                attribution="&copy; OpenStreetMap contributors"
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />


            {data.map((point, index) => {

                const temperature =
                    getTemperature(point, mode);
                
                const markerColor =
                    mode === "error"
                        ? getErrorColor(point.prediction_error)
                        : getColor(temperature);

                // Don't render a point if temperature
                // is unavailable
                if (
                    temperature === undefined ||
                    temperature === null
                ) {
                    return null;
                }


                const color =
                    getColor(temperature);


                return (

                    <CircleMarker
                        key={index}

                        center={[
                            point.latitude,
                            point.longitude
                        ]}

                        radius={5}

                        pathOptions={{
                            color: markerColor,
                            fillColor: markerColor,
                            fillOpacity: 0.7
                        }}

                        eventHandlers={{
                            click: () => onSelect(point)
                        }}
                    >

                        <Popup>

                            <strong>
                                Raipur Heat Zone
                            </strong>

                            <br />

                            {mode === "predicted"
                                ? "Predicted LST"
                                : "Observed LST"
                            }:

                            {" "}

                            {temperature.toFixed(2)} °C


                            <br />

                            NDVI:
                            {" "}
                            {point.NDVI.toFixed(3)}


                            <br />

                            NDBI:
                            {" "}
                            {point.NDBI.toFixed(3)}


                            <br />

                            NDWI:
                            {" "}
                            {point.NDWI.toFixed(3)}


                            {mode === "predicted" &&
                                point.observed_LST !== undefined && (

                                    <>

                                        <br />

                                        Observed LST:
                                        {" "}
                                        {point.observed_LST.toFixed(2)}
                                        °C

                                    </>

                                )
                            }


                            {mode === "predicted" &&
                                point.prediction_error !== undefined && (

                                    <>

                                        <br />

                                        Prediction Error:
                                        {" "}
                                        {point.prediction_error.toFixed(2)}
                                        °C

                                    </>

                                )
                            }

                            {mode === "error" && (
                                <>
                                    Prediction Error:{" "}
                                    {point.prediction_error.toFixed(2)} °C
                                </>
                            )}

                        </Popup>

                    </CircleMarker>

                );

            })}

        </MapContainer>

    );
}