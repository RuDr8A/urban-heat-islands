
import { Link } from 'react-router-dom';

export default function Navbar() {
  return (
    <nav className="absolute top-0 left-0 right-0 z-50 px-8 py-6 flex justify-between items-center text-white">
      <div className="text-2xl font-bold tracking-tight">Urban Heat Intel</div>
      
      <div className="hidden md:flex gap-8 text-sm font-medium text-white/80">
        <a href="#about" className="hover:text-white transition-colors">About Us</a>
        <a href="#data" className="hover:text-white transition-colors">Data</a>
        <a href="#methodology" className="hover:text-white transition-colors">Methodology</a>
      </div>

      <div className="flex items-center gap-4">
        <Link 
          to="/dashboard" 
          className="px-6 py-2.5 bg-white/10 hover:bg-white/20 border border-white/20 rounded-full text-white font-medium transition-all shadow-lg backdrop-blur-md"
        >
          Go to Dashboard
        </Link>
      </div>
    </nav>
  );
}