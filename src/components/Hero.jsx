export default function Hero() {
  return (
    <section className="relative h-[60vh] w-full overflow-hidden bg-[#f6c744] min-h-[450px]">
      {/* Background Image */}
      <img
        src="/images/ust-main-building.png"
        alt="UST Main Building"
        className="absolute inset-0 h-full w-full object-cover lg:w-[85%]"
      />

      {/* Black Overlay with Angled Cut */}
      <div 
        className="absolute inset-0 bg-black/50 lg:w-[100%]" 
        // style={{ clipPath: "polygon(0 0, 100% 0, 80% 100%, 0% 100%)" }}
      />

      {/* Yellow Angled Section */}
      <div 
        className="absolute inset-y-0 right-0 hidden bg-[#f6c744] lg:block lg:w-[25%]" 
        style={{ clipPath: "polygon(33% 0, 100% 0, 100% 100%, 0% 100%)" }}
      />

      {/* Content Container - Reduced padding from px-20 to lg:px-12 */}
      <div className="relative z-10 flex h-full flex-col justify-center px-4 py-8 sm:px-8 lg:w-[50%] lg:px-12">
        
        {/* 1. Label: Now 7px/8px */}
        <p className="mb-2 text-[7px] font-black font-inter uppercase tracking-[0.4em] text-[#f6c744] sm:text-[8px]">
          Academic Year 2025 - 2026
        </p>

        {/* 2. Main Title: Scaled down again */}
        <h2 className="font-serif text-2xl font-bold leading-[1.1] text-white min-[420px]:text-3xl md:text-4xl lg:text-4xl xl:text-5xl">
          Where Thomasians <br />
          <span className="text-[#f6c744]">Come Together.</span>
        </h2>

        {/* 3. Description: text-xs is now the standard */}
        <p className="mt-3 max-w-sm text-[11px] font-medium leading-relaxed text-white/80 sm:text-xs">
          Discover academic forums, cultural celebrations, and
          everything happening across the Royal Pontifical University.
        </p>

        {/* 4. Search Bar: More compact height (h-9) */}
        <div className="mt-5 flex w-full max-w-sm overflow-hidden bg-white shadow-md">
          <input
            className="h-9 min-w-0 flex-1 px-3 text-[11px] outline-none"
            placeholder="Search events, colleges,..."
          />
          <button className="w-20 bg-[#f6c744] text-[10px] font-black text-black hover:bg-[#e3b832]">
            Search
          </button>
        </div>

        {/* 5. Stats Grid: Tighter spacing and smaller text */}
        <div className="mt-6 grid max-w-sm grid-cols-2 gap-x-4 gap-y-3 sm:grid-cols-4">
          {[
            ["24", "Events"],
            ["8", "Colleges"],
            ["412", "Years"],
            ["1,840", "Students"],
          ].map(([num, label]) => (
            <div key={label}>
              <strong className="block font-serif text-lg font-black text-[#f6c744] sm:text-xl">
                {num}
              </strong>
              <span className="mt-0 block text-[8px] font-bold uppercase tracking-wider text-white/60">
                {label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Tiger Mascot */}
      <img
        src="/images/tiger-mascot.png"
        alt="UST Tiger Mascot"
        className="pointer-events-none absolute bottom-0 right-[-20px] z-20 hidden md:block object-contain h-[85%] lg:right-5 lg:h-[90%] xl:h-[105%]"
      />
    </section>
  );
}