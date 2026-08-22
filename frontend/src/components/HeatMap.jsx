import {
    MapContainer,
    TileLayer,
    CircleMarker,
    Popup,
    useMap,
} from "react-leaflet";

import "leaflet/dist/leaflet.css";

const RAIPUR_CENTER = [
    21.2514,
    81.6296,
];

function getLSTColor(lst) {
    if (lst < 40) return "#3e6f91";
    if (lst < 48) return "#2f8176";
    if (lst < 55) return "#d29a3a";
    return "#b54b3d";
}

function getErrorColor(error) {
    const absoluteError = Math.abs(error);

    if (absoluteError < 1) return "#2f8176";
    if (absoluteError < 2) return "#d29a3a";
    if (absoluteError < 4) return "#d46d3b";
    return "#b54b3d";
}

function getChangeColor(change) {
    if (change < -2) return "#3e6f91";
    if (change < 0) return "#2f8176";
    if (change < 2) return "#d0a24b";
    if (change < 4) return "#d46d3b";
    return "#b54b3d";
}

function MapResizeHandler() {
    const map = useMap();

    setTimeout(() => {
        map.invalidateSize();
    }, 100);

    return null;
}

function getLegend(mode) {
    if (mode === "change") {
        return [
            {
                color: "#3e6f91",
                label: "< −2°C",
            },
            {
                color: "#2f8176",
                label: "−2 to 0°C",
            },
            {
                color: "#d0a24b",
                label: "0 to 2°C",
            },
            {
                color: "#d46d3b",
                label: "2 to 4°C",
            },
            {
                color: "#b54b3d",
                label: "> 4°C",
            },
        ];
    }

    if (mode === "error") {
        return [
            {
                color: "#2f8176",
                label: "< 1°C",
            },
            {
                color: "#d0a24b",
                label: "1–2°C",
            },
            {
                color: "#d46d3b",
                label: "2–4°C",
            },
            {
                color: "#b54b3d",
                label: "> 4°C",
            },
        ];
    }

    return [
        {
            color: "#3e6f91",
            label: "< 40°C",
        },
        {
            color: "#2f8176",
            label: "40–48°C",
        },
        {
            color: "#d0a24b",
            label: "48–55°C",
        },
        {
            color: "#b54b3d",
            label: "> 55°C",
        },
    ];
}

