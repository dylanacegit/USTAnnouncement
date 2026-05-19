import { useEffect, useMemo, useState } from "react";
import {
  IoArrowForwardOutline,
  IoCalendarOutline,
  IoImagesOutline,
  IoLocationOutline,
  IoMegaphoneOutline,
  IoTimeOutline,
} from "react-icons/io5";
import { FaPlus } from "react-icons/fa6";
import { LuText } from "react-icons/lu";
import { Link } from "react-router-dom";
import QuickActions from "../../components/adminComponents/QuickActions";
import {
  getAnnouncements,
  getEvents,
  getGalleryReviewItems,
} from "../../services/api";

export default function Dashboard() {
  const [events, setEvents] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [photosToAudit, setPhotosToAudit] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const [eventsData, announcementsData, reviewData] = await Promise.all([
          getEvents(),
          getAnnouncements(),
          getGalleryReviewItems(),
        ]);

        setEvents(Array.isArray(eventsData) ? eventsData : eventsData.events || []);
        setAnnouncements(
          Array.isArray(announcementsData)
            ? announcementsData
            : announcementsData.announcements || []
        );
        setPhotosToAudit(Array.isArray(reviewData) ? reviewData.length : 0);
      } catch (error) {
        console.error("Failed to load dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  const publishedEvents = useMemo(
    () => events.filter((event) => event.status?.toLowerCase() !== "archived"),
    [events]
  );

  const publishedAnnouncements = useMemo(
    () =>
      announcements.filter(
        (announcement) => announcement.status?.toLowerCase() !== "archived"
      ),
    [announcements]
  );

  const upcomingEvents = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return publishedEvents
      .filter((event) => {
        const start = new Date(event.startDate || event.date);
        return !Number.isNaN(start.valueOf()) && start >= today;
      })
      .sort(
        (a, b) =>
          new Date(a.startDate || a.date) - new Date(b.startDate || b.date)
      );
  }, [publishedEvents]);

  const upcomingPreview = useMemo(() => upcomingEvents.slice(0, 5), [upcomingEvents]);

  const stats = [
    {
      title: "Total Published Events",
      value: loading ? "..." : publishedEvents.length,
      subtext: "Live event records",
      icon: IoCalendarOutline,
    },
    {
      title: "Total Published Announcements",
      value: loading ? "..." : publishedAnnouncements.length,
      subtext: "Visible announcement posts",
      icon: IoMegaphoneOutline,
    },
    {
      title: "Photos to Audit",
      value: loading ? "..." : photosToAudit,
      subtext: "Manual review queue",
      icon: IoImagesOutline,
      to: "/admin/gallery-approvals",
    },
  ];

  return (
    <div className="mx-auto max-w-[1800px] space-y-5 sm:space-y-6">
      <header>
        <h1 className="font-playfair text-2xl font-bold text-gray-950 sm:text-3xl">
          Dashboard
        </h1>
        <p className="mt-1 text-sm text-gray-500 sm:text-base">
          Welcome back. Here is the current content overview.
        </p>
      </header>

      <section className="grid grid-cols-3 gap-2 sm:grid-cols-2 sm:gap-3 xl:grid-cols-3 xl:gap-5">
        {stats.map((stat) => {
          const Icon = stat.icon;

          return (
            <StatLink
              key={stat.title}
              to={stat.to}
              className="group flex min-h-24 flex-col justify-between rounded-lg border border-gray-200 bg-white p-3 shadow-sm transition-[transform,box-shadow,border-color] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-0.5 hover:border-yellow-400 hover:shadow-lg active:translate-y-0 sm:min-h-32 sm:flex-row sm:items-center sm:p-6"
            >
              <div className="min-w-0">
                <p className="text-[8px] font-black uppercase leading-tight tracking-[0.12em] text-gray-500 sm:text-[10px] sm:tracking-[0.18em]">
                  {stat.title}
                </p>
                <p className="admin-number mt-2 text-2xl font-black leading-none text-gray-950 sm:mt-3 sm:text-5xl">
                  {stat.value}
                </p>
                <p className="mt-2 line-clamp-2 text-[10px] font-bold leading-tight text-green-600 sm:mt-3 sm:text-sm">
                  {stat.subtext}
                </p>
              </div>

              <div className="mt-2 grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-black text-yellow-400 transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.03] sm:ml-4 sm:mt-0 sm:h-14 sm:w-14">
                <Icon className="h-4 w-4 sm:h-6 sm:w-6" />
              </div>
            </StatLink>
          );
        })}
      </section>

      <section className="grid gap-4 xl:grid-cols-[minmax(0,1.25fr)_420px]">
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="flex flex-col gap-4 border-b border-gray-100 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
            <div>
              <h2 className="font-playfair text-xl font-bold text-gray-950">
                Upcoming Events
              </h2>
              <p className="mt-1 text-xs text-gray-500">
                Track the next published events on the calendar.
              </p>
            </div>
            <div className="flex items-center gap-3 rounded-xl border border-yellow-200 bg-yellow-50 px-4 py-3">
              <div className="grid h-10 w-10 place-items-center rounded-lg bg-yellow-400 text-black">
                <IoCalendarOutline size={21} />
              </div>
              <div>
                <p className="text-[9px] font-black uppercase tracking-[0.16em] text-yellow-700">
                  Total Upcoming
                </p>
                <p className="admin-number text-3xl font-black leading-none text-gray-950">
                  {loading ? "..." : upcomingEvents.length}
                </p>
              </div>
            </div>
          </div>

          <UpcomingEventsTable
            events={upcomingPreview}
            loading={loading}
            totalEvents={upcomingEvents.length}
          />
        </div>

        <aside className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:p-5">
          <h2 className="font-playfair text-xl font-bold text-gray-950">
            Quick Actions
          </h2>
          <p className="mt-1 text-xs text-gray-500">
            Jump into common admin workflows.
          </p>
          <div className="mt-4 grid gap-2">
            <QuickActions
              icon={FaPlus}
              title="Add New Event"
              description="Create an event record"
              to="/admin/events?action=create"
            />
            <QuickActions
              icon={FaPlus}
              title="Add Announcement"
              description="Publish a campus update"
              to="/admin/announcements?action=create"
            />
            <QuickActions
              icon={LuText}
              title="View All Events"
              description="Review event listings"
              to="/admin/events"
            />
            <QuickActions
              icon={IoImagesOutline}
              title="Audit Photos"
              description="Review pending media"
              to="/admin/gallery-approvals"
            />
          </div>
        </aside>
      </section>

    </div>
  );
}

