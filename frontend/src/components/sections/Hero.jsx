/* eslint-disable no-unused-vars */
import  { useState, useEffect, useRef } from 'react';

export default function Hero({ onStartAnalysis }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [selectedSuggestion, setSelectedSuggestion] = useState(null);
  
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (searchQuery.trim().length < 3) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSuggestions([]);
      setShowDropdown(false);
      return;
    }

    setIsTyping(true);
    
    const delayDebounceFn = setTimeout(async () => {
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&countrycodes=in&limit=5`
        );
        const data = await response.json();
        
        setSuggestions(data);
        setShowDropdown(true);
      } catch (error) {
        console.error("Error fetching locations:", error);
      } finally {
        setIsTyping(false);
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    onStartAnalysis(selectedSuggestion?.name || searchQuery);
  };

  // NEW: Prevent Enter key from submitting the form early
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault(); 
      // This stops the Enter key from submitting, giving them time to click a dropdown item
    }
  };

  const handleSelectSuggestion = (suggestion) => {
    setSearchQuery(suggestion.display_name);
    setSelectedSuggestion(suggestion);
    setShowDropdown(false);
  };

  const handleCurrentLocation = () => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude.toFixed(4);
          const lng = position.coords.longitude.toFixed(4);
          setSearchQuery(`${lat}, ${lng}`);
          setShowDropdown(false);
        },
        (error) => {
          alert("Could not get location. Please type it manually.");
        }
      );
    } else {
      alert("Geolocation is not supported by your browser.");
    }
  };

  return (
    <main className="flex-grow flex flex-col items-center justify-center pt-32 pb-16 px-margin-mobile md:px-margin-desktop text-center mt-24">
      <div className="max-w-4xl mx-auto space-y-6 py-8 px-10">
        
        {/* Headline */}
        <h1 className="flex flex-col items-center justify-center gap-2">
          <span className="font-headline-xl text-headline-xl text-white font-bold tracking-tight">
            Track urban heat,
          </span>
          <span className="font-accent-display text-accent-display text-white italic">
            in real time
          </span>
        </h1>

        {/* Subtitle */}
        <p className="font-body-md text-white/90 max-w-2xl mx-auto leading-relaxed">
          It's less about raw data, and more about building cooler, sustainable cities.
        </p>

        {/* Action Area (Search + Buttons) */}
        <div className="pt-8 pb-12 relative z-10 flex flex-col items-center gap-4 w-full">
          
          {/* NESTED PILL SEARCH BAR */}
          <div className="relative w-full max-w-2xl" ref={dropdownRef}>
            <form 
              onSubmit={handleSubmit}
              className="flex items-center w-full bg-white/10 backdrop-blur-md border border-white/30 rounded-full p-1.5 shadow-lg transition-all focus-within:bg-white/15"
            >
              {/* Left: Input Box */}
              <input 
                type="text"
                placeholder="Enter an address or area..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setSelectedSuggestion(null);
                }}
                onKeyDown={handleKeyDown} /* <--- ADDED HERE */
                onFocus={() => suggestions.length > 0 && setShowDropdown(true)}
                className="flex-1 bg-transparent border-none text-white placeholder-white/60 px-6 py-3 outline-none focus:ring-0 font-body-md"
              />
              
              {/* Right: Inset Button */}
              <button 
                type="submit"
                className="bg-black/40 hover:bg-black/60 backdrop-blur-sm border border-white/10 text-white font-body-md font-bold px-8 py-3 rounded-full transition-all duration-300 whitespace-nowrap"
              >
                Plan your Analysis →
              </button>
            </form>

            {/* Autocomplete Dropdown Menu */}
            {showDropdown && suggestions.length > 0 && (
              <ul className="absolute top-full left-0 right-0 mt-3 bg-[#191c1e]/95 backdrop-blur-xl border border-white/20 rounded-2xl overflow-hidden shadow-2xl z-50 text-left max-h-60 overflow-y-auto">
                {suggestions.map((item) => (
                  <li 
                    key={item.place_id}
                    onClick={() => handleSelectSuggestion(item)}
                    className="px-6 py-3 text-white/90 hover:bg-white/10 hover:text-white cursor-pointer transition-colors text-sm border-b border-white/5 last:border-none flex flex-col gap-1"
                  >
                    <span className="font-semibold truncate">{item.name || item.display_name.split(',')[0]}</span>
                    <span className="text-xs text-white/50 truncate">{item.display_name}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Row 2: Current Location Helper */}
          <button 
            type="button"
            onClick={handleCurrentLocation}
            className="flex items-center gap-2 text-white/70 hover:text-white text-sm bg-black/20 hover:bg-black/40 px-5 py-2 rounded-full backdrop-blur-sm transition-all duration-300 border border-transparent hover:border-white/20 mt-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
            </svg>
            Use Current Location
          </button>

        </div>

      </div>
    </main>
  );
}
