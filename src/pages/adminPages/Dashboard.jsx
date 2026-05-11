import { useEffect, useMemo, useState } from "react";
import {
  IoCalendarOutline,
  IoCheckmarkCircleOutline,
  IoImagesOutline,
  IoMegaphoneOutline,
  IoTimeOutline,
} from "react-icons/io5";
import { FaPlus } from "react-icons/fa6";
import { LuText } from "react-icons/lu";
import QuickActions from "../../components/adminComponents/QuickActions";
import Badge from "../../components/adminComponents/Badge";
import { getAnnouncements, getEvents } from "../../services/api";

const PHOTOS_TO_AUDIT = 45;

export default function Dashboard() {
  const [events, setEvents] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const [eventsData, announcementsData] = await Promise.all([
          getEvents(),
          getAnnouncements(),
        ]);

        setEvents(Array.isArray(eventsData) ? eventsData : eventsData.events || []);
        setAnnouncements(
          Array.isArray(announcementsData)
            ? announcementsData
            : announcementsData.announcements || []
        );
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
      )
      .slice(0, 5);
  }, [publishedEvents]);

  const recentlyUpdated = useMemo(() => {
    return [
      ...publishedEvents.map((event) => ({
        id: event._id || event.id,
        type: "Event",
        title: event.title,
        date: event.updatedAt || event.createdAt || event.startDate,
      })),
      ...publishedAnnouncements.map((announcement) => ({
        id: announcement._id || announcement.id,
        type: "Announcement",
        title: announcement.title,
        date: announcement.updatedAt || announcement.createdAt,
      })),
    ]
      .filter((item) => item.title)
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 4);
  }, [publishedEvents, publishedAnnouncements]);

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
      value: PHOTOS_TO_AUDIT,
      subtext: "Manual review queue",
      icon: IoImagesOutline,
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
            <article
              key={stat.title}
              className="group flex min-h-24 flex-col justify-between rounded-lg border border-gray-200 bg-white p-3 shadow-sm transition-[transform,box-shadow,border-color] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-0.5 hover:border-yellow-400 hover:shadow-lg active:translate-y-0 sm:min-h-32 sm:flex-row sm:items-center sm:p-6"
            >
              <div className="min-w-0">
                <p className="text-[8px] font-black uppercase leading-tight tracking-[0.12em] text-gray-500 sm:text-[10px] sm:tracking-[0.18em]">
                  {stat.title}
                </p>
                <p className="mt-2 font-playfair text-2xl font-bold leading-none text-gray-950 sm:mt-3 sm:text-5xl">
                  {stat.value}
                </p>
                <p className="mt-2 line-clamp-2 text-[10px] font-bold leading-tight text-green-600 sm:mt-3 sm:text-sm">
                  {stat.subtext}
                </p>
              </div>

              <div className="mt-2 grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-black text-yellow-400 transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.03] sm:ml-4 sm:mt-0 sm:h-14 sm:w-14">
                <Icon className="h-4 w-4 sm:h-6 sm:w-6" />
              </div>
            </article>
          );
        })}
      </section>

      <section className="grid gap-4 xl:grid-cols-[minmax(0,1.25fr)_420px]">
        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:p-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="font-playfair text-xl font-bold text-gray-950">
                Today&apos;s Focus
              </h2>
              <p className="mt-1 text-xs text-gray-500">
                Prioritize the content that needs attention first.
              </p>
            </div>
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-yellow-50 text-yellow-600">
              <IoCheckmarkCircleOutline size={22} />
            </div>
          </div>

          <div className="mt-5 grid gap-3 md:grid-cols-3">
            <FocusItem
              label="Upcoming"
              value={upcomingEvents.length}
              caption="events scheduled ahead"
            />
            <FocusItem
              label="Announcements"
              value={publishedAnnouncements.length}
              caption="currently published"
            />
            <FocusItem
              label="Audit"
              value={PHOTOS_TO_AUDIT}
              caption="photos waiting"
            />
          </div>

          <div className="mt-5 border-t border-gray-100 pt-4">
            <h3 className="text-[11px] font-black uppercase tracking-[0.18em] text-gray-400">
              Recent Updates
            </h3>
            <div className="mt-3 grid gap-2">
              {recentlyUpdated.length === 0 ? (
                <p className="rounded-lg bg-gray-50 p-4 text-sm text-gray-500">
                  No recent updates yet.
                </p>
              ) : (
                recentlyUpdated.map((item) => (
                  <div
                    key={`${item.type}-${item.id}`}
                    className="flex items-center justify-between gap-3 rounded-lg bg-gray-50 px-3 py-2"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-bold text-gray-900">
                        {item.title}
                      </p>
                      <p className="text-xs text-gray-500">{item.type}</p>
                    </div>
                    <span className="shrink-0 text-xs font-semibold text-gray-500">
                      {formatDate(item.date)}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
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
              to="/admin/events"
            />
            <QuickActions
              icon={FaPlus}
              title="Add Announcement"
              description="Publish a campus update"
              to="/admin/announcements"
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
            />
          </div>
        </aside>
      </section>

      <section className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:p-5">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="font-playfair text-xl font-bold text-gray-950">
              Upcoming Events
            </h2>
            <p className="mt-1 text-xs text-gray-500">
              The next published events at a glance.
            </p>
          </div>
        </div>

        <div className="mt-4 grid gap-2">
          {loading ? (
            <p className="rounded-lg bg-gray-50 p-4 text-sm text-gray-500">
              Loading events...
            </p>
          ) : upcomingEvents.length === 0 ? (
            <p className="rounded-lg bg-gray-50 p-4 text-sm text-gray-500">
              No upcoming events found.
            </p>
          ) : (
            upcomingEvents.map((event) => (
              <article
                key={event._id || event.id}
                className="grid gap-3 rounded-lg border border-gray-100 bg-white p-3 shadow-sm transition-colors hover:border-yellow-300 hover:bg-yellow-50/30 md:grid-cols-[minmax(0,1fr)_130px_130px_120px]"
              >
                <div className="min-w-0">
                  <h3 className="truncate text-sm font-bold text-gray-950">
                    {event.title}
                  </h3>
                  <p className="mt-1 truncate text-xs text-gray-500">
                    {event.location || event.venue || "No venue provided"}
                  </p>
                </div>
                <InfoPill
                  icon={IoTimeOutline}
                  label="Schedule"
                  value={getScheduleLength(event)}
                />
                <InfoPill
                  icon={IoCalendarOutline}
                  label="Date"
                  value={formatDate(event.startDate || event.date)}
                />
                <div className="flex items-center md:justify-end">
                  <Badge type={event.category}>{event.category || "N/A"}</Badge>
                </div>
              </article>
            ))
          )}
        </div>
      </section>
    </div>
  );
}

function FocusItem({ label, value, caption }) {
  return (
    <div className="rounded-xl bg-gray-50 p-4">
      <p className="text-[10px] font-black uppercase tracking-[0.16em] text-gray-400">
        {label}
      </p>
      <p className="mt-2 font-playfair text-3xl font-bold text-gray-950">
        {value}
      </p>
      <p className="mt-1 text-xs font-semibold text-gray-500">{caption}</p>
    </div>
  );
}

function InfoPill({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center gap-2 rounded-lg bg-gray-50 px-3 py-2">
      <Icon className="h-4 w-4 shrink-0 text-yellow-600" />
      <div className="min-w-0">
        <p className="text-[9px] font-black uppercase tracking-[0.14em] text-gray-400">
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
