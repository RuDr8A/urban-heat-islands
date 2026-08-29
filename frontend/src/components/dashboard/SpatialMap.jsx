import { useEffect, useRef } from 'react';
import { CircleMarker, FeatureGroup, LayersControl, MapContainer, TileLayer, Tooltip, useMap, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

function FitToHeatmap({ points }) {
  const map = useMap();
  useEffect(() => {
    if (points.length) map.setView([points[0].latitude, points[0].longitude], 12);
  }, [map, points]);
  return null;
}

function MapBackgroundClick({ ignoreNextMapClickRef, onMapClick }) {
  useMapEvents({ click: (event) => {
    if (ignoreNextMapClickRef.current) {
      ignoreNextMapClickRef.current = false;
      return;
    }
    onMapClick({ latitude: event.latlng.lat, longitude: event.latlng.lng });
  } });
  return null;
}

function riskColor(category) {
  if (category === 'VERY HIGH' || category === 'HIGH') return '#ef4444';
  if (category === 'MODERATE') return '#f97316';
  return '#22c55e';
}

function selectHeatmapPoint(event, point, ignoreNextMapClickRef, onPointSelect) {
  event.originalEvent?.stopPropagation();
  ignoreNextMapClickRef.current = true;
  onPointSelect(point);
}

export default function SpatialMap({ city, heatmap, risk, hotspots, onPointSelect, onMapClick }) {
  const ignoreNextMapClickRef = useRef(false);
  const center = heatmap.length ? [heatmap[0].latitude, heatmap[0].longitude] : [21.2514, 81.6296];
  return (
    <div className="w-full h-full min-h-[400px] rounded-3xl overflow-hidden relative z-0 shadow-[0_8px_32px_0_rgba(0,0,0,0.3)]">
      <MapContainer center={center} zoom={12} scrollWheelZoom zoomControl className="w-full h-full absolute inset-0 bg-[#1a1a1a]">
        <FitToHeatmap points={heatmap} />
        <MapBackgroundClick ignoreNextMapClickRef={ignoreNextMapClickRef} onMapClick={onMapClick} />
        <LayersControl position="topright">
          <LayersControl.BaseLayer checked name="Satellite (Hybrid)"><TileLayer attribution="&copy; Google Maps" url="https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}" /></LayersControl.BaseLayer>
          <LayersControl.BaseLayer name="Terrain"><TileLayer attribution="&copy; Google Maps" url="https://mt1.google.com/vt/lyrs=p&x={x}&y={y}&z={z}" /></LayersControl.BaseLayer>
          <LayersControl.BaseLayer name="Standard Map"><TileLayer attribution="&copy; Google Maps" url="https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}" /></LayersControl.BaseLayer>
          <LayersControl.Overlay checked name="Predicted Heat"><FeatureGroup>{heatmap.map((point, index) => <CircleMarker key={point.sample_id || `${point.latitude}-${point.longitude}-${index}`} center={[point.latitude, point.longitude]} radius={5} pathOptions={{ color: '#ffffff', weight: 1, fillColor: riskColor(point.predicted_LST >= 55 ? 'VERY HIGH' : point.predicted_LST >= 48 ? 'HIGH' : point.predicted_LST >= 40 ? 'MODERATE' : 'LOW'), fillOpacity: 0.65, bubblingMouseEvents: false }} eventHandlers={{ click: (event) => selectHeatmapPoint(event, point, ignoreNextMapClickRef, onPointSelect) }}><Tooltip sticky><strong>{city}</strong><br />Predicted: {Number(point.predicted_LST).toFixed(2)}°C<br />Observed: {Number(point.LST).toFixed(2)}°C</Tooltip></CircleMarker>)}</FeatureGroup></LayersControl.Overlay>
          <LayersControl.Overlay checked name="Heat Risk Zones"><FeatureGroup>{risk.map((cell, index) => <CircleMarker key={`${cell.latitude}-${cell.longitude}-${index}`} center={[cell.latitude, cell.longitude]} radius={cell.is_hotspot ? 7 : 4} pathOptions={{ color: '#ffffff', weight: 1, fillColor: riskColor(cell.risk_category), fillOpacity: 0.45, interactive: false }}><Tooltip sticky><strong>{cell.risk_category}</strong><br />Risk score: {Number(cell.risk_score).toFixed(2)}</Tooltip></CircleMarker>)}</FeatureGroup></LayersControl.Overlay>
          <LayersControl.Overlay checked name="Persistent Hotspots"><FeatureGroup>{hotspots.map((hotspot, index) => <CircleMarker key={`${hotspot.latitude}-${hotspot.longitude}-${index}`} center={[hotspot.latitude, hotspot.longitude]} radius={9} pathOptions={{ color: '#ffffff', weight: 2, fillColor: '#e11d48', fillOpacity: 0.8, interactive: false }}><Tooltip sticky><strong>Persistent hotspot</strong><br />Persistence: {hotspot.persistence_category}</Tooltip></CircleMarker>)}</FeatureGroup></LayersControl.Overlay>
        </LayersControl>
      </MapContainer>
    </div>
  );
}
