import { useState } from "react";
import { NavLink } from "react-router-dom";

const DUMMY_DATA = [
  {
    _id: "1",
    title: "Fun Run during April 27 - May 1, 2026",
    category: "CATEGORY",
    content: "A premier academic gathering uniting researchers, faculty, and students from all colleges in a full-day program of paper presentations and poster exhibits.",
    image: "/images/fun-run.png", 
    location: "Main Building Auditorium",
    time: "8:00 AM - 6:00 PM",
    createdBy: "CICS",
    createdAt: "2026-04-12T12:10:00Z",
    updatedAt: "2026-04-14T15:45:00Z",
  },
  {
    _id: "2",
    title: "New Library Operating Hours",
    category: "FACILITIES",
    content: "The Miguel de Benavides Library will now be open until 10:00 PM on weekdays to accommodate research students.",
    image: "/images/fun-run.png", 
    location: "Central Library",
    time: "8:00 AM - 10:00 PM",
    createdBy: "UST Library",
    createdAt: "2026-04-07T08:00:00Z",
    updatedAt: "2026-04-07T08:00:00Z",
  },
  {
    _id: "3",
    title: "Thomasian Welcome Mass 2026",
    category: "RELIGIOUS",
    content: "Join the entire community as we start the academic year with a Eucharistic celebration.",
    image: "/images/fun-run.png", 
    location: "QPav",
    time: "9:00 AM - 11:30 AM",
    createdBy: "Campus Ministry",
    createdAt: "2026-04-07T09:00:00Z",
    updatedAt: "2026-04-07T09:00:00Z",
  },
  {
    _id: "4",
    title: "Thomasian Welcome Mass 2026",
    category: "RELIGIOUS",
    content: "Join the entire community as we start the academic year with a Eucharistic celebration.",
    image: "/images/fun-run.png", 
    location: "QPav",
    time: "9:00 AM - 11:30 AM",
    createdBy: "Campus Ministry",
    createdAt: "2026-04-07T09:00:00Z",
    updatedAt: "2026-04-07T09:00:00Z",
  }
];

export default function AnnouncementsSection() {
  const [announcements] = useState(DUMMY_DATA);
  const [selected, setSelected] = useState(DUMMY_DATA[0]);
  const [viewedIds, setViewedIds] = useState(() => {
    return JSON.parse(localStorage.getItem("viewedAnnouncements")) || [];
  });

  const handleSelectAnnouncement = (item) => {
    setSelected(item);
    if (!viewedIds.includes(item._id)) {
      const updatedViewedIds = [...viewedIds, item._id];
      setViewedIds(updatedViewedIds);
      localStorage.setItem("viewedAnnouncements", JSON.stringify(updatedViewedIds));
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return {
      day: date.toLocaleDateString("en-US", { day: "2-digit" }),
      month: date.toLocaleDateString("en-US", { month: "short" }).toUpperCase(),
      year: date.getFullYear(),
    };
  };

  if (!selected) return null;
  const createdDate = formatDate(selected.createdAt);

  return (
    /* Outer section: flex-1 to fill the column, but we control the inner content height */
    <section className="flex flex-1 flex-col p-6 sm:p-10 lg:p-12 text-black bg-white">
      
      {/* Header */}
      <div className="mb-4 flex flex-none items-center justify-between">
        <h2 className="font-playfair text-2xl font-bold tracking-tight text-neutral-800">Announcements</h2>
        <NavLink to="/announcements" className="text-[10px] font-black uppercase tracking-widest text-[#c49600] hover:underline">
          View All →
        </NavLink>
      </div>

      {/* 
         THE MAIN BOX: 
         - Reverted height to h-[420px] to match your previous look.
         - Background set to #F8F7F4.
      */}
      <div className="grid w-full h-[320px] gap-3 bg-[#F8F7F4] p-3 shadow-sm lg:grid-cols-[1fr_60px_280px] overflow-hidden border border-neutral-100">
        
        {/* HERO CARD */}
        <article className="relative h-full overflow-hidden group bg-neutral-900">
          <img
            src={selected.image}
            alt={selected.title}
            className="absolute inset-0 h-full w-full object-cover opacity-60 transition-transform duration-700 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

          <div className="relative z-10 flex h-full flex-col p-6 text-white md:p-8">
            <span className="text-[9px] font-black uppercase tracking-[0.3em] text-[#f6c744]">
              {selected.category}
            </span>

            <h3 className="mt-2 max-w-xl font-playfair text-xl font-bold leading-tight md:text-2xl">
              {selected.title}
            </h3>

            <div className="mt-2.5 flex flex-wrap gap-x-4 gap-y-1 text-[8px] font-black uppercase tracking-wider text-white/90">
              <span className="flex items-center gap-1.5">
                <div className="h-2.5 w-2.5 bg-[#f6c744]" /> {selected.location}
              </span>
              <span className="flex items-center gap-1.5">
                <div className="h-2.5 w-2.5 bg-[#f6c744]" /> {selected.time}
              </span>
            </div>

            <p className="mt-3 max-w-lg text-[11px] leading-relaxed text-white/70 italic line-clamp-3">
              {selected.content}
            </p>

            <button className="mt-4 w-fit bg-[#f6c744] px-6 py-2 text-[9px] font-black uppercase tracking-widest text-black transition-colors hover:bg-[#e3b832]">
              View
            </button>

            <div className="mt-auto pt-6 flex gap-4 text-[8px] font-bold uppercase tracking-tighter text-white/40">
              <span>Created at: {selected.createdAt}</span>
              <span>Last Updated at: {selected.updatedAt}</span>
            </div>
          </div>
        </article>

        {/* DATE PILLAR */}
        <div className="hidden h-full flex-col items-center justify-center bg-[#f6c744] text-black lg:flex">
          <span className="font-inter text-3xl font-black leading-none">{createdDate.day}</span>
          <span className="mt-1 text-[9px] font-black tracking-tighter">{createdDate.month}</span>
          <span className="mt-0.5 text-[8px] opacity-40 font-bold">{createdDate.year}</span>
        </div>

        {/* SIDEBAR QUEUE */}
        <div className="flex h-full flex-col gap-2 overflow-y-auto pr-1 custom-scrollbar">
          {announcements
            .filter((item) => item._id !== selected._id)
            .map((item) => (
              <button
                key={item._id}
                onClick={() => handleSelectAnnouncement(item)}
                className="group relative flex flex-none flex-col justify-center bg-white border border-neutral-200/60 p-4 text-left transition-all hover:bg-white/50"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[8px] font-black uppercase tracking-widest text-[#c49600]">
                    {item.category}
                  </span>
                  <div className={`h-2 w-2 rounded-full border border-[#f6c744] ${viewedIds.includes(item._id) ? "bg-transparent" : "bg-[#f6c744]"}`} />
                </div>
                <strong className="mt-1 block font-inter text-sm font-bold leading-tight text-neutral-900 group-hover:text-[#c49600]">
                  {item.title}
                </strong>
                <span className="mt-1 text-[9px] text-neutral-400 font-bold uppercase tracking-tighter">
                   {item.location.split(' ')[0]} | {formatDate(item.createdAt).month} {formatDate(item.createdAt).day}
                </span>
              </button>
            ))}
        </div>
      </div>
    </section>
  );
}