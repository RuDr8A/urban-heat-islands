import { useState, useEffect, useRef } from "react";
import {
  MapContainer,
  TileLayer,
  CircleMarker,
  useMap,
  useMapEvents,
} from "react-leaflet";
import CitySearch from "./CitySearch";
import "leaflet/dist/leaflet.css";
import "leaflet-draw/dist/leaflet.draw.css";

import L from "leaflet";

// 1. FIX: Track exact lat/lon numbers instead of an array to break the infinite zoom loop
function MapFlyTo({ lat, lon }) {
  const map = useMap();

  useEffect(() => {
    if (lat && lon) {
      // map.getZoom() reads how far you are currently zoomed in, preventing the snap!
      const currentZoom = map.getZoom();

      map.flyTo([lat, lon], currentZoom, {
        duration: 1.5, // Sped up the animation slightly so drawing feels snappier
        easeLinearity: 0.25,
      });
    }
  }, [lat, lon, map]);

  return null;
}

function MapClickHandler({ onLocationSelect }) {
  useMapEvents({
    click: async (e) => {
      const { lat, lng } = e.latlng;
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=10`,
        );
        const data = await response.json();
        let placeName = "Custom Location";
        if (data && data.address) {
          placeName =
            data.address.city ||
            data.address.town ||
            data.address.county ||
            data.address.state ||
            "Custom Location";
        }
        onLocationSelect({ name: placeName, lat: lat, lon: lng });
        // eslint-disable-next-line no-unused-vars
      } catch (error) {
        onLocationSelect({ name: "Selected Location", lat: lat, lon: lng });
      }
    },
  });
  return null;
}

// 2. FIX: Block Strict Mode from duplicating the toolbar during async imports
// 4. Custom Native Draw Tools (Fully Async-Safe for React 18)
function MapDrawTools({ onShapeComplete }) {
  const map = useMap();
  const onShapeCompleteRef = useRef(onShapeComplete);

  useEffect(() => {
    onShapeCompleteRef.current = onShapeComplete;
  }, [onShapeComplete]);

  useEffect(() => {
    // Flag to track if the component is still alive
    let isMounted = true;

    let drawControl = null;
    let drawnItems = null;
    let handleCreated = null;

    window.L = L;

    import("leaflet-draw").then(() => {
      // If React already unmounted this component before the load finished, STOP here!
      if (!isMounted) return;

      drawnItems = new L.FeatureGroup();
      map.addLayer(drawnItems);

      drawControl = new L.Control.Draw({
        edit: { featureGroup: drawnItems },
        draw: {
          circle: false,
          circlemarker: false,
          marker: false,
          polyline: false,
          polygon: true, // Keep the freehand polygon tool
          rectangle: false, // Set this to false to remove the square icon
        },
      });

      map.addControl(drawControl);

      handleCreated = async (e) => {
        const layer = e.layer;
        drawnItems.addLayer(layer);

        const bounds = layer.getBounds();
        const center = bounds.getCenter();

        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${center.lat}&lon=${center.lng}&zoom=10`,
          );

          const data = await response.json();

          const placeName =
            data?.address?.city ||
            data?.address?.town ||
            data?.address?.county ||
            data?.address?.state ||
            "Custom Location";

          onShapeCompleteRef.current({
            name: placeName,
            lat: center.lat,
            lon: center.lng,
          });
        } catch {
          onShapeCompleteRef.current({
            name: "Custom Location",
            lat: center.lat,
            lon: center.lng,
          });
        }
      };

      map.on(L.Draw.Event.CREATED, handleCreated);
    });

    return () => {
      // Mark as dead so the async promise doesn't draw a duplicate
      isMounted = false;

      if (drawControl && map) map.removeControl(drawControl);
      if (drawnItems && map) map.removeLayer(drawnItems);
      if (handleCreated && map && window.L && window.L.Draw) {
        map.off(window.L.Draw.Event.CREATED, handleCreated);
      }
    };
  }, [map]);

  return null;
}

export default function GlobalMapExplorer({
  setActiveView,
  onAnalyzeLocation,
}) {
  const [currentLocation, setCurrentLocation] = useState({
    name: "Raipur",
    lat: 21.2514,
    lon: 81.6296,
  });

  const handleLocationUpdate = (newLoc) => {
    if (newLoc?.lat && newLoc?.lon) {
      setCurrentLocation(newLoc);
    }
  };

  const mapCenter = [currentLocation.lat, currentLocation.lon];

  return (
    <div className="flex flex-col flex-1 relative w-full h-full min-h-[500px] bg-black/40 backdrop-blur-xl border border-white/10 rounded-[2rem] shadow-2xl overflow-hidden z-30">
      <CitySearch onLocationFound={handleLocationUpdate} />

      <div className="relative w-full h-full flex-1 bg-[#e5e5e5]">
        <MapContainer
          center={mapCenter}
          zoom={12}
          zoomControl={false}
          className="absolute inset-0 w-full h-full z-0 cursor-crosshair"
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />

          <MapDrawTools onShapeComplete={handleLocationUpdate} />

          <CircleMarker
            center={mapCenter}
            radius={45}
            pathOptions={{
              color: "#06b6d4",
              fillColor: "#22d3ee",
              fillOpacity: 0.35,
              weight: 2,
            }}
          />

          {/* FIX: Pass lat and lon as separate exact numbers */}
          <MapFlyTo lat={currentLocation.lat} lon={currentLocation.lon} />
          <MapClickHandler onLocationSelect={handleLocationUpdate} />
        </MapContainer>

        <div className="absolute bottom-8 left-8 bg-[#525252]/90 backdrop-blur-xl border border-white/20 p-6 rounded-3xl z-[400] flex flex-col gap-4 text-white">
          <div>
            <h2 className="text-3xl font-bold">{currentLocation.name}</h2>
            <p className="text-white/70 font-mono text-sm mt-1">
              {currentLocation.lat.toFixed(4)}° N,{" "}
              {currentLocation.lon.toFixed(4)}° E
            </p>
          </div>

          <button
            onClick={() => {
              onAnalyzeLocation?.(currentLocation);
              setActiveView("dashboard");
            }}
            className="bg-emerald-500 hover:bg-emerald-600 text-white font-medium py-3 px-6 rounded-xl transition-all shadow-lg flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined text-[20px]">
              analytics
            </span>
            Analyze Heat Risk Here
          </button>
        </div>
      </div>
    </div>
  );
}
