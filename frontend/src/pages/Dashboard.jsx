
import SidebarNav from '../components/layout/SidebarNav';
import SecondarySidebar from '../components/layout/SecondarySidebar';
import DashboardContent from '../components/dashboard/DashboardContent';
import cityPhoto from '../assets/city-photo.jpeg'; 

export default function Dashboard() {
  return (
    <div className="relative text-white font-body-md h-screen w-screen overflow-hidden flex p-4 gap-4">
      
      {/* Cinematic Background Layer */}
      <div className="absolute inset-0 z-[-1]">
        <img 
          src={cityPhoto} 
          alt="Aerial city view" 
          className="w-full h-full object-cover" 
        />
        {/* Your customized gradient overlay */}
        <div className="absolute inset-0 bg-black/40"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent"></div>
      </div>

      {/* Navigation and Content Components */}
      <SidebarNav />
      <SecondarySidebar />
      <DashboardContent />
      
    </div>
  );
}