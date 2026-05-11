import { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";

export default function UpcomingEvents() {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    fetch("http://localhost:5000/api/events")
      .then((res) => res.json())
      .then((data) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const upcomingEvents = data
          .filter((event) => event.status === "published")
          .filter((event) => new Date(event.startDate) >= today)
          .sort((a, b) => new Date(a.startDate) - new Date(b.startDate))
          .slice(0, 4);

        setEvents(upcomingEvents);
      })
      .catch((err) => {
        console.error("Failed to fetch upcoming events:", err);
      });
  }, []);

  const formatEventDate = (event) => {
    const start = new Date(event.startDate);
    const end = event.endDate ? new Date(event.endDate) : null;

    const startDate = start.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });

    if (!end || event.startDate === event.endDate) {
      return event.startTime && event.endTime
        ? `${startDate} · ${event.startTime}–${event.endTime}`
        : startDate;
    }

    const endDate = end.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });

    return `${startDate} - ${endDate}`;
  };

  return (
    <section className="mt-10 sm:mt-12">
      <div className="mb-4 flex items-center justify-between gap-4 sm:mb-5">
        <h2 className="font-serif text-2xl font-bold sm:text-3xl">
          Upcoming Events
        </h2>

        <NavLink
          to="/events"
          className="shrink-0 text-xs font-bold text-[#c49600] sm:text-sm"
        >
          View All →
        </NavLink>
      </div>

      <div className="mb-5 flex gap-2 overflow-x-auto pb-2 sm:mb-6 sm:flex-wrap">
        {[
          "All Colleges",
          "Engineering",
          "Nursing",
          "Tourism",
          "Law",
          "Arts & Letters",
          "Commerce",
        ].map((tab, index) => (
          <button
            key={tab}
            className={`shrink-0 border px-3 py-2 text-[11px] font-semibold ${
              index === 0
                ? "border-[#f6c744] bg-[#f6c744]"
                : "border-neutral-300 bg-white"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {events.map((event) => (
          <article
            key={event._id}
            className="border border-neutral-200 border-t-[#f6c744] border-t-4 p-4 transition hover:-translate-y-1 hover:shadow-md sm:p-5"
          >
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-neutral-500">
              {event.category}
            </p>

            <h3 className="mt-3 min-h-[40px] font-serif text-base font-bold sm:min-h-[44px]">
              {event.title}
            </h3>

            <span className="mt-3 block text-xs text-neutral-600">
              {event.location}
            </span>

            <small className="mt-2 block text-xs text-neutral-500">
              {formatEventDate(event)}
            </small>

            <button className="mt-5 h-8 w-20 bg-[#f6c744] text-xs font-black text-black">
              View
            </button>
          </article>
        ))}
      </div>
    </section>
  );
}