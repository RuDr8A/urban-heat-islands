import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import Dashboard from './pages/Dashboard';

function App() {
  return (
    <Router>
      <Routes>
        {/* This tells React: When the URL is exactly "/", show the Landing Page */}
        <Route path="/" element={<LandingPage />} />
        
        {/* This tells React: When the URL is "/dashboard", show the Dashboard */}
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </Router>
  );
}

export default App;