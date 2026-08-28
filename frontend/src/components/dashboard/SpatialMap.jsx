
import { MapContainer, TileLayer, CircleMarker, Tooltip, LayersControl, FeatureGroup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css'; 

export default function SpatialMap() {
  const center = [21.2514, 81.6296];

  return (
    <div className="w-full h-full min-h-[400px] rounded-3xl overflow-hidden relative z-0 shadow-[0_8px_32px_0_rgba(0,0,0,0.3)]">
      <MapContainer 
        center={center} 
        zoom={12} 
        scrollWheelZoom={true} 
        zoomControl={true}
        className="w-full h-full absolute inset-0 bg-[#1a1a1a]" 
      >
        {/* Layer Control Menu (Top Right) */}
        <LayersControl position="topright">
          
          {/* BASE MAPS (Radio Buttons - Only one active at a time) */}
          <LayersControl.BaseLayer checked name="Satellite (Hybrid)">
            <TileLayer
              attribution='&copy; Google Maps'
              url="https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}"
            />
          </LayersControl.BaseLayer>

          <LayersControl.BaseLayer name="Terrain">
            <TileLayer
              attribution='&copy; Google Maps'
              url="https://mt1.google.com/vt/lyrs=p&x={x}&y={y}&z={z}"
            />
          </LayersControl.BaseLayer>

          <LayersControl.BaseLayer name="Standard Map">
            <TileLayer
              attribution='&copy; Google Maps'
              url="https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}"
            />
          </LayersControl.BaseLayer>

          {/* OVERLAYS (Checkboxes - Can toggle multiple on/off) */}
          <LayersControl.Overlay checked name="Heat Risk Zones">
            <FeatureGroup>
              {/* Simulated High Heat Zone */}
              <CircleMarker 
                center={center} 
                pathOptions={{ color: '#ffffff', weight: 2, fillColor: '#ef4444', fillOpacity: 0.6 }} 
                radius={50}
              >
                <Tooltip sticky className="bg-black/80 text-white border-white/20 backdrop-blur-md">
                  <span className="font-bold">Core Urban Heat Island</span><br/>
                  Predicted: 46.5°C
                </Tooltip>
              </CircleMarker>

              {/* Simulated Moderate Heat Zone */}
              <CircleMarker 
                center={[21.2650, 81.6400]} 
                pathOptions={{ color: '#ffffff', weight: 2, fillColor: '#f97316', fillOpacity: 0.5 }} 
                radius={35}
              />
            </FeatureGroup>
          </LayersControl.Overlay>

        </LayersControl>
      </MapContainer>
    </div>
  );
}