function StatLink({ to, className, children }) {
  if (to) {
    return (
      <Link to={to} className={className}>
        {children}
      </Link>
    );
  }

  return <article className={className}>{children}</article>;
}

function UpcomingEventsTable({ events, loading, totalEvents }) {
  return (
    <div className="p-4 sm:p-5">
      <div className="mb-3 hidden grid-cols-[minmax(0,1fr)_130px_140px_120px_40px] gap-3 px-3 text-[10px] font-black uppercase tracking-[0.16em] text-gray-400 md:grid">
        <span>Event</span>
        <span>Date</span>
        <span>Duration</span>
        <span>Category</span>
        <span />
      </div>

      <div className="grid gap-2">
        {loading ? (
          <p className="rounded-lg bg-gray-50 p-4 text-sm text-gray-500">
            Loading upcoming events...
          </p>
        ) : events.length === 0 ? (
          <p className="rounded-lg bg-gray-50 p-4 text-sm text-gray-500">
            No upcoming events found.
          </p>
        ) : (
          events.map((event, index) => (
            <article
              key={event._id || event.id || `${event.title}-${index}`}
              className="grid gap-3 rounded-xl border border-gray-100 bg-gray-50/70 p-3 transition-colors hover:border-yellow-300 hover:bg-yellow-50/50 md:grid-cols-[minmax(0,1fr)_130px_140px_120px_40px] md:items-center"
            >
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-white text-[11px] font-black text-yellow-600 shadow-sm">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <div className="min-w-0">
                    <h3 className="truncate text-sm font-black text-gray-950">
                      {event.title || "Untitled Event"}
                    </h3>
                    <p className="mt-0.5 flex min-w-0 items-center gap-1 truncate text-xs font-medium text-gray-500">
                      <IoLocationOutline className="h-3.5 w-3.5 shrink-0 text-yellow-600" />
                      {event.location || event.venue || "No venue provided"}
                    </p>
                  </div>
                </div>
              </div>

              <InfoPill
                icon={IoCalendarOutline}
                label="Date"
                value={formatDate(event.startDate || event.date)}
              />
              <InfoPill
                icon={IoTimeOutline}
                label="Duration"
                value={getScheduleLength(event)}
              />
              <p className="text-xs font-black uppercase text-gray-700">
                {event.category || "N/A"}
              </p>
              <Link
                to="/admin/events"
                className="grid h-9 w-9 place-items-center rounded-lg bg-white text-gray-500 shadow-sm transition-colors hover:bg-black hover:text-yellow-400"
                aria-label="Open events manager"
              >
                <IoArrowForwardOutline />
              </Link>
            </article>
          ))
        )}
      </div>

      {totalEvents > events.length && (
        <Link
          to="/admin/events"
          className="mt-3 inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.18em] text-yellow-700 transition-colors hover:text-black"
        >
          View {totalEvents - events.length} more upcoming events
          <IoArrowForwardOutline />
        </Link>
      )}
    </div>
  );
}

function InfoPill({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center gap-2 px-1 py-2">
      <Icon className="h-4 w-4 shrink-0 text-yellow-600" />
      <div className="min-w-0">
        <p className="text-[9px] font-black uppercase tracking-[0.14em] text-gray-400 md:hidden">
          {label}
        </p>
        <p className="truncate text-xs font-bold text-gray-800">{value}</p>
      </div>
    </div>
  );
}

function formatDate(date) {
  if (!date) return "N/A";
  const parsed = new Date(date);
  if (Number.isNaN(parsed.valueOf())) return String(date);
  return parsed.toLocaleDateString("en-PH", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function getScheduleLength(event) {
  const start = new Date(event.startDate || event.date);
  const end = new Date(event.endDate || event.startDate || event.date);

  if (Number.isNaN(start.valueOf()) || Number.isNaN(end.valueOf())) {
    return "N/A";
  }

  start.setHours(0, 0, 0, 0);
  end.setHours(0, 0, 0, 0);

  const days = Math.max(
    1,
    Math.round((end - start) / (1000 * 60 * 60 * 24)) + 1
  );

  return `${days} ${days === 1 ? "day" : "days"}`;
}
