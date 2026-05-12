import { useEffect, useRef, useState } from "react";
import { NavLink } from "react-router-dom";
import { getEvents } from "../services/api";
import {
  formatDateRange,
  getItemImage,
  getPublishedItems,
  isUpcomingItem,
} from "../utils/contentFormatters";

export default function UpcomingEvents() {
  const scrollRef = useRef(null);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let ignore = false;

    async function loadEvents() {
      try {
        const data = await getEvents();
        const upcomingPublishedEvents = getPublishedItems(
          Array.isArray(data) ? data : data.events || []
        )
          .filter(isUpcomingItem)
          .sort(
            (a, b) =>
              new Date(a.startDate || a.date || a.createdAt) -
              new Date(b.startDate || b.date || b.createdAt)
          )
          .slice(0, 12);

        if (!ignore) setEvents(upcomingPublishedEvents);
      } catch (error) {
        console.error("Failed to load upcoming events:", error);
      } finally {
        if (!ignore) setLoading(false);
      }
    }

    loadEvents();

    return () => {
      ignore = true;
    };
  }, []);

  const scroll = (direction) => {
    if (scrollRef.current) {
      const { scrollLeft, clientWidth } = scrollRef.current;
      const scrollTo =
        direction === "left"
          ? scrollLeft - clientWidth
          : scrollLeft + clientWidth;
      scrollRef.current.scrollTo({ left: scrollTo, behavior: "smooth" });
    }
  };

  return (
    <section className="mt-10 sm:mt-12">
      <div className="mb-6 flex items-center justify-between gap-4">
        <h2 className="font-playfair text-2xl font-bold sm:text-3xl text-neutral-800">
          Upcoming Events
        </h2>
        <div className="flex items-center gap-4">
          <div className="flex gap-2">
            <button
              onClick={() => scroll("left")}
              className="flex h-8 w-8 items-center justify-center border border-neutral-200 text-neutral-400 hover:border-[#f6c744] hover:text-[#f6c744] transition-all"
            >
              ←
            </button>
            <button
              onClick={() => scroll("right")}
              className="flex h-8 w-8 items-center justify-center border border-neutral-200 text-neutral-400 hover:border-[#f6c744] hover:text-[#f6c744] transition-all"
            >
              →
            </button>
          </div>
          <NavLink
            to="/events"
            className="shrink-0 text-[10px] font-black uppercase tracking-widest text-[#c49600] hover:underline"
          >
            View All →
          </NavLink>
        </div>
      </div>

      <div
        ref={scrollRef}
        className="no-scrollbar flex gap-4 overflow-x-auto scroll-smooth pb-4"
        style={{ scrollSnapType: "x mandatory", scrollbarWidth: "none" }}
      >
        <style
          dangerouslySetInnerHTML={{
            __html: `.no-scrollbar::-webkit-scrollbar { display: none; }`,
          }}
        />
        {loading &&
          Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="min-w-full border border-neutral-100 bg-white p-4 shadow-sm sm:min-w-[calc(50%-8px)] lg:min-w-[calc(25%-12px)]"
            >
              <div className="aspect-video animate-pulse bg-neutral-200" />
              <div className="mt-4 h-3 w-20 animate-pulse bg-neutral-200" />
              <div className="mt-3 h-8 animate-pulse bg-neutral-200" />
              <div className="mt-4 h-8 animate-pulse bg-neutral-200" />
            </div>
          ))}

        {!loading && events.length === 0 && (
          <div className="w-full border border-dashed border-neutral-200 bg-white p-6 text-sm text-neutral-500">
            No upcoming published events are available yet.
          </div>
        )}

        {!loading && events.map((event) => (
          <div
            key={event._id || event.title}
            className="group flex min-w-full flex-col bg-white border border-neutral-100 shadow-sm transition-all border-t-[3px] border-t-[#f6c744] sm:min-w-[calc(50%-8px)] lg:min-w-[calc(25%-12px)]"
            style={{ scrollSnapAlign: "start" }}
          >
            {/* Image: Video aspect ratio + Hover effects */}
            <div className="relative aspect-video overflow-hidden bg-neutral-200">
              <img
                src={getItemImage(event)}
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
                <p className="truncate italic">
                  {event.location || event.venue || "Venue TBA"}
                </p>
                <p className="truncate mt-0.5">
                  {formatDateRange(event)}
                </p>
              </div>
              <button className="mt-4 w-full bg-[#f6c744] py-2 text-[8px] font-black uppercase tracking-widest text-black hover:bg-[#e3b832] transition-colors">
                View
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
