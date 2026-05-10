import { useRef } from "react";

export default function UpcomingEvents() {
  const scrollRef = useRef(null);

  // Static array of 10 cards for the swipeable row
  const dummyEvents = Array(10).fill({
    title: "Thomasian Welcome Walk 2026",
    category: "CATEGORY",
    location: "Grandstand",
    date: "Aug 1, 2026 | 10:00 AM - 4:00 PM",
    image: "/images/ust-main-building.png"
  });

  // Navigation logic
  const scroll = (direction) => {
    if (scrollRef.current) {
      const { scrollLeft, clientWidth } = scrollRef.current;
      const scrollTo = direction === "left" 
        ? scrollLeft - clientWidth 
        : scrollLeft + clientWidth;
      
      scrollRef.current.scrollTo({ left: scrollTo, behavior: "smooth" });
    }
  };

  return (
    <section className="mt-10 sm:mt-12">
      {/* --- Section Header --- */}
      <div className="mb-6 flex items-center justify-between gap-4">
        <h2 className="font-playfair text-2xl font-bold sm:text-3xl text-neutral-800">
          Upcoming Events
        </h2>

        <div className="flex items-center gap-4">
          {/* Navigation Arrows */}
          <div className="flex gap-2">
            <button 
              onClick={() => scroll("left")}
              className="flex h-8 w-8 items-center justify-center border border-neutral-200 text-neutral-400 hover:border-[#f6c744] hover:text-[#f6c744] transition-all"
            >
              <span className="text-lg">←</span>
            </button>
            <button 
              onClick={() => scroll("right")}
              className="flex h-8 w-8 items-center justify-center border border-neutral-200 text-neutral-400 hover:border-[#f6c744] hover:text-[#f6c744] transition-all"
            >
              <span className="text-lg">→</span>
            </button>
          </div>
          
          <button className="shrink-0 text-[10px] font-black uppercase tracking-widest text-[#c49600] hover:underline">
            View All →
          </button>
        </div>
      </div>

      {/* --- Swipeable Container --- */}
      <div 
        ref={scrollRef}
        className="no-scrollbar flex gap-4 overflow-x-auto scroll-smooth pb-4"
        style={{ 
          scrollSnapType: "x mandatory",
          scrollbarWidth: "none", // Firefox
          msOverflowStyle: "none", // IE
          WebkitOverflowScrolling: "touch" 
        }}
      >
        {/* CSS to hide scrollbar for Chrome/Safari */}
        <style dangerouslySetInnerHTML={{ __html: `
          .no-scrollbar::-webkit-scrollbar { display: none; }
        `}} />

        {dummyEvents.map((_, index) => (
          <div
            key={index}
            className="flex min-w-full flex-col bg-white border border-neutral-100 shadow-sm transition-all border-t-[4px] border-t-[#f6c744] sm:min-w-[calc(50%-8px)] lg:min-w-[calc(25%-12px)]"
            style={{ scrollSnapAlign: "start" }}
          >
            {/* Image Section */}
            <div className="relative aspect-[4/3] overflow-hidden">
              <img
                src="/images/ust-main-building.png" 
                alt="Event"
                className="h-full w-full object-cover"
              />
            </div>

            {/* Content Section */}
            <div className="p-5 flex-1 flex flex-col">
              <span className="text-[9px] font-black uppercase tracking-[0.2em] text-neutral-400">
                CATEGORY
              </span>

              <h3 className="mt-2 font-playfair text-[15px] font-bold leading-tight text-neutral-900">
                Thomasian Welcome Walk 2026
              </h3>

              <p className="mt-1 text-[12px] text-neutral-400">
                Grandstand
              </p>

              <p className="mt-1 text-[12px] text-neutral-400">
                Aug 1, 2026 | 10:00 AM - 4:00 PM
              </p>

              <button className="mt-6 w-full bg-[#f6c744] py-3 text-[9px] font-black uppercase tracking-[0.2em] text-black hover:bg-[#e3b832] transition-colors">
                View
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}