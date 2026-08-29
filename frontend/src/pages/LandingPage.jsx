import MainLayout from '../components/layout/MainLayout';
import Navbar from '../components/layout/Navbar';
import Hero from '../components/sections/Hero';
import LogoStrip from '../components/sections/LogoStrip';
import { useNavigate } from 'react-router-dom';

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <MainLayout>
      <Navbar />
      
      {/* Flex container to push footer to bottom if needed */}
      <div className="flex flex-col min-h-screen pt-20">
        <Hero onStartAnalysis={(requestedCity) => navigate(`/dashboard?city=${encodeURIComponent(requestedCity || '')}`, { state: { requestedCity } })} />
        <LogoStrip />
      </div>
    </MainLayout>
  );
}