function HeatMap({
    data,
    mode = "observed",
    onSelect,
}) {
    if (!data || data.length === 0) {
        return (
            <div
                style={{
                    width: "100%",
                    height: "100%",
                    minHeight: "500px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#7a8580",
                    background: "#eef1ef",
                }}
            >
                No map data available.
            </div>
        );
    }

    const legend = getLegend(mode);

    return (
        <div
            style={{
                position: "relative",
                width: "100%",
                height: "540px",
            }}
        >
            <MapContainer
                center={RAIPUR_CENTER}
                zoom={11}
                scrollWheelZoom={true}
                style={{
                    width: "100%",
                    height: "100%",
                    zIndex: 1,
                }}
            >
                <MapResizeHandler />

                <TileLayer
                    attribution="&copy; OpenStreetMap contributors"
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                {data.map((point, index) => {
                    const latitude = Number(
                        point.latitude ?? point.lat
                    );

                    const longitude = Number(
                        point.longitude ?? point.lng
                    );

                    if (
                        !Number.isFinite(latitude) ||
                        !Number.isFinite(longitude)
                    ) {
                        return null;
                    }

                    const lst = Number(
                        point.LST ??
                        point.lst ??
                        0
                    );

                    const predictedLST = Number(
                        point.predicted_LST ??
                        point.predicted_lst ??
                        point.prediction ??
                        point.LST_predicted ??
                        0
                    );

                    const predictionError = Number(
                        point.prediction_error ??
                        point.error ??
                        0
                    );

                    const lst2022 = Number(
                        point.LST_2022 ?? 0
                    );

                    const lst2026 = Number(
                        point.LST_2026 ?? 0
                    );

                    const lstChange = Number(
                        point.LST_change ??
                        lst2026 - lst2022
                    );

                    let markerColor =
                        getLSTColor(lst);

                    if (mode === "predicted") {
                        markerColor =
                            getLSTColor(
                                predictedLST
                            );
                    }

                    if (mode === "error") {
                        markerColor =
                            getErrorColor(
                                predictionError
                            );
                    }

                    if (mode === "change") {
                        markerColor =
                            getChangeColor(
                                lstChange
                            );
                    }

                    function handleClick() {
                        if (onSelect) {
                            onSelect(point);
                        }
                    }

                    return (
                        <CircleMarker
                            key={`${latitude}-${longitude}-${index}`}
                            center={[
                                latitude,
                                longitude,
                            ]}
                            radius={5}
                            pathOptions={{
                                color: "#ffffff",
                                fillColor: markerColor,
                                fillOpacity: 0.82,
                                weight: 1,
                            }}
                            eventHandlers={{
                                click: handleClick,
                            }}
                        >
                            <Popup>
                                <div
                                    style={{
                                        minWidth: "190px",
                                        fontFamily:
                                            "IBM Plex Sans, sans-serif",
                                        color: "#17221f",
                                    }}
                                >
                                    <div
                                        style={{
                                            fontSize: "10px",
                                            fontWeight: 700,
                                            letterSpacing: "0.1em",
                                            color: "#146b63",
                                            marginBottom: "8px",
                                        }}
                                    >
                                        LOCATION
                                    </div>

                                    <div
                                        style={{
                                            fontSize: "12px",
                                            color: "#53605b",
                                            marginBottom: "10px",
                                        }}
                                    >
                                        {latitude.toFixed(5)}° N ·{" "}
                                        {longitude.toFixed(5)}° E
                                    </div>

                                    {mode === "observed" && (
                                        <div>
                                            <strong>
                                                Observed LST
                                            </strong>

                                            <div
                                                style={{
                                                    fontSize: "22px",
                                                    fontWeight: 600,
                                                    marginTop: "4px",
                                                }}
                                            >
                                                {lst.toFixed(2)}°C
                                            </div>
                                        </div>
                                    )}

                                    {mode === "predicted" && (
                                        <div>
                                            <strong>
                                                ML predicted LST
                                            </strong>

                                            <div
                                                style={{
                                                    fontSize: "22px",
                                                    fontWeight: 600,
                                                    marginTop: "4px",
                                                }}
                                            >
                                                {predictedLST.toFixed(
                                                    2
                                                )}°C
                                            </div>
                                        </div>
                                    )}

                                    {mode === "error" && (
                                        <div>
                                            <div>
                                                Observed:{" "}
                                                <strong>
                                                    {lst.toFixed(2)}°C
                                                </strong>
                                            </div>

                                            <div>
                                                Predicted:{" "}
                                                <strong>
                                                    {predictedLST.toFixed(
                                                        2
                                                    )}°C
                                                </strong>
                                            </div>

                                            <div
                                                style={{
                                                    marginTop: "7px",
                                                }}
                                            >
                                                Error:{" "}
                                                <strong>
                                                    {predictionError >=
                                                        0
                                                        ? "+"
                                                        : ""}
                                                    {predictionError.toFixed(
                                                        2
                                                    )}°C
                                                </strong>
                                            </div>
                                        </div>
                                    )}

                                    {mode === "change" && (
                                        <div>
                                            <div>
                                                2022:{" "}
                                                <strong>
                                                    {lst2022.toFixed(
                                                        2
                                                    )}°C
                                                </strong>
                                            </div>

                                            <div>
                                                2026:{" "}
                                                <strong>
                                                    {lst2026.toFixed(
                                                        2
                                                    )}°C
                                                </strong>
                                            </div>

                                            <div
                                                style={{
                                                    marginTop: "8px",
                                                }}
                                            >
                                                Change:{" "}
                                                <strong>
                                                    {lstChange >= 0
                                                        ? "+"
                                                        : ""}
                                                    {lstChange.toFixed(
                                                        2
                                                    )}°C
                                                </strong>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </Popup>
                        </CircleMarker>
                    );
                })}
            </MapContainer>

            {/* MAP LEGEND */}

            <div
                style={{
                    position: "absolute",
                    left: "16px",
                    bottom: "16px",
                    zIndex: 500,

                    padding: "11px 13px",

                    background:
                        "rgba(255,255,255,0.96)",

                    border:
                        "1px solid #dfe5e1",

                    borderRadius: "8px",

                    boxShadow:
                        "0 2px 10px rgba(25,42,36,0.10)",
                }}
            >
                <div
                    style={{
                        fontFamily:
                            "IBM Plex Sans, sans-serif",
                        fontSize: "10px",
                        fontWeight: 700,
                        color: "#53605b",
                        letterSpacing: "0.08em",
                        textTransform: "uppercase",
                        marginBottom: "8px",
                    }}
                >
                    {mode === "change"
                        ? "Temperature change"
                        : mode === "error"
                            ? "Prediction error"
                            : "Temperature"}
                </div>

                <div
                    style={{
                        display: "flex",
                        gap: "10px",
                        flexWrap: "wrap",
                    }}
                >
                    {legend.map((item) => (
                        <div
                            key={item.label}
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "5px",
                            }}
                        >
                            <span
                                style={{
                                    width: "9px",
                                    height: "9px",
                                    borderRadius: "50%",
                                    background:
                                        item.color,
                                    display: "inline-block",
                                }}
                            />

                            <span
                                style={{
                                    fontFamily:
                                        "IBM Plex Sans, sans-serif",
                                    fontSize: "10px",
                                    color: "#53605b",
                                }}
                            >
                                {item.label}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default HeatMap;