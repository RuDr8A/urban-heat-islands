

export default function SecondarySidebar() {
  return (
    <aside className="w-panel-width h-full bg-black/40 backdrop-blur-xl border border-white/10 rounded-[2rem] shadow-2xl flex flex-col overflow-y-auto no-scrollbar relative z-40 text-white">
      <div className="p-6 flex flex-col gap-8">
        
        

        {/* Location Info (Replaced User Profile) */}
        <div className="flex flex-col gap-1 -ml-2 p-2 mt-4">
          <span className="text-xs text-white/50 font-label-caps tracking-widest uppercase">Location Analysis</span>
          <div className="flex items-center gap-1 font-headline-lg-mobile text-white text-2xl mt-1 tracking-tight">
            <span>Raipur, India</span>
          </div>
          <span className="text-xs text-white/50 font-data-mono mt-1">21.2514° N, 81.6296° E</span>
        </div>

        {/* Year Selector */}
        <div className="flex flex-col gap-2">
            <h3 className="text-xs text-white/50 mb-2 uppercase font-label-caps tracking-wider">Analysis Year</h3>
            <div className="flex items-center justify-between bg-white/5 border border-white/10 px-4 py-3 rounded-xl cursor-pointer hover:bg-white/10 transition-colors">
              <div className="flex items-center gap-3 text-white font-medium">
                <span className="material-symbols-outlined text-[18px]">calendar_today</span>
                <span>2026 Prediction</span>
              </div>
              <span className="material-symbols-outlined text-[18px] text-white/50">expand_more</span>
            </div>
        </div>

        {/* Environmental Indicators */}
        <div className="flex flex-col gap-2 pt-6 border-t border-white/10 mt-2">
          <h3 className="text-xs text-white/50 mb-3 uppercase font-label-caps tracking-wider">Environmental Indicators</h3>
          
          <div className="flex items-center justify-between px-2 py-2">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-green-400 shadow-[0_0_8px_rgba(74,222,128,0.6)]"></div>
              <span className="text-sm text-white/80">NDVI (Vegetation)</span>
            </div>
            <span className="text-sm font-data-mono text-white">0.135</span>
          </div>

          <div className="flex items-center justify-between px-2 py-2">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-orange-400 shadow-[0_0_8px_rgba(251,146,60,0.6)]"></div>
              <span className="text-sm text-white/80">NDBI (Built-up)</span>
            </div>
            <span className="text-sm font-data-mono text-white">0.031</span>
          </div>

          <div className="flex items-center justify-between px-2 py-2">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-blue-400 shadow-[0_0_8px_rgba(96,165,250,0.6)]"></div>
              <span className="text-sm text-white/80">NDWI (Water)</span>
            </div>
            <span className="text-sm font-data-mono text-white">-0.162</span>
          </div>
        </div>

      </div>
    </aside>
  );
}