import MainLayout from '../components/layout/MainLayout';
import Navbar from '../components/layout/Navbar';
import Hero from '../components/sections/Hero';
import LogoStrip from '../components/sections/LogoStrip';
import HomeSections from '../components/sections/HomeSections';
import { useNavigate } from 'react-router-dom';

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <MainLayout>
      <Navbar />

      <div className="flex flex-col min-h-screen pt-20">

        <Hero
          onStartAnalysis={(requestedCity) =>
            navigate(
              `/dashboard?city=${encodeURIComponent(
                requestedCity || ''
              )}`,
              {
                state: {
                  requestedCity
                }
              }
            )
          }
        />

        <LogoStrip />

        <HomeSections />

      </div>
    </MainLayout>
  );
}