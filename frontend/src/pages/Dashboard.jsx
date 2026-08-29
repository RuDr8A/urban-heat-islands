import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import SidebarNav from '../components/layout/SidebarNav';
import DashboardContent from '../components/dashboard/DashboardContent';
import GlobalMapExplorer from '../components/dashboard/GlobalMapExplorer'; // 1. Import the new component
import AiChatDrawer from '../components/dashboard/AiChatDrawer';
import cityPhoto from '../assets/city-photo.jpeg'; 

export default function Dashboard() {
  const location = useLocation();
  const requestedCity = new URLSearchParams(location.search).get('city') || location.state?.requestedCity;
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [analysisContext, setAnalysisContext] = useState({ city: 'Raipur', location: null });
  
  // 2. Add state to track which page is active (defaults to 'dashboard')
  const [activeView, setActiveView] = useState('dashboard'); 
  const [selectedGlobalLocation, setSelectedGlobalLocation] = useState(null);

  return (
    <div className="relative text-white font-body-md h-screen w-screen overflow-hidden flex p-4 gap-4">
      <div className="absolute inset-0 z-[-1]">
        <img
          src={cityPhoto}
          alt="Aerial city view"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/40"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent"></div>
      </div>

      {/* 3. Pass the view switcher function to the Sidebar */}
      <SidebarNav
        onToggleChat={() => setIsChatOpen(!isChatOpen)}
        setActiveView={setActiveView}
        activeView={activeView}
      />

      {/* 4. Switch between the Dashboard and the Global Map */}
      {activeView === "dashboard" ? (
        <DashboardContent
          requestedCity={requestedCity}
          requestedLocation={selectedGlobalLocation}
          onAnalysisContextChange={setAnalysisContext}
        />
      ) : (
        <GlobalMapExplorer
          setActiveView={setActiveView}
          onAnalyzeLocation={setSelectedGlobalLocation}
        />
      )}

      {/* Sliding AI Assistant */}
      <AiChatDrawer
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        city={analysisContext.city}
        location={analysisContext.location}
      />
    </div>
  );
}
