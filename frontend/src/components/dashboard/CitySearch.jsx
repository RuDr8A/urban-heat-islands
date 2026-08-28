import  { useState } from 'react';

export default function CitySearch({ onLocationFound }) {
  const [query, setQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query) return;

    setIsSearching(true);
    try {
      // Free OpenStreetMap Geocoding API
      const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${query}&limit=1`);
      const data = await response.json();

      if (data && data.length > 0) {
        const { lat, lon, display_name } = data[0];
        const shortName = display_name.split(',')[0]; // Grabs just the city name
        
        onLocationFound({
          lat: parseFloat(lat),
          lon: parseFloat(lon),
          name: shortName
        });
        setQuery('');
      } else {
        alert("City not found. Try a different search.");
      }
    } catch (error) {
      console.error("Geocoding failed:", error);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <form onSubmit={handleSearch} className="absolute top-6 left-1/2 -translate-x-1/2 z-[400] w-full max-w-md">
      <div className="relative flex items-center shadow-2xl">
        <span className="material-symbols-outlined absolute left-4 text-white/50">search</span>
        <input 
          type="text" 
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search any global city..." 
          className="w-full bg-black/60 backdrop-blur-xl border border-white/20 rounded-2xl py-4 pl-12 pr-16 text-white placeholder:text-white/50 focus:outline-none focus:border-emerald-500/50 transition-all shadow-inner"
        />
        <button 
          type="submit" 
          disabled={isSearching}
          className="absolute right-2 bg-emerald-500/20 text-emerald-400 p-2 rounded-xl hover:bg-emerald-500/40 transition-colors"
        >
          {isSearching ? (
            <span className="material-symbols-outlined animate-spin text-[20px]">sync</span>
          ) : (
            <span className="material-symbols-outlined text-[20px]">flight_takeoff</span>
          )}
        </button>
      </div>
    </form>
  );
}