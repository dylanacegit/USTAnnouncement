import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import HomeLayout from "../components/MainLayout";
import { getAnnouncements } from "../services/api";
import {
  formatDisplayDate,
  getAnnouncementBody,
  getItemImage,
  getPublishedItems,
  matchesSearch,
} from "../utils/contentFormatters";

export default function Announcements() {
  const location = useLocation();
  const topRef = useRef(null);
  const [announcements, setAnnouncements] = useState([]);
  const [displayItem, setDisplayItem] = useState(
    location.state?.featuredAnnouncement || null
  );
  const [loading, setLoading] = useState(true);
  const searchQuery = new URLSearchParams(location.search).get("search") || "";

  useEffect(() => {
    let ignore = false;

    async function loadAnnouncements() {
      try {
        const data = await getAnnouncements();
        const publishedAnnouncements = getPublishedItems(
          Array.isArray(data) ? data : data.announcements || []
        ).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        if (!ignore) {
          setAnnouncements(publishedAnnouncements);
          setDisplayItem((current) => {
            if (current) return current;

            return (
              publishedAnnouncements.find((item) => item.isAdminFeatured) ||
              publishedAnnouncements[0] ||
              null
            );
          });
        }
      } catch (error) {
        console.error("Failed to load announcements:", error);
      } finally {
        if (!ignore) setLoading(false);
      }
    }

    loadAnnouncements();

    return () => {
      ignore = true;
    };
  }, []);

  useEffect(() => {
    const featuredAnnouncement = location.state?.featuredAnnouncement;

    if (featuredAnnouncement) {
      setDisplayItem(featuredAnnouncement);
      window.requestAnimationFrame(() => {
        topRef.current?.scrollIntoView({ behavior: "smooth" });
      });
    }
  }, [location.state]);

  const featuredAnnouncement = useMemo(() => {
    return (
      announcements.find((item) => item.isAdminFeatured) ||
      announcements[0] ||
      null
    );
  }, [announcements]);

  const visibleAnnouncements = useMemo(() => {
    if (!searchQuery.trim()) return announcements;

    return announcements.filter((item) =>
      matchesSearch(item, searchQuery, [
        "title",
        "category",
        "type",
        "eventTitle",
        "content",
        "caption",
        "createdBy",
      ])
    );
  }, [announcements, searchQuery]);

  const handleView = (announcement) => {
    setDisplayItem(announcement);
    topRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const resetToFeatured = () => {
    setDisplayItem(featuredAnnouncement);
    topRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (!searchQuery.trim() || visibleAnnouncements.length === 0) return;

    setDisplayItem((current) => {
      if (
        current &&
        visibleAnnouncements.some((item) => item._id === current._id)
      ) {
        return current;
      }

      return visibleAnnouncements[0];
    });
  }, [searchQuery, visibleAnnouncements]);

  const isViewingSpecific =
    displayItem && featuredAnnouncement
      ? displayItem._id !== featuredAnnouncement._id
      : false;

  return (
    <div className="min-h-screen w-full bg-white text-black">
      <HomeLayout>
        <div ref={topRef} className="p-8 lg:p-14">
          {loading && (
            <div className="max-w-6xl">
              <div className="h-8 w-56 animate-pulse bg-neutral-200" />
              <div className="mt-8 h-64 animate-pulse bg-neutral-100" />
            </div>
          )}

          {!loading && !displayItem && (
            <div className="max-w-6xl border border-dashed border-neutral-200 p-8 text-sm text-neutral-500">
              No published announcements are available yet.
            </div>
          )}

          {!loading && displayItem && (
            <>
              <article className="max-w-6xl animate-in fade-in slide-in-from-bottom-4 duration-700">
                <div className="mb-6 flex items-center justify-between">
                  <div className="flex-1">
                    <span
                      className={`text-[11px] font-bold uppercase tracking-[0.2em] ${
                        isViewingSpecific ? "text-[#c49600]" : "text-neutral-800"
                      }`}
                    >
                      {isViewingSpecific
                        ? "Currently Viewing"
                        : searchQuery
                          ? "Search Result"
                        : "Featured Announcement"}
                    </span>
                    <div className="mt-2 h-[1px] w-full bg-[#f6c744]" />
                  </div>

                  {isViewingSpecific && (
                    <button
                      onClick={resetToFeatured}
                      className="ml-6 shrink-0 text-[10px] font-black uppercase tracking-widest text-neutral-400 transition-colors hover:text-black"
                    >
                      Back to Featured
                    </button>
                  )}
                </div>

                {searchQuery && (
                  <p className="mb-6 text-xs font-semibold text-neutral-500">
                    Showing announcements matching &quot;{searchQuery}&quot;.
                  </p>
                )}

                <h1 className="font-playfair text-2xl lg:text-[34px] font-black leading-tight text-neutral-900">
                  {displayItem.title}
                </h1>

                <div className="mt-4 flex items-center gap-2 text-[11px] font-medium text-neutral-500">
                  <span>Published {formatDisplayDate(displayItem.createdAt)}</span>
                  <span className="text-neutral-300">|</span>
                  <span>Updated {formatDisplayDate(displayItem.updatedAt)}</span>
                </div>

                <div className="mt-10 flex flex-col gap-10 lg:flex-row">
                  <div className="flex-1 text-[15px] leading-relaxed text-neutral-800 text-justify">
                    {getAnnouncementBody(displayItem)}
                  </div>
                  <div className="w-full lg:w-[420px] shrink-0 border border-neutral-200 p-0.5">
                    <img
                      src={getItemImage(displayItem)}
                      alt={displayItem.title}
                      className="w-full h-auto"
                    />
                  </div>
                </div>
              </article>

              <section className="mt-24 max-w-6xl">
                <h2 className="mb-8 border-b border-[#f6c744] pb-2 text-[10px] font-black uppercase tracking-widest">
                  Archive
                </h2>
                <div className="grid gap-6 md:grid-cols-2">
                  {visibleAnnouncements.map((item) => (
                    <div
                      key={item._id}
                      className={`border p-5 bg-white transition-all ${
                        displayItem._id === item._id
                          ? "border-[#f6c744] ring-1 ring-[#f6c744]"
                          : "border-neutral-200"
                      }`}
                    >
                      <span className="text-[9px] font-black tracking-widest text-neutral-400 uppercase">
                        {item.category || item.type || "Announcement"}
                      </span>
                      <h3 className="mt-1 font-inter font-bold text-neutral-900">
                        {item.title}
                      </h3>
                      <p className="mt-3 text-sm text-neutral-600 line-clamp-2 h-10">
                        {getAnnouncementBody(item)}
                      </p>
                      <button
                        onClick={() => handleView(item)}
                        className={`mt-6 w-full py-2.5 text-[10px] font-black uppercase tracking-widest transition-colors ${
                          displayItem._id === item._id
                            ? "bg-neutral-100 text-neutral-400 cursor-default"
                            : "bg-[#f6c744] text-black hover:bg-[#e3b832]"
                        }`}
                      >
                        {displayItem._id === item._id ? "Viewing" : "View"}
                      </button>
                    </div>
                  ))}
                </div>
              </section>
            </>
          )}
        </div>
      </HomeLayout>
    </div>
  );
}
