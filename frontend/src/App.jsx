import { useState } from 'react';
import LandingPage from './pages/LandingPage';
// We will import the Dashboard here later!
// import Dashboard from './pages/Dashboard';

function App() {
  const [currentView, setCurrentView] = useState('landing');

  const navigateToDashboard = () => {
    // This will trigger when the user clicks "Analyze Data" or "Plan your Analysis"
    setCurrentView('dashboard');
  };

  return (
    <>
      {currentView === 'landing' && (
        <LandingPage navigateToDashboard={navigateToDashboard} />
      )}
      
      {currentView === 'dashboard' && (
        <div className="text-white flex flex-col items-center justify-center h-screen bg-[#191c1e]">
           {/* Placeholder for the Dashboard we will integrate next */}
           <h1 className="text-3xl font-light tracking-wide mb-6">Dashboard Loading...</h1>
           <button 
             onClick={() => setCurrentView('landing')}
             className="px-6 py-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-lg hover:bg-white/20 transition-all"
           >
             ← Back to Home
           </button>
        </div>
      )}
    </>
  );
}

export default App;