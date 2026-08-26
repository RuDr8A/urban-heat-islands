

export default function Hero({ onStartAnalysis }) {
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

        {/* Main CTA */}
        <div className="pt-8 pb-12 relative z-10">
          <button 
            onClick={onStartAnalysis}
            className="bg-white/20 backdrop-blur-md border border-white/30 text-white font-headline-lg-mobile px-10 py-4 rounded-full shadow-lg transform hover:scale-105 transition-all duration-300 hover:bg-white/30"
          >
            Plan your Analysis →
          </button>
        </div>

      </div>
    </main>
  );
}