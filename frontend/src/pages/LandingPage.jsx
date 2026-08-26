
import MainLayout from '../components/layout/MainLayout';
import Navbar from '../components/layout/Navbar';
import Hero from '../components/sections/Hero';
import LogoStrip from '../components/sections/LogoStrip';

export default function LandingPage({ navigateToDashboard }) {
  return (
    <MainLayout>
      <Navbar />
      
      {/* Flex container to push footer to bottom if needed */}
      <div className="flex flex-col min-h-screen pt-20">
        <Hero onStartAnalysis={navigateToDashboard} />
        <LogoStrip />
      </div>
    </MainLayout>
  );
}