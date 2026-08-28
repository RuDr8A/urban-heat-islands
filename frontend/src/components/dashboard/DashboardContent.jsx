import { useState, useEffect } from 'react';
import { heatApi } from '../../services/api';
import SpatialMap from './SpatialMap';
import HistoricalTrends from './HistoricalTrends';
import ShapChart from './ShapChart';

export default function DashboardContent() {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('map');
  
  // NEW: State for the selected year
  const [selectedYear, setSelectedYear] = useState(2026);
  const [sliderValues, setSliderValues] = useState({ ndvi: 0.135, ndbi: 0.031, ndwi: -0.162 });
  
  // Update this state to include the year
  const [simulationParams, setSimulationParams] = useState({ 
    ndvi: 0.135, ndbi: 0.031, ndwi: -0.162, year: 2026 
  });

  useEffect(() => {
    const fetchMLData = async () => {
      try {
        setIsLoading(true);
        // Payload now dynamically grabs the year from simulationParams
        const payload = { 
          lat: 21.2514, 
          lon: 81.6296, 
          year: simulationParams.year,
          ndvi: simulationParams.ndvi,
          ndbi: simulationParams.ndbi,
          ndwi: simulationParams.ndwi
        }; 
        
        const result = await heatApi.getPrediction(payload);
        setData(result);
      } catch (error) {
        console.error("Failed to load dashboard data", error);
        setData({ lst: 46.49, variance: "+0.25°", risk: "MODERATE", highHeatArea: 18.7 });
      } finally {
        setIsLoading(false);
      }
    };

    fetchMLData();
  }, [simulationParams]); 

  return (
    <main className="flex-1 bg-black/40 backdrop-blur-xl border border-white/10 rounded-[2rem] shadow-2xl relative z-30 flex flex-col p-8 overflow-y-auto no-scrollbar text-white">
      <div className="max-w-6xl mx-auto w-full flex flex-col h-full gap-8">
        
        <header className="flex flex-col gap-2 mt-2">
            <h1 className="flex items-baseline gap-3">
                <span className="font-headline-xl text-headline-xl text-white font-bold tracking-tight">Urban Heat</span>
                <span className="font-accent-display text-4xl text-white italic">Intelligence</span>
            </h1>
            <p className="font-body-md text-white/70 text-lg">Machine learning LST prediction & spatial analysis.</p>
        </header>

        <div className="grid grid-cols-12 gap-10 h-full pb-5">
          
          {/* Left Column - Sidebar */}
          <div className="col-span-12 md:col-span-4 flex flex-col gap-6 ml-1 ">
            
            <div className="bg-white/5 backdrop-blur-xl border border-white/20 rounded-3xl p-6 flex flex-col gap-6 shadow-[0_8px_32px_0_rgba(0,0,0,0.3)]">
              <div>
                <h3 className="text-white/60 font-medium text-xs tracking-widest uppercase font-label-caps mb-1">Location Analysis</h3>
                <h2 className="text-2xl font-semibold">Raipur, India</h2>
                <p className="text-sm text-white/40 font-mono mt-1">21.2514° N, 81.6296° E</p>
              </div>

              {/* INTERACTIVE YEAR DROPDOWN */}
              <div>
                <h3 className="text-white/60 font-medium text-xs tracking-widest uppercase font-label-caps mb-2">Analysis Year</h3>
                <div className="bg-white/10 border border-white/10 rounded-xl px-4 py-3 flex items-center justify-between hover:bg-white/20 transition-colors relative focus-within:ring-2 focus-within:ring-emerald-500/50">
                  <div className="flex items-center gap-3 w-full">
                    <span className="material-symbols-outlined text-[18px] text-emerald-400">calendar_month</span>
                    <select 
                      value={selectedYear}
                      onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                      className="bg-transparent text-white font-medium w-full outline-none appearance-none cursor-pointer"
                    >
                      <option value={2024} className="bg-gray-900 text-white">2024 (Baseline)</option>
                      <option value={2026} className="bg-gray-900 text-white">2026 Prediction</option>
                      <option value={2030} className="bg-gray-900 text-white">2030 Prediction</option>
                      <option value={2040} className="bg-gray-900 text-white">2040 Prediction</option>
                      <option value={2050} className="bg-gray-900 text-white">2050 Prediction</option>
                    </select>
                  </div>
                  {/* Custom Chevron to replace default browser dropdown arrow */}
                  <span className="material-symbols-outlined text-[20px] pointer-events-none absolute right-4 text-white/50">expand_more</span>
                </div>
              </div>

              {/* INTERACTIVE ENVIRONMENTAL SLIDERS */}
              <div className="flex flex-col gap-5 pt-2 border-t border-white/10">
                <h3 className="text-white/60 font-medium text-xs tracking-widest uppercase font-label-caps mb-1">Environmental Indicators</h3>

                {/* NDVI Slider */}
                <div className="flex flex-col gap-2">
                  <div className="flex justify-between text-sm items-center">
                    <span className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-emerald-500"></span>NDVI (Vegetation)</span>
                    <span className="font-mono text-white/80">{sliderValues.ndvi.toFixed(3)}</span>
                  </div>
                  <input 
                    type="range" min="-1" max="1" step="0.01" 
                    value={sliderValues.ndvi} 
                    onChange={(e) => setSliderValues({...sliderValues, ndvi: parseFloat(e.target.value)})}
                    className="w-full h-1 bg-white/20 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                  />
                </div>

                {/* NDBI Slider */}
                <div className="flex flex-col gap-2">
                  <div className="flex justify-between text-sm items-center">
                    <span className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-orange-500"></span>NDBI (Built-up)</span>
                    <span className="font-mono text-white/80">{sliderValues.ndbi.toFixed(3)}</span>
                  </div>
                  <input 
                    type="range" min="-1" max="1" step="0.01" 
                    value={sliderValues.ndbi} 
                    onChange={(e) => setSliderValues({...sliderValues, ndbi: parseFloat(e.target.value)})}
                    className="w-full h-1 bg-white/20 rounded-lg appearance-none cursor-pointer accent-orange-500"
                  />
                </div>

                {/* NDWI Slider */}
                <div className="flex flex-col gap-2">
                  <div className="flex justify-between text-sm items-center">
                    <span className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-blue-500"></span>NDWI (Water)</span>
                    <span className="font-mono text-white/80">{sliderValues.ndwi.toFixed(3)}</span>
                  </div>
                  <input 
                    type="range" min="-1" max="1" step="0.01" 
                    value={sliderValues.ndwi} 
                    onChange={(e) => setSliderValues({...sliderValues, ndwi: parseFloat(e.target.value)})}
                    className="w-full h-1 bg-white/20 rounded-lg appearance-none cursor-pointer accent-blue-500"
                  />
                </div>

                {/* UPDATED BUTTON: Now pushes the selectedYear into the simulation parameters */}
                <button 
                  onClick={() => setSimulationParams({ ...sliderValues, year: selectedYear })}
                  className="mt-2 w-full bg-white/10 hover:bg-white/20 border border-white/20 text-white py-2.5 rounded-xl transition-all font-medium text-sm shadow-lg active:scale-[0.98] flex items-center justify-center gap-2"
                >
                  <span className="material-symbols-outlined text-[18px]">science</span>
                  Run Simulation
                </button>
              </div>
            </div>
          </div>

          {/* Right Column - Stats & Tabs */}
          <div className="col-span-12 md:col-span-8 flex flex-col gap-6">
            
            {/* Top Stat Row */}
            <div className="grid grid-cols-3 gap-6">
              <div className="bg-white/5 backdrop-blur-xl border border-white/20 rounded-3xl p-6 flex flex-col gap-3 shadow-[0_8px_32px_0_rgba(0,0,0,0.3)] hover:bg-white/10 transition-colors">
                <h3 className="text-white/60 font-medium text-xs tracking-widest uppercase font-label-caps">Predicted LST</h3>
                <div className="flex items-end gap-1">
                  <span className="text-4xl font-display-xl font-light text-white tracking-tighter">
                      {isLoading ? '--.--' : data?.lst}°
                  </span>
                  <div className="flex items-center justify-center px-2 py-1 rounded-full bg-red-500/20 border border-red-500/30 text-red-400 mb-1 text-xs font-medium ml-2">
                    {isLoading ? '--' : data?.variance}
                  </div>
                </div>
              </div>

              <div className="bg-white/5 backdrop-blur-xl border border-white/20 rounded-3xl p-6 flex flex-col gap-2 shadow-[0_8px_32px_0_rgba(0,0,0,0.3)] hover:bg-white/10 transition-colors">
                  <h3 className="text-white/60 font-medium text-xs tracking-widest uppercase font-label-caps">Heat Risk Level</h3>
                  <span className={`text-2xl font-display-xl mt-1 ${data?.risk === 'SEVERE' || data?.risk === 'HIGH' ? 'text-red-500' : 'text-orange-400'}`}>
                      {isLoading ? '...' : data?.risk}
                  </span>
              </div>

              <div className="bg-white/5 backdrop-blur-xl border border-white/20 rounded-3xl p-6 flex flex-col gap-2 shadow-[0_8px_32px_0_rgba(0,0,0,0.3)] hover:bg-white/10 transition-colors">
                  <h3 className="text-white/60 font-medium text-xs tracking-widest uppercase font-label-caps">High Heat Area</h3>
                  <span className="text-2xl font-display-xl text-white mt-1">
                      {isLoading ? '--.-' : data?.highHeatArea}%
                  </span>
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex gap-8 border-b border-white/10 pb-4 relative mt-2">
              <button onClick={() => setActiveTab('map')} className={`font-medium relative pb-1 transition-colors ${activeTab === 'map' ? 'text-white' : 'text-white/50 hover:text-white'}`}>
                Spatial Heat Map
                {activeTab === 'map' && <div className="absolute -bottom-[17px] left-0 right-0 h-[2px] bg-white rounded-t-full shadow-[0_-2px_8px_rgba(255,255,255,0.8)]"></div>}
              </button>
              <button onClick={() => setActiveTab('trends')} className={`font-medium relative pb-1 transition-colors ${activeTab === 'trends' ? 'text-white' : 'text-white/50 hover:text-white'}`}>
                Historical Trends
                {activeTab === 'trends' && <div className="absolute -bottom-[17px] left-0 right-0 h-[2px] bg-white rounded-t-full shadow-[0_-2px_8px_rgba(255,255,255,0.8)]"></div>}
              </button>
              <button onClick={() => setActiveTab('shap')} className={`font-medium relative pb-1 transition-colors ${activeTab === 'shap' ? 'text-white' : 'text-white/50 hover:text-white'}`}>
                SHAP Contributions
                {activeTab === 'shap' && <div className="absolute -bottom-[17px] left-0 right-0 h-[2px] bg-white rounded-t-full shadow-[0_-2px_8px_rgba(255,255,255,0.8)]"></div>}
              </button>
            </div>

            {/* Dynamic Card Container */}
            <div className="bg-white/5 backdrop-blur-xl border border-white/20 flex-1 rounded-3xl p-4 relative overflow-hidden min-h-[400px] shadow-[0_8px_32px_0_rgba(0,0,0,0.3)]">
                {activeTab === 'map' && <SpatialMap />}
                {activeTab === 'trends' && <HistoricalTrends />}
                {activeTab === 'shap' && <ShapChart />}
            </div>

          </div>
        </div>
      </div>
    </main>
  );
}