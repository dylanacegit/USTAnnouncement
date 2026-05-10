import MainLayout from "../components/MainLayout";

export default function Events() {
  // Static data for design preview
  const featured = {
    title: "University-wide Baccalaureate Mass 2026",
    category: "RELIGIOUS",
    location: "UST Grandstand",
    startTime: "4:00 PM",
    startDate: "2026-05-20",
    image: "/images/ust-main-building.png",
    description: "Join the Thomasian community in a solemn celebration of faith and gratitude as we send off our graduating batch."
  };

  const dummyEvents = Array(8).fill({
    title: "Thomasian Welcome Walk 2026",
    category: "TRADITION",
    location: "Arch of the Centuries",
    startDate: "2026-08-01",
    image: "/images/ust-main-building.png"
  });

  return (
    <div className="min-h-screen w-full bg-white text-black">
      
      {/* --- HERO SECTION --- */}
      <section className="relative h-[60vh] w-full overflow-hidden bg-neutral-900 min-h-[450px]">
        <img
          src={featured.image}
          alt={featured.title}
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-black/60" />

        <div className="relative z-10 flex h-full flex-col justify-center px-4 py-8 sm:px-8 lg:w-[60%] lg:px-12">
          <p className="mb-2 text-[7px] font-black font-inter uppercase tracking-[0.4em] text-[#f6c744] sm:text-[8px]">
            {featured.category} · {new Date(featured.startDate).getFullYear()}
          </p>

          <h1 className="font-playfair text-2xl font-bold leading-[1.1] text-white min-[420px]:text-3xl md:text-4xl lg:text-4xl xl:text-5xl">
            {featured.title}
          </h1>

          <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-[10px] font-black uppercase tracking-wider text-[#f6c744]">
            <span className="flex items-center gap-2 text-white/90">
              <div className="h-2 w-2 bg-[#f6c744]" /> {featured.location}
            </span>
            <span className="flex items-center gap-2 text-white/90">
              <div className="h-2 w-2 bg-[#f6c744]" /> {featured.startTime}
            </span>
          </div>

          <p className="mt-3 max-w-md text-[11px] font-inter leading-relaxed text-white/80 sm:text-xs italic line-clamp-2">
            {featured.description}
          </p>

          <button className="mt-6 w-fit bg-[#f6c744] px-8 py-2.5 text-[10px] font-black uppercase tracking-widest text-black transition-colors hover:bg-white">
            View Event Details
          </button>
        </div>
      </section>

      {/* --- MAIN CONTENT AREA --- */}
      <MainLayout>
        <div className="px-4 py-10 sm:px-6 lg:px-8">
          
          {/* Header & Filters */}
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
            <h2 className="font-playfair text-xl font-bold text-neutral-900">
              Explore Events
            </h2>
            
            <div className="flex flex-wrap gap-1.5">
              {["All", "CICS", "Engineering", "AMV", "Nursing"].map((tab, i) => (
                <button 
                  key={tab} 
                  className={`px-3 py-1 text-[8px] font-bold uppercase border transition-all ${
                    i === 0 
                    ? "border-[#f6c744] bg-[#fffbeb] text-[#a18117]" 
                    : "border-neutral-200 text-neutral-400 hover:bg-neutral-50"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          {/* Event Cards Grid - Set to 4 columns on desktop */}
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
            {dummyEvents.map((event, index) => (
              <div 
                key={index} 
                className="group flex flex-col bg-white border border-neutral-100 shadow-sm hover:shadow-md transition-all border-t-[3px] border-t-[#f6c744]"
              >
                {/* Compact Aspect Ratio */}
                <div className="relative aspect-video overflow-hidden bg-neutral-200">
                  <img 
                    src={event.image} 
                    className="h-full w-full object-cover grayscale-[10%] group-hover:grayscale-0 group-hover:scale-105 transition-all duration-500" 
                    alt={event.title} 
                  />
                </div>
                
                <div className="p-4 flex-1 flex flex-col">
                  <span className="text-[8px] font-black uppercase tracking-widest text-neutral-400">
                    {event.category}
                  </span>
                  
                  <h3 className="mt-1.5 font-playfair text-[13px] font-bold leading-tight h-8 line-clamp-2 text-neutral-900 group-hover:text-[#c49600] transition-colors">
                    {event.title}
                  </h3>
                  
                  <div className="mt-3 text-[10px] text-neutral-500">
                    <p className="truncate">
                      {new Date(event.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </p>
                  </div>

                  <button className="mt-4 w-full bg-neutral-900 py-2 text-[8px] font-black uppercase tracking-widest text-white hover:bg-[#f6c744] hover:text-black transition-colors">
                    View
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </MainLayout>
    </div>
  );
}