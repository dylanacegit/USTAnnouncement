import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { getAnnouncements, getEvents } from "../services/api";
import { useAuth } from "../context/AuthContext";
import {
  formatDisplayDate,
  formatDateRange,
  getPublishedItems,
} from "../utils/contentFormatters";

const emptyTimeLeft = { days: "00", hrs: "00", min: "00", sec: "00" };

function getEventStartDateTime(event) {
  const date = event.startDate || event.date || event.createdAt;
  const time = event.startTime || "00:00";
  return new Date(`${date}T${time}`);
}

export default function Sidebar() {
  const { bookmarkIds, isAuthenticated } = useAuth();
  const [events, setEvents] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState(emptyTimeLeft);

  useEffect(() => {
    let ignore = false;

    async function loadSidebarData() {
      try {
        const [eventData, announcementData] = await Promise.all([
          getEvents(),
          getAnnouncements(),
        ]);

        if (ignore) return;

        setEvents(getPublishedItems(Array.isArray(eventData) ? eventData : eventData.events || []));
        setAnnouncements(
          getPublishedItems(
            Array.isArray(announcementData)
              ? announcementData
              : announcementData.announcements || []
          )
        );
      } catch (error) {
        console.error("Failed to load sidebar data:", error);
      } finally {
        if (!ignore) setLoading(false);
      }
    }

    loadSidebarData();

    return () => {
      ignore = true;
    };
  }, []);

  const nextEvent = useMemo(() => {
    const now = new Date();

    return events
      .filter((event) => {
        const eventStart = getEventStartDateTime(event);
        return !Number.isNaN(eventStart.valueOf()) && eventStart > now;
      })
      .sort((a, b) => getEventStartDateTime(a) - getEventStartDateTime(b))[0];
  }, [events]);

  const latestAnnouncements = useMemo(() => {
    return [...announcements]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 3);
  }, [announcements]);

  const bookmarkedEvents = useMemo(() => {
    return events
      .filter((event) => bookmarkIds.includes(event._id))
      .sort((a, b) => getEventStartDateTime(a) - getEventStartDateTime(b))
      .slice(0, 5);
  }, [bookmarkIds, events]);

  useEffect(() => {
    if (!nextEvent) {
      setTimeLeft(emptyTimeLeft);
      return undefined;
    }

    const eventDate = getEventStartDateTime(nextEvent);

    const updateCountdown = () => {
      const difference = eventDate.getTime() - Date.now();

      if (difference <= 0 || Number.isNaN(difference)) {
        setTimeLeft(emptyTimeLeft);
        return;
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hrs = Math.floor(
        (difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
      );
      const min = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const sec = Math.floor((difference % (1000 * 60)) / 1000);

      setTimeLeft({
        days: String(days).padStart(2, "0"),
        hrs: String(hrs).padStart(2, "0"),
        min: String(min).padStart(2, "0"),
        sec: String(sec).padStart(2, "0"),
      });
    };

    updateCountdown();
    const timer = setInterval(updateCountdown, 1000);

    return () => clearInterval(timer);
  }, [nextEvent]);

  const countdownData = [
    { label: "Days", value: timeLeft.days },
    { label: "Hrs", value: timeLeft.hrs },
    { label: "Min", value: timeLeft.min },
    { label: "Sec", value: timeLeft.sec },
  ];

  return (
    <aside className="space-y-8 sm:space-y-10 xl:space-y-12">
      <section className="bg-[#080808] px-5 py-6 text-left text-white sm:px-6 sm:py-8">
        <p className="font-inter text-[10px] font-black uppercase tracking-[0.38em] text-[#f6c744]">
          Next Event In
        </p>
        <h3 className="mt-4 max-w-md font-serif text-lg font-bold leading-tight sm:text-xl xl:max-w-none">
          {loading
            ? "Loading next event..."
            : nextEvent?.title || "No upcoming events"}
        </h3>
        {nextEvent && (
          <p className="mt-3 text-[10px] font-bold uppercase tracking-wider text-white/45">
            {formatDisplayDate(nextEvent.startDate || nextEvent.date)}
          </p>
        )}
        <div className="mt-5 grid grid-cols-4 gap-2 font-playfair sm:flex sm:justify-start">
          {countdownData.map((item) => (
            <div
              key={item.label}
              className="grid h-12 min-w-0 place-items-center border border-[#2E2E2E] bg-[#171717] sm:h-14 sm:w-14"
            >
              <strong className="text-lg font-black text-[#f6c744] sm:text-xl">
                {item.value}
              </strong>
              <span className="text-[7px] uppercase text-white/70 sm:text-[8px]">
                {item.label}
              </span>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h3 className="mb-4 border-b-2 border-[#f6c744] pb-3 text-left font-serif text-xl font-bold sm:mb-6">
          Announcements
        </h3>
        <div className="grid gap-2 divide-y-0 sm:divide-y sm:divide-black/10 xl:block">
          {loading ? (
            <p className="py-4 text-sm text-black/50">Loading announcements...</p>
          ) : latestAnnouncements.length === 0 ? (
            <p className="py-4 text-sm text-black/50">No announcements yet.</p>
          ) : (
            latestAnnouncements.map((item) => (
              <Link
                key={item._id || item.title}
                to="/announcements"
                state={{ selectedAnnouncement: item }}
                className="group block border border-neutral-100 bg-white p-3 text-left transition-all hover:bg-black/5 sm:border-0 sm:bg-transparent sm:py-4 sm:first:pt-0"
              >
                <span className="text-[10px] font-black uppercase tracking-[0.32em] text-[#f6c744]">
                  {item.category || item.type || "Update"}
                </span>
                <p className="mt-1 line-clamp-2 text-sm font-semibold leading-relaxed text-black/80 group-hover:text-black sm:font-normal">
                  {item.title}
                </p>
                <small className="mt-2 block text-xs text-black/40">
                  {formatDisplayDate(item.createdAt)}
                </small>
              </Link>
            ))
          )}
        </div>
      </section>

      <section>
        <div className="mb-4 flex items-end justify-between gap-3 border-b-2 border-[#f6c744] pb-3">
          <h3 className="text-left font-serif text-xl font-bold">
            Bookmarks
          </h3>
          {isAuthenticated && bookmarkedEvents.length > 0 && (
            <Link
              to="/events?bookmarks=bookmarked"
              className="text-[9px] font-black uppercase tracking-widest text-[#c49600] hover:underline"
            >
              View All
            </Link>
          )}
        </div>

        {!isAuthenticated ? (
          <p className="py-2 text-sm text-black/50">
            Sign in to save and view bookmarked events.
          </p>
        ) : loading ? (
          <p className="py-2 text-sm text-black/50">Loading bookmarks...</p>
        ) : bookmarkedEvents.length === 0 ? (
          <p className="py-2 text-sm text-black/50">No bookmarked events yet.</p>
        ) : (
          <div className="grid gap-2">
            {bookmarkedEvents.map((event) => (
              <Link
                key={event._id || event.title}
                to={`/events/${event._id}`}
                state={{ selectedEvent: event, primeEventsBack: true }}
                className="group block border-b border-neutral-200 py-3 transition-colors hover:border-[#f6c744]"
              >
                <p className="line-clamp-2 text-sm font-semibold leading-relaxed text-black/80 group-hover:text-black">
                  {event.title}
                </p>
                <small className="mt-2 block text-xs text-black/40">
                  {formatDateRange(event)}
                </small>
              </Link>
            ))}
          </div>
        )}
      </section>

      <section>
        <h3 className="mb-4 border-b-2 border-[#f6c744] pb-3 text-left font-serif text-xl font-bold">
          Quick Access
        </h3>
        <div className="flex flex-col">
          <QuickAccessLink label="Events" to="/events" />
          <QuickAccessLink label="Bookmarked Events" to="/events?bookmarks=bookmarked" />
          <QuickAccessLink label="Latest Announcements" to="/announcements" />
          <a
            href="https://myusteportal.ust.edu.ph/"
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center justify-between border-b border-neutral-200 py-3 text-sm font-medium text-neutral-700 hover:text-[#c49600]"
          >
            MyUSTe Portal
            <span className="transition-transform group-hover:translate-x-1">-&gt;</span>
          </a>
          <QuickAccessLink label="Ask Tiggy" to="/?ask=tiggy" />
        </div>
      </section>
    </aside>
  );
}

function QuickAccessLink({ label, to }) {
  return (
    <Link
      to={to}
      className="group flex items-center justify-between border-b border-neutral-200 py-3 text-sm font-medium text-neutral-700 hover:text-[#c49600]"
    >
      {label}
      <span className="transition-transform group-hover:translate-x-1">-&gt;</span>
    </Link>
  );
}
