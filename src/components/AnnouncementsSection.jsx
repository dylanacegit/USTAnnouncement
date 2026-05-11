import { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";

export default function AnnouncementsSection() {
  const [announcements, setAnnouncements] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);

  const [viewedIds, setViewedIds] = useState(() => {
    return JSON.parse(localStorage.getItem("viewedAnnouncements")) || [];
  });

  useEffect(() => {
    fetch("http://localhost:5000/api/announcements")
      .then((res) => res.json())
      .then((data) => {
        const generalAnnouncements = data
          .filter((item) => item.type === "general")
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
          .slice(0, 5);

        setAnnouncements(generalAnnouncements);

        if (generalAnnouncements.length > 0) {
          setSelected(generalAnnouncements[0]);
        }

        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to fetch announcements:", err);
        setLoading(false);
      });
  }, []);

  const handleSelectAnnouncement = (item) => {
    setSelected(item);

    if (!viewedIds.includes(item._id)) {
      const updatedViewedIds = [...viewedIds, item._id];

      setViewedIds(updatedViewedIds);

      localStorage.setItem(
        "viewedAnnouncements",
        JSON.stringify(updatedViewedIds)
      );
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);

    return {
      day: date.toLocaleDateString("en-US", {
        day: "2-digit",
      }),
      month: date
        .toLocaleDateString("en-US", {
          month: "short",
        })
        .toUpperCase(),
      year: date.getFullYear(),
    };
  };

  const formatFullDate = (dateString) => {
    return new Date(dateString).toLocaleString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  const formatCardDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "2-digit",
      year: "numeric",
    });
  };

  if (loading) {
    return <p>Loading announcements...</p>;
  }

  if (!selected) {
    return <p>No announcements found.</p>;
  }

  const createdDate = formatDate(selected.createdAt);

  return (
    <section>
      <div className="mb-4 flex items-center justify-between gap-4 sm:mb-5">
        <h2 className="font-serif text-2xl font-bold sm:text-3xl">
          Announcements
        </h2>

        <NavLink
          to="/announcements"
          className="shrink-0 text-xs font-bold text-[#c49600] sm:text-sm"
        >
          View All →
        </NavLink>
      </div>

      <div className="grid w-full gap-2 bg-[#f5f4f1] p-2 md:grid-cols-[minmax(0,1fr)_60px] lg:grid-cols-[minmax(0,1.7fr)_58px_minmax(230px,0.68fr)] xl:grid-cols-[minmax(0,1.85fr)_60px_minmax(245px,0.68fr)]">
        <article className="relative min-h-[265px] overflow-hidden sm:min-h-[290px] md:min-h-[245px] lg:min-h-[205px]">
          <img
            src={selected.image}
            alt={selected.title}
            className="absolute inset-0 h-full w-full object-cover"
          />

          <div className="absolute inset-0 bg-black/58" />

          <div className="relative z-10 flex h-full flex-col justify-center p-5 text-white sm:p-6">
            <p className="text-[10px] font-black uppercase tracking-[0.34em] text-[#f6c744] sm:tracking-[0.42em]">
              {selected.category}
            </p>

            <h3 className="mt-4 max-w-2xl font-serif text-2xl font-bold leading-tight sm:text-3xl">
              {selected.title}
            </h3>

            <div className="mt-3 flex flex-wrap gap-3 text-xs font-semibold text-[#f6c744]">
              {selected.createdBy && <span>🏢 {selected.createdBy}</span>}
            </div>

            <p className="mt-3 max-w-2xl text-xs font-medium leading-6 text-white/95">
              {selected.content}
            </p>

            <div className="mt-4 flex flex-wrap items-center gap-3">
              <button className="h-8 w-20 bg-[#f6c744] text-[11px] font-black text-black hover:bg-[#e3b832]">
                View
              </button>

              <small className="text-[9px] leading-4 text-white/85">
                Created at {formatFullDate(selected.createdAt)}
                <br />
                Updated at {formatFullDate(selected.updatedAt)}
              </small>
            </div>
          </div>
        </article>

        <div className="flex min-h-[60px] flex-col items-center justify-center bg-[#f6c744] text-black md:min-h-full">
          <strong className="font-serif text-4xl font-black leading-none">
            {createdDate.day}
          </strong>

          <span className="mt-1 text-[10px] font-black">
            {createdDate.month}
          </span>

          <small className="mt-1 text-[9px]">{createdDate.year}</small>
        </div>

        <div className="grid gap-2 md:col-span-2 lg:col-span-1">
          {announcements.map((item) => (
            <button
              key={item._id}
              onClick={() => handleSelectAnnouncement(item)}
              className={`relative min-h-[72px] bg-white p-4 text-left transition hover:-translate-y-0.5 hover:shadow-md lg:min-h-[62px] ${
                selected._id === item._id
                  ? "border-l-4 border-[#f6c744]"
                  : "border-l-4 border-transparent"
              }`}
            >
              <span className="block text-[9px] font-black uppercase tracking-[0.28em] text-[#c49600] sm:tracking-[0.32em]">
                {item.category}
              </span>

              <strong className="mt-2 block font-serif text-base font-bold leading-tight sm:text-lg">
                {item.title}
              </strong>

              <small className="mt-2 block text-[11px] text-neutral-500">
                {formatCardDate(item.createdAt)}
              </small>

              <span
                className={`absolute right-4 top-4 h-2 w-2 rounded-full border border-[#f6c744] ${
                  viewedIds.includes(item._id)
                    ? "bg-transparent"
                    : "bg-[#f6c744]"
                }`}
              />
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}