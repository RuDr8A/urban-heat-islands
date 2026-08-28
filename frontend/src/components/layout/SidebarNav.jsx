import { Link } from 'react-router-dom';

// 1. Accept the new props
export default function SidebarNav({ onToggleChat, setActiveView, activeView }) {
  return (
    <div className="flex flex-col gap-4 w-sidebar-width h-full relative z-50">
      
      <nav className="flex-1 bg-black/40 backdrop-blur-xl rounded-[2rem] flex flex-col items-center py-6 shadow-2xl border border-white/10">
        
        <div className="mb-8 text-white/50">
          <span className="material-symbols-outlined text-[28px]">satellite_alt</span>
        </div>
        
        <div className="flex-1 flex flex-col gap-6 w-full items-center">
          
          <Link 
            to="/"
            title="Back to Home"
            className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-white/10 text-white transition-all border border-white/20 shadow-sm hover:bg-white/20 hover:scale-105"
          >
            <span className="material-symbols-outlined text-[20px]">home</span>
          </Link>
          
          
          
          {/* 3. Analytics Button - Switches view to 'dashboard' */}
          <button 
            title="Machine Learning Analytics" 
            onClick={() => setActiveView('dashboard')}
            className={`relative flex items-center justify-center w-10 h-10 rounded-xl transition-all ${activeView === 'dashboard' ? 'bg-white/20 text-white' : 'text-white/50 hover:text-white hover:bg-white/10'}`}
          >
            <span className="material-symbols-outlined text-[20px]">analytics</span>
          </button>
          {/* 2. Map Button - Switches view to 'map' */}
          <button 
            title="Global Spatial Map" 
            onClick={() => setActiveView('map')}
            className={`relative flex items-center justify-center w-10 h-10 rounded-xl transition-all ${activeView === 'map' ? 'bg-white/20 text-white' : 'text-white/50 hover:text-white hover:bg-white/10'}`}
          >
            <span className="material-symbols-outlined text-[20px]">map</span>
          </button>

          <button 
            title="Ask AI Analyst" 
            onClick={onToggleChat}
            className="relative flex items-center justify-center w-10 h-10 text-white/50 hover:text-emerald-400 hover:bg-emerald-400/10 rounded-xl transition-all"
          >
            <span className="material-symbols-outlined text-[20px]">psychology</span>
          </button>
        </div>
      </nav>

    </div>
  );
}