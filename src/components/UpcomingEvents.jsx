export default function UpcomingEvents() {
  // Static array to visualize the row of 4 cards
  const dummyEvents = Array(4).fill({
    title: "Thomasian Welcome Walk 2026",
    category: "TRADITION",
    date: "Aug 1, 2026",
    image: "/images/ust-main-building.png"
  });

  return (
    <section className="mt-10 sm:mt-12">
      {/* --- Section Header --- */}
      <div className="mb-6 flex items-center justify-between gap-4">
        <h2 className="font-playfair text-2xl font-bold sm:text-3xl text-neutral-800">
          Upcoming Events
        </h2>

        <button className="shrink-0 text-[10px] font-black uppercase tracking-widest text-[#c49600] hover:underline">
          View All →
        </button>
      </div>

      {/* --- The Row of Cards --- */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {dummyEvents.map((_, index) => (
          <div
            key={index}
            className="flex flex-col bg-white border border-neutral-100 shadow-sm transition-all border-t-[4px] border-t-[#f6c744]"
          >
            {/* Image Section - 4:3 Aspect Ratio */}
            <div className="relative aspect-[4/3] overflow-hidden">
              <img
                src="/images/ust-main-building.png" 
                alt="Event"
                className="h-full w-full object-cover"
              />
            </div>

            {/* Content Section */}
            <div className="p-5 flex-1 flex flex-col">
              {/* Category Meta */}
              <span className="text-[9px] font-black uppercase tracking-[0.2em] text-neutral-400">
                TRADITION
              </span>

              {/* Title - Playfair Display Font */}
              <h3 className="mt-2 font-playfair text-[15px] font-bold leading-tight text-neutral-900">
                Thomasian Welcome Walk 2026
              </h3>

              {/* Date Info */}
              <p className="mt-4 text-[12px] text-neutral-400">
                Aug 1, 2026
              </p>

              {/* High-Contrast View Button */}
              <button className="mt-6 w-full bg-[#1a1a1a] py-3 text-[9px] font-black uppercase tracking-[0.2em] text-white hover:bg-[#f6c744] hover:text-black transition-colors">
                View
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}