import { useState, useRef, useEffect } from "react";
import { useLocation } from "react-router-dom";
import HomeLayout from "../components/MainLayout";

// Use the same data structure as your Section
const ANNOUNCEMENTS_LIST = [
  {
    _id: "1",
    category: "UNIVERSITY",
    title: "Fun Run during April 27 - May 1, 2026",
    published: "April 20, 2026 12:31 PM",
    updated: "April 24, 2026 2:54 PM",
    content:
      "A premier academic gathering uniting researchers, faculty, and students from all colleges in a full-day program of paper presentations and poster exhibits.",
    image: "/images/fun-run.png",
    isAdminFeatured: true,
  },
  {
    _id: "2",
    category: "FACILITIES",
    title: "New Library Operating Hours",
    published: "May 1, 2026 8:00 AM",
    updated: "May 1, 2026 9:00 AM",
    content:
      "The Miguel de Benavides Library will now be open until 10:00 PM on weekdays to accommodate research students.",
    image: "/images/fun-run.png",
    isAdminFeatured: false,
  },
];

export default function Announcements() {
  const location = useLocation();
  const topRef = useRef(null);

  const adminFeatured =
    ANNOUNCEMENTS_LIST.find((a) => a.isAdminFeatured) || ANNOUNCEMENTS_LIST[0];

  const [displayItem, setDisplayItem] = useState(() => {
    return location.state?.featuredAnnouncement || adminFeatured;
  });

  useEffect(() => {
    if (location.state?.featuredAnnouncement) {
      setDisplayItem(location.state.featuredAnnouncement);
      topRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [location.state]);

  const handleView = (announcement) => {
    setDisplayItem(announcement);
    topRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const resetToFeatured = () => {
    setDisplayItem(adminFeatured);
    topRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const isViewingSpecific = displayItem._id !== adminFeatured._id;

  return (
    <div className="min-h-screen w-full bg-white text-black">
      <HomeLayout>
        <div ref={topRef} className="p-8 lg:p-14">
          <article className="max-w-6xl animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="mb-6 flex items-center justify-between">
              <div className="flex-1">
                <span
                  className={`text-[11px] font-bold uppercase tracking-[0.2em] ${isViewingSpecific ? "text-[#c49600]" : "text-neutral-800"}`}
                >
                  {isViewingSpecific
                    ? "Currently Viewing"
                    : "Featured Announcement"}
                </span>
                <div className="mt-2 h-[1px] w-full bg-[#f6c744]" />
              </div>

              {isViewingSpecific && (
                <button
                  onClick={resetToFeatured}
                  className="ml-6 shrink-0 text-[10px] font-black uppercase tracking-widest text-neutral-400 hover:text-black transition-colors"
                >
                  ← Back to Featured
                </button>
              )}
            </div>

            <h1 className="font-playfair text-2xl lg:text-[34px] font-black leading-tight text-neutral-900">
              {displayItem.title}
            </h1>

            <div className="mt-4 flex items-center gap-2 text-[11px] font-medium text-neutral-500">
              <span>Published {displayItem.published}</span>
              <span className="text-neutral-300">|</span>
              <span>Updated {displayItem.updated}</span>
            </div>

            <div className="mt-10 flex flex-col gap-10 lg:flex-row">
              <div className="flex-1 text-[15px] leading-relaxed text-neutral-800 text-justify">
                {displayItem.content}
              </div>
              <div className="w-full lg:w-[420px] shrink-0 border border-neutral-200 p-0.5">
                <img
                  src={displayItem.image}
                  alt="Advisory"
                  className="w-full h-auto"
                />
              </div>
            </div>
          </article>

          {/* Archive Grid */}
          <section className="mt-24 max-w-6xl">
            <h2 className="mb-8 border-b border-[#f6c744] pb-2 text-[10px] font-black uppercase tracking-widest">
              Archive
            </h2>
            <div className="grid gap-6 md:grid-cols-2">
              {ANNOUNCEMENTS_LIST.map((item) => (
                <div
                  key={item._id}
                  className={`border p-5 bg-white transition-all ${displayItem._id === item._id ? "border-[#f6c744] ring-1 ring-[#f6c744]" : "border-neutral-200"}`}
                >
                  <span className="text-[9px] font-black tracking-widest text-neutral-400 uppercase">
                    {item.category}
                  </span>
                  <h3 className="mt-1 font-inter font-bold text-neutral-900">
                    {item.title}
                  </h3>
                  <p className="mt-3 text-sm text-neutral-600 line-clamp-2 h-10">
                    {item.content}
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
        </div>
      </HomeLayout>
    </div>
  );
}
