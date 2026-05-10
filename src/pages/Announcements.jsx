import { useState, useRef, useEffect } from "react";
import { useLocation } from "react-router-dom";
import HomeLayout from "../components/MainLayout";

const ANNOUNCEMENTS_LIST = [
  {
    _id: "1",
    category: "UNIVERSITY",
    title: "UST declares no classes during the first week of May due to Jeepney Transport Strike.",
    published: "April 20, 2026 12:31 PM",
    updated: "April 24, 2026 2:54 PM",
    content: "The Department of the Interior and Local Government (DILG) has officially announced the suspension of classes across all levels—both public and private—on August 26, 2025...",
    image: "/path-to-your-advisory-image.png"
  },
  {
    _id: "2",
    category: "UNIVERSITY",
    title: "University-wide Class Suspension",
    published: "May 1, 2026 8:00 AM",
    updated: "May 1, 2026 9:00 AM",
    content: "All classes are suspended tomorrow due to weather conditions. Please stay tuned for further updates regarding the resumption of office work and classes.",
    image: "/path-to-weather-advisory.png"
  }
];

export default function Announcements() {
  const location = useLocation();
  const topRef = useRef(null);

  // Initialize state: Check if user navigated here with a specific announcement in state
  const [featured, setFeatured] = useState(() => {
    return location.state?.featuredAnnouncement || ANNOUNCEMENTS_LIST[0];
  });

  // If the user is already on this page and clicks a "View" button from elsewhere
  useEffect(() => {
    if (location.state?.featuredAnnouncement) {
      setFeatured(location.state.featuredAnnouncement);
      topRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [location.state]);

  const handleView = (announcement) => {
    setFeatured(announcement);
    topRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen w-full bg-white text-black">
      <HomeLayout>
        <div ref={topRef} className="p-8 lg:p-14">
          
          {/* --- FEATURED ANNOUNCEMENT SECTION --- */}
          <article className="max-w-6xl animate-in fade-in duration-700">
            <div className="mb-6">
              <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-neutral-800">
                Featured Announcement
              </span>
              <div className="mt-2 h-[1px] w-full bg-[#f6c744]" />
            </div>

            <h1 className="font-playfair text-2xl lg:text-[34px] font-black leading-tight text-neutral-900 lg:pr-20">
              {featured.title}
            </h1>

            <div className="mt-4 flex items-center gap-2 text-[11px] font-medium text-neutral-500">
              <span>Published {featured.published || "N/A"}</span>
              <span className="text-neutral-300">|</span>
              <span>Updated {featured.updated || "N/A"}</span>
            </div>

            <div className="mt-10 flex flex-col gap-10 lg:flex-row">
              <div className="flex-1 space-y-6 text-[15px] leading-relaxed text-neutral-800 text-justify">
                {featured.content.split('\n').map((paragraph, i) => (
                  <p key={i}>{paragraph}</p>
                ))}
              </div>

              <div className="w-full lg:w-[420px] shrink-0">
                <div className="relative border border-neutral-200 p-0.5">
                  <img src={featured.image} alt="Advisory" className="w-full h-auto" />
                </div>
              </div>
            </div>
          </article>

          {/* --- ARCHIVE SECTION --- */}
          <section className="mt-24 max-w-6xl">
            <div className="mb-8 border-b border-[#f6c744] pb-2">
              <h2 className="text-[10px] font-black uppercase tracking-widest">Announcements</h2>
            </div>

            <div className="mb-10 flex flex-wrap items-center justify-between gap-4">
              <div className="border-b border-neutral-400 pb-1">
                <input 
                  type="text" 
                  placeholder="Search" 
                  className="bg-transparent text-sm focus:outline-none italic w-48"
                />
              </div>
              <div className="flex flex-wrap gap-2">
                {["All Colleges", "Engineering", "Nursing", "Tourism", "Law", "Arts & Letters", "Commerce"].map((tab) => (
                  <button 
                    key={tab} 
                    className={`border px-4 py-1.5 text-[10px] font-bold uppercase transition-colors ${tab === "All Colleges" ? "border-[#f6c744] text-[#c49600]" : "border-neutral-200 text-neutral-400 hover:bg-neutral-50"}`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              {ANNOUNCEMENTS_LIST.map((item) => (
                <div key={item._id} className="border border-neutral-200 bg-white">
                  <div className="p-5 border-b border-neutral-100">
                    <span className="text-[9px] font-black tracking-widest text-neutral-400 uppercase">{item.category}</span>
                    <h3 className="mt-1 font-inter font-bold text-neutral-900">{item.title}</h3>
                  </div>
                  <div className="p-5">
                    <p className="text-sm text-neutral-600 line-clamp-2 leading-relaxed h-10 mb-6">
                      {item.content}
                    </p>
                    <button 
                      onClick={() => handleView(item)}
                      className="w-full bg-[#f6c744] py-2.5 text-[10px] font-black uppercase tracking-widest hover:bg-[#e3b832] transition-colors"
                    >
                      View
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-12 flex justify-center gap-2">
              {[1, 2, 3, 4, 5].map((num) => (
                <button 
                  key={num} 
                  className={`border w-8 h-8 flex items-center justify-center text-[11px] font-bold ${num === 1 ? "border-[#f6c744] text-[#c49600]" : "border-neutral-200 text-neutral-400 hover:bg-neutral-50"}`}
                >
                  {num}
                </button>
              ))}
            </div>
          </section>

        </div>
      </HomeLayout>
    </div>
  );
}