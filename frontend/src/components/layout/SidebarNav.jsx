
import { Link } from 'react-router-dom'; // NEW IMPORT

export default function SidebarNav() {
  return (
    <div className="flex flex-col gap-4 w-sidebar-width h-full relative z-50">
      
      {/* Top Nav Bar - Frosted Glass */}
      <nav className="flex-1 bg-black/40 backdrop-blur-xl rounded-[2rem] flex flex-col items-center py-6 shadow-2xl border border-white/10">
        
        {/* Logo Icon */}
        <div className="mb-8 text-white/50">
          <span className="material-symbols-outlined text-[28px]">satellite_alt</span>
        </div>
        
        <div className="flex-1 flex flex-col gap-6 w-full items-center">
          
          {/* Active Home Button (Now using React Router Link) */}
          <Link 
            to="/"
            title="Back to Home"
            className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-white/10 text-white transition-all border border-white/20 shadow-sm hover:bg-white/20 hover:scale-105"
          >
            <span className="material-symbols-outlined text-[20px]">home</span>
          </Link>
          
          {/* Map View */}
          <button title="Spatial Map" className="relative flex items-center justify-center w-10 h-10 text-white/50 hover:text-white transition-colors">
            <span className="material-symbols-outlined text-[20px]">map</span>
          </button>
          
          {/* ML Analytics */}
          <button title="Machine Learning Analytics" className="relative flex items-center justify-center w-10 h-10 text-white/50 hover:text-white transition-colors">
            <span className="material-symbols-outlined text-[20px]">analytics</span>
          </button>

          {/* AI Analyst Button */}
          <button title="Ask AI Analyst" className="relative flex items-center justify-center w-10 h-10 text-white/50 hover:text-white transition-colors">
            <span className="material-symbols-outlined text-[20px]">psychology</span>
          </button>
        </div>
      </nav>

    </div>
  );
}