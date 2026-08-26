

export default function Navbar() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 md:px-margin-desktop py-6 bg-transparent">
      
      {/* 1. LEFT SIDE - Added flex-1 and justify-start */}
      <div className="flex-1 flex items-center justify-start">
        <span className="font-headline-lg-mobile md:text-headline-lg text-white font-bold leading-none">
          Urban Heat Intel
        </span>
      </div>

      {/* 2. CENTER - Perfectly centered now */}
      <nav className="hidden md:flex items-center justify-center gap-8">
        <a className="text-white/80 hover:text-white transition-colors leading-none" href="#">About Us</a>
        <a className="text-white/80 hover:text-white transition-colors leading-none" href="#">Data</a>
        <a className="text-white/80 hover:text-white transition-colors leading-none" href="#">Methodology</a>
      </nav>

      {/* 3. RIGHT SIDE - Added flex-1 and justify-end */}
      <div className="flex-1 flex justify-end">
        <button className="bg-white/10 backdrop-blur-md border border-white/20 text-white font-body-md px-6 py-2 rounded-lg hover:bg-white/20 transition-all duration-300 leading-none">
          Analyze Data
        </button>
      </div>

    </header>
  );
}