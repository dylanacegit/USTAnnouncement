import { useEffect, useState } from "react";
import Hero from "../components/Hero";
import AnnouncementsSection from "../components/AnnouncementsSection";
import UpcomingEvents from "../components/UpcomingEvents";
import Sidebar from "../components/Sidebar";
import { Link, NavLink } from "react-router-dom";
import { getRecentEventGallery } from "../services/api";

export default function Home() {
  const [recentHighlights, setRecentHighlights] = useState([]);
  const [highlightsLoading, setHighlightsLoading] = useState(true);

  useEffect(() => {
    let ignore = false;

    async function loadRecentHighlights() {
      try {
        const galleryItems = await getRecentEventGallery(6);

        if (!ignore) {
          setRecentHighlights(Array.isArray(galleryItems) ? galleryItems : []);
        }
      } catch (error) {
        console.error("Failed to load recent event highlights:", error);
        if (!ignore) setRecentHighlights([]);
      } finally {
        if (!ignore) setHighlightsLoading(false);
      }
    }

    loadRecentHighlights();

    return () => {
      ignore = true;
    };
  }, []);

  return (
    <div className="min-h-screen w-full bg-white text-black">
      <Hero />

      <main className="w-full px-4 py-7 sm:px-6 sm:py-8 lg:px-10 xl:px-12">
        <div className="grid grid-cols-1 gap-8 xl:grid-cols-[minmax(0,1.35fr)_210px]">
          <div className="min-w-0">
            <AnnouncementsSection />

            <UpcomingEvents />

            <section className="mt-10 sm:mt-12">
              <div className="mb-4 flex items-center justify-between gap-4 sm:mb-5">
                <h2 className="font-serif text-2xl font-bold sm:text-3xl">
                  Recent Event Highlights
                </h2>

                <NavLink
                  to="/events"
                  className="shrink-0 text-[10px] font-black uppercase tracking-widest text-[#c49600] hover:underline"
                >
                  View Events &rarr;
                </NavLink>
              </div>

              {highlightsLoading && (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {Array.from({ length: 3 }).map((_, index) => (
                    <div key={index} className="h-32 animate-pulse bg-neutral-200 sm:h-36" />
                  ))}
                </div>
              )}

              {!highlightsLoading && recentHighlights.length === 0 && (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {Array.from({ length: 3 }).map((_, index) => (
                    <div key={index} className="h-32 bg-neutral-200 sm:h-36" />
                  ))}
                </div>
              )}

              {!highlightsLoading && recentHighlights.length > 0 && (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {recentHighlights.slice(0, 3).map((item) => (
                    <Link
                      key={item._id || `${item.eventId}-${item.title}`}
                      to={`/events/${item.eventId}`}
                      className="group relative block h-44 overflow-hidden bg-neutral-200 shadow-sm sm:h-48"
                    >
                      <img
                        src={item.image}
                        alt={item.title}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent opacity-90 transition-opacity group-hover:opacity-100" />
                      <div className="absolute inset-x-0 bottom-0 p-4 text-white">
                        <p className="text-[8px] font-black uppercase tracking-widest text-[#f6c744]">
                          {item.submittedByName || "UST user"}
                        </p>
                        <h3 className="mt-1 line-clamp-1 text-sm font-bold leading-tight">
                          {item.title}
                        </h3>
                        <p className="mt-2 line-clamp-1 text-[10px] font-semibold text-white/80">
                          From {item.eventTitle || "an event"}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </section>
          </div>

          <div className="w-full xl:max-w-[210px] xl:ml-auto">
            <Sidebar />
          </div>
        </div>
      </main>
    </div>
  );
}
