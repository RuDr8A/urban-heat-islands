
export default function DashboardContent() {
  return (
    <main className="flex-1 bg-black/40 backdrop-blur-xl border border-white/10 rounded-[2rem] shadow-2xl relative z-30 flex flex-col p-8 overflow-y-auto no-scrollbar text-white">
      <div className="max-w-6xl mx-auto w-full flex flex-col h-full gap-8">
        
        {/* Header (Updated with elegant typography) */}
       <header className="flex flex-col gap-2 mt-2">
            <h1 className="flex items-baseline gap-3">
                <span className="font-headline-xl text-headline-xl text-white font-bold tracking-tight">Urban Heat</span>
                <span className="font-accent-display text-4xl text-white italic">Intelligence</span>
            </h1>
            <p className="font-body-md text-white/70 text-lg">Machine learning LST prediction & spatial analysis.</p>
        </header>

        <div className="grid grid-cols-12 gap-8 h-full">
          
          {/* Left Column - Stats */}
          <div className="col-span-12 md:col-span-4 flex flex-col gap-6">
            
            {/* Primary Stat Card (Upgraded Glassmorphism) */}
            <div className="bg-white/5 backdrop-blur-xl border border-white/20 rounded-3xl p-6 flex flex-col gap-4 relative overflow-hidden group hover:bg-white/10 transition-colors duration-300 shadow-[0_8px_32px_0_rgba(0,0,0,0.3)]">
              <h3 className="text-white/60 font-medium text-xs tracking-widest uppercase font-label-caps">Predicted LST</h3>
              <div className="flex items-end gap-1">
                <span className="text-[64px] leading-none font-display-xl font-light text-white tracking-tighter">46.49°</span>
                <div className="flex items-center justify-center px-3 py-1.5 rounded-full bg-red-500/20 border border-red-500/30 text-red-400 mb-2 text-sm font-medium">
                  <span className="material-symbols-outlined text-[16px] mr-1">trending_up</span>
                  +0.25°
                </div>
              </div>
            </div>

            {/* Secondary Stat 1 (Upgraded Glassmorphism) */}
            <div className="bg-white/5 backdrop-blur-xl border border-white/20 rounded-3xl p-6 flex flex-col gap-2 relative overflow-hidden hover:bg-white/10 transition-colors duration-300 shadow-[0_8px_32px_0_rgba(0,0,0,0.3)]">
                <h3 className="text-white/60 font-medium text-xs tracking-widest uppercase font-label-caps">Heat Risk Level</h3>
                <span className="text-3xl font-display-xl text-orange-400 mt-2">MODERATE</span>
                <span className="text-xs text-white/40 mt-1">Based on XGBoost predictions</span>
            </div>

            {/* Secondary Stat 2 (Upgraded Glassmorphism) */}
            <div className="bg-white/5 backdrop-blur-xl border border-white/20 rounded-3xl p-6 flex flex-col gap-2 relative overflow-hidden hover:bg-white/10 transition-colors duration-300 shadow-[0_8px_32px_0_rgba(0,0,0,0.3)]">
                <h3 className="text-white/60 font-medium text-xs tracking-widest uppercase font-label-caps">High Heat Area</h3>
                <span className="text-3xl font-display-xl text-white mt-2">18.7%</span>
                <span className="text-xs text-white/40 mt-1">Locations at 48°C or above</span>
            </div>
          </div>

          {/* Right Column - Map/Charts */}
          <div className="col-span-12 md:col-span-8 flex flex-col gap-6">
            
            {/* Navigation Tabs */}
            <div className="flex gap-8 border-b border-white/10 pb-4 relative">
              <button className="font-medium text-white relative pb-1">
                Spatial Heat Map
                <div className="absolute -bottom-[17px] left-0 right-0 h-[2px] bg-white rounded-t-full shadow-[0_-2px_8px_rgba(255,255,255,0.8)]"></div>
              </button>
              <button className="text-white/50 hover:text-white transition-colors pb-1">Historical Trends</button>
              <button className="text-white/50 hover:text-white transition-colors pb-1">SHAP Contributions</button>
            </div>

            {/* Main Map Placeholder (Upgraded Glassmorphism) */}
            <div className="bg-white/5 backdrop-blur-xl border border-white/20 flex-1 rounded-3xl relative overflow-hidden min-h-[400px] flex items-center justify-center shadow-[0_8px_32px_0_rgba(0,0,0,0.3)] hover:bg-white/10 transition-colors duration-300">
                <div className="flex flex-col items-center gap-3 text-white/50">
                  <span className="material-symbols-outlined text-[48px] opacity-70">map</span>
                  <span className="font-body-md tracking-wide">Interactive Map Rendering...</span>
                </div>
            </div>

          </div>
        </div>
      </div>
    </main>
  );
}