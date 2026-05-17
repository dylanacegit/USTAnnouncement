import { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { getAnnouncements } from "../services/api";
import {
  formatDisplayDate,
  getAnnouncementBody,
  getItemImage,
  getPublishedItems,
} from "../utils/contentFormatters";

export default function AnnouncementsSection() {
  const [announcements, setAnnouncements] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const [viewedIds, setViewedIds] = useState(() => {
    return JSON.parse(localStorage.getItem("viewedAnnouncements")) || [];
  });

  useEffect(() => {
    let ignore = false;

    async function loadAnnouncements() {
      try {
        const data = await getAnnouncements();
        const publishedAnnouncements = getPublishedItems(
          Array.isArray(data) ? data : data.announcements || []
        )
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
          .slice(0, 6);

        if (!ignore) {
          setAnnouncements(publishedAnnouncements);
          setSelected(
            publishedAnnouncements.find((item) => item.isAdminFeatured) ||
              publishedAnnouncements[0] ||
              null
          );
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

  const handleSelectAnnouncement = (item) => {
    setSelected(item);
    if (!viewedIds.includes(item._id)) {
      const updatedViewedIds = [...viewedIds, item._id];
      setViewedIds(updatedViewedIds);
      localStorage.setItem(
        "viewedAnnouncements",
        JSON.stringify(updatedViewedIds),
      );
    }
  };

  const handleViewRedirect = () => {
    navigate("/announcements", { state: { selectedAnnouncement: selected } });
  };

  const formatDateParts = (dateString) => {
    const date = dateString ? new Date(dateString) : new Date();
    return {
      day: date.toLocaleDateString("en-US", { day: "2-digit" }),
      month: date.toLocaleDateString("en-US", { month: "short" }).toUpperCase(),
      year: date.getFullYear(),
    };
  };

  if (loading) {
    return (
      <section className="flex flex-1 flex-col text-black bg-white">
        <div className="mb-4 h-8 w-56 animate-pulse bg-neutral-200" />
        <div className="h-[320px] animate-pulse border border-neutral-100 bg-neutral-100" />
      </section>
    );
  }

  if (!selected) {
    return (
      <section className="flex flex-1 flex-col text-black bg-white">
        <div className="mb-4 flex flex-none items-center justify-between">
          <h2 className="font-playfair text-3xl font-bold tracking-tight text-neutral-800">
            Announcements
          </h2>
        </div>
        <div className="border border-dashed border-neutral-200 bg-white p-6 text-sm text-neutral-500">
          No published announcements are available yet.
        </div>
      </section>
    );
  }

  const selectedBody = getAnnouncementBody(selected);
  const createdDate = formatDateParts(selected.createdAt);

  return (
    <section className="flex flex-1 flex-col text-black bg-white">
      <div className="mb-4 flex flex-none items-center justify-between">
        <h2 className="font-playfair text-3xl font-bold tracking-tight text-neutral-800">
          Announcements
        </h2>
        <NavLink
          to="/announcements"
          className="text-[10px] font-black uppercase tracking-widest text-[#c49600] hover:underline"
        >
          View All
        </NavLink>
      </div>

      <div className="grid w-full gap-3 overflow-hidden border border-neutral-100 bg-[#F8F7F4] p-3 shadow-sm lg:h-[320px] lg:grid-cols-[1fr_60px_280px]">
        {/* HERO CARD */}
        <article className="group relative min-h-[230px] overflow-hidden bg-neutral-900 sm:min-h-[280px] lg:h-full lg:min-h-0">
          <img
            src={getItemImage(selected)}
            alt={selected.title}
            className="absolute inset-0 h-full w-full object-cover opacity-60 transition-transform duration-700 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

          <div className="relative z-10 flex h-full flex-col p-5 text-white sm:p-6 md:p-8">
            <span className="text-[9px] font-black uppercase tracking-[0.3em] text-[#f6c744]">
              {selected.category}
            </span>

            <h3 className="mt-2 max-w-xl font-playfair text-lg font-bold leading-tight sm:text-xl md:text-2xl">
              {selected.title}
            </h3>

            <div className="mt-2.5 flex flex-wrap gap-x-4 gap-y-1 text-[8px] font-black uppercase tracking-wider text-white/90">
              <span className="flex items-center gap-1.5">
                <div className="h-2.5 w-2.5 bg-[#f6c744]" />{" "}
                {selected.location || selected.eventTitle || "General"}
              </span>
              <span className="flex items-center gap-1.5">
                <div className="h-2.5 w-2.5 bg-[#f6c744]" />{" "}
                {formatDisplayDate(selected.createdAt)}
              </span>
            </div>

            <p className="mt-3 max-w-lg text-[11px] leading-relaxed text-white/70 italic line-clamp-2 sm:line-clamp-3">
              {selectedBody}
            </p>

            <button
              onClick={handleViewRedirect}
              className="mt-4 w-fit bg-[#f6c744] px-6 py-2 text-[9px] font-black uppercase tracking-widest text-black transition-colors hover:bg-[#e3b832]"
            >
              View
            </button>

            <div className="mt-auto hidden gap-4 pt-6 text-[8px] font-bold uppercase tracking-tighter text-white/40 sm:flex">
              <span>Created at: {formatDisplayDate(selected.createdAt)}</span>
              <span>Updated: {formatDisplayDate(selected.updatedAt)}</span>
            </div>
          </div>
        </article>

        {/* DATE PILLAR */}
        <div className="hidden h-full flex-col items-center justify-center bg-[#f6c744] text-black lg:flex">
          <span className="font-inter text-3xl font-black leading-none">
            {createdDate.day}
          </span>
          <span className="mt-1 text-[9px] font-black tracking-tighter">
            {createdDate.month}
          </span>
          <span className="mt-0.5 text-[8px] opacity-40 font-bold">
            {createdDate.year}
          </span>
        </div>

        {/* SIDEBAR QUEUE */}
        <div className="flex max-h-[190px] flex-col gap-2 overflow-y-auto pr-1 custom-scrollbar sm:max-h-[220px] lg:h-full lg:max-h-none">
          {announcements
            .filter((item) => item._id !== selected._id)
            .map((item) => (
              <button
                key={item._id}
                onClick={() => handleSelectAnnouncement(item)}
                className="group relative flex flex-none flex-col justify-center bg-white border border-neutral-200/60 p-3 text-left transition-all hover:bg-white/50 sm:p-4"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[8px] font-black uppercase tracking-widest text-[#c49600]">
                    {item.category}
                  </span>
                  <div
                    className={`h-2 w-2 rounded-full border border-[#f6c744] ${viewedIds.includes(item._id) ? "bg-transparent" : "bg-[#f6c744]"}`}
                  />
                </div>
                <strong className="mt-1 block font-inter text-sm font-bold leading-tight text-neutral-900 group-hover:text-[#c49600]">
                  {item.title}
                </strong>
                <span className="mt-1 text-[9px] text-neutral-400 font-bold uppercase tracking-tighter">
                  {(item.location || item.eventTitle || "General").split(" ")[0]} |{" "}
                  {formatDateParts(item.createdAt).month}{" "}
                  {formatDateParts(item.createdAt).day}
                </span>
              </button>
            ))}
        </div>
      </div>
    </section>
  );
}
