
import cityPhoto from '../../assets/city-photo.jpeg'; 

export default function MainLayout({ children }) {
  return (
    <div className="text-white font-body-md min-h-screen flex flex-col relative overflow-x-hidden">
      
      {/* 1. BACKGROUND LAYER (z-0) */}
      <div className="fixed inset-0 z-0">
        <img 
          alt="Aerial city view" 
          className="w-full h-full object-cover opacity-55" 
          src={cityPhoto}
        />
        {/* Gradients */}
        <div className="absolute inset-0 bg-black/40"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent"></div>
      </div>

      {/* 2. FOREGROUND CONTENT LAYER (z-10) */}
      {/* This guarantees your text sits ON TOP of the image */}
      <div className="relative z-10 flex flex-col flex-grow">
        {children}
      </div>
      
    </div>
  );
}