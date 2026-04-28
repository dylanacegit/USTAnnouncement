export default function Hero() {
  return (
    <section className="relative min-h-[calc(100svh-64px)] w-full overflow-hidden bg-[#f6c744] sm:min-h-[620px]">
      <img
        src="/images/ust-main-building.png"
        alt="UST Main Building"
        className="absolute inset-0 h-full w-full object-cover lg:w-[84%]"
      />

      <div className="absolute inset-0 bg-black/60 lg:w-[84%]" />
      <div className="absolute inset-y-0 right-0 hidden w-[18%] bg-[#f6c744] lg:block" />

      <div className="relative z-10 flex min-h-[calc(100svh-64px)] flex-col justify-center px-5 py-10 sm:min-h-[620px] sm:px-10 sm:py-12 lg:w-[58%] lg:px-20">
        <p className="mb-4 text-[10px] font-black uppercase tracking-[0.34em] text-[#f6c744] sm:mb-5 sm:text-xs sm:tracking-[0.42em] md:text-sm">
          Academic Year 2025 - 2026
        </p>

        <h2 className="font-serif text-[2.75rem] font-bold leading-[0.95] text-white min-[420px]:text-5xl sm:text-5xl md:text-6xl lg:text-6xl xl:text-7xl">
          Where Thomasians <br />
          <span className="text-[#f6c744]">Come Together.</span>
        </h2>

        <p className="mt-5 max-w-xl text-sm font-medium leading-7 text-white/90 sm:mt-6 sm:text-base">
          Discover academic forums, cultural celebrations, sporting events, and
          everything happening across the Royal Pontifical University.
        </p>

        <div className="mt-7 flex w-full max-w-xl overflow-hidden bg-white shadow-lg">
          <input
            className="h-12 min-w-0 flex-1 px-4 text-sm outline-none sm:px-5"
            placeholder="Search events, colleges, dates..."
          />
          <button className="w-24 bg-[#f6c744] text-sm font-black text-black hover:bg-[#e3b832] sm:w-28">
            Search
          </button>
        </div>

        <div className="mt-9 grid max-w-xl grid-cols-2 gap-x-8 gap-y-6 sm:mt-10 sm:grid-cols-4 sm:gap-6">
          {[
            ["24", "Events This Month"],
            ["8", "Colleges Represented"],
            ["412", "Years of Excellence"],
            ["1,840", "Students Attending"],
          ].map(([num, label]) => (
            <div key={label}>
              <strong className="block font-serif text-3xl font-black text-[#f6c744] sm:text-3xl">
                {num}
              </strong>
              <span className="mt-1 block max-w-[100px] text-xs font-semibold leading-5 text-white">
                {label}
              </span>
            </div>
          ))}
        </div>
      </div>

      <img
        src="/images/tiger-mascot.png"
        alt="UST Tiger Mascot"
        className="pointer-events-none absolute bottom-0 right-[-70px] z-20 hidden h-[72%] object-contain md:block lg:right-3 lg:h-[76%] xl:h-[80%]"
      />
    </section>
  );
}