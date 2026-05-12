import { useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import MainLayout from "../components/MainLayout";
import FilterDropdown from "../components/adminComponents/FilterDropdown";
import { getAnnouncements, getEvents } from "../services/api";
import {
  formatDateRange,
  formatTimeRange,
  getAnnouncementBody,
  getItemImage,
  getPublishedItems,
  isUpcomingItem,
  matchesSearch,
} from "../utils/contentFormatters";

function getEventDate(event) {
  return new Date(event.startDate || event.date || event.createdAt);
}

function getFeaturedEvent(events) {
  return (
    events.find((event) => event.isFeatured) ||
    events.filter(isUpcomingItem).sort((a, b) => getEventDate(a) - getEventDate(b))[0] ||
    events[0]
  );
}

export default function Events() {
  const location = useLocation();
  const [events, setEvents] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [activeCategory, setActiveCategory] = useState("All");
  const [sortBy, setSortBy] = useState("date-asc");
  const [searchInput, setSearchInput] = useState("");
  const [loading, setLoading] = useState(true);
  const searchQuery = new URLSearchParams(location.search).get("search") || "";

  useEffect(() => {
    setSearchInput(searchQuery);
  }, [searchQuery]);

  useEffect(() => {
    let ignore = false;

    async function loadEvents() {
      try {
        const [eventData, announcementData] = await Promise.all([
          getEvents(),
          getAnnouncements(),
        ]);
        const publishedEvents = getPublishedItems(
          Array.isArray(eventData) ? eventData : eventData.events || []
        ).sort((a, b) => getEventDate(a) - getEventDate(b));
        const publishedAnnouncements = getPublishedItems(
          Array.isArray(announcementData)
            ? announcementData
            : announcementData.announcements || []
        ).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        if (!ignore) {
          setEvents(publishedEvents);
          setAnnouncements(publishedAnnouncements);
        }
      } catch (error) {
        console.error("Failed to load events:", error);
      } finally {
        if (!ignore) setLoading(false);
      }
    }

    loadEvents();

    return () => {
      ignore = true;
    };
  }, []);

  const categories = useMemo(() => {
    return [
      "All",
      ...Array.from(
        new Set(events.map((event) => event.category?.trim()).filter(Boolean))
      ).sort((a, b) => a.localeCompare(b)),
    ];
  }, [events]);

  const featuredEvent = useMemo(() => getFeaturedEvent(events), [events]);
  const searchTerm = searchInput.trim();

  const visibleEvents = useMemo(() => {
    let result = [...events];

    if (activeCategory !== "All") {
      result = result.filter((event) => event.category === activeCategory);
    }

    if (searchTerm) {
      result = result.filter((event) =>
        matchesSearch(event, searchTerm, [
          "title",
          "category",
          "description",
          "location",
          "venue",
          "organizer",
        ])
      );
    }

    result.sort((a, b) => {
      const titleA = a.title?.toLowerCase() || "";
      const titleB = b.title?.toLowerCase() || "";
      const dateA = getEventDate(a);
      const dateB = getEventDate(b);

      if (sortBy === "az") return titleA.localeCompare(titleB);
      if (sortBy === "za") return titleB.localeCompare(titleA);
      if (sortBy === "date-desc") return dateB - dateA;
      return dateA - dateB;
    });

    return result;
  }, [activeCategory, events, searchTerm, sortBy]);

  const matchingAnnouncements = useMemo(() => {
    if (!searchTerm) return [];

    return announcements.filter((announcement) =>
      matchesSearch(announcement, searchTerm, [
        "title",
        "category",
        "type",
        "eventTitle",
        "content",
        "caption",
        "createdBy",
      ])
    );
  }, [announcements, searchTerm]);

  if (selectedEvent) {
    const relatedEvents = events
      .filter((event) => event._id !== selectedEvent._id)
      .slice(0, 3);

    return (
      <div className="min-h-screen bg-white text-black font-inter">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <button
            onClick={() => setSelectedEvent(null)}
            className="mb-6 flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-[#c49600] transition-colors hover:text-black"
          >
            Go back
          </button>

          <div className="grid grid-cols-1 gap-12 lg:grid-cols-[1fr_300px]">
            <section>
              <h1 className="mb-8 font-playfair text-4xl font-black uppercase tracking-tight text-neutral-900">
                {selectedEvent.title}
              </h1>

              <div className="mb-10 grid grid-cols-2 gap-4 md:grid-cols-5">
                {[
                  { label: "DATE", val: formatDateRange(selectedEvent) },
                  { label: "TIME", val: formatTimeRange(selectedEvent) },
                  {
                    label: "VENUE",
                    val: selectedEvent.location || selectedEvent.venue || "Venue TBA",
                  },
                  {
                    label: "ORGANIZED BY",
                    val:
                      selectedEvent.organizer ||
                      selectedEvent.organizedBy ||
                      "Organizer TBA",
                  },
                  { label: "CATEGORY", val: selectedEvent.category || "Event" },
                ].map((item) => (
                  <div key={item.label} className="flex items-start gap-2">
                    <div className="flex h-6 w-6 shrink-0 items-center justify-center bg-[#f6c744] text-[10px]" />
                    <div>
                      <p className="text-[8px] font-black text-neutral-400 uppercase tracking-tighter">
                        {item.label}
                      </p>
                      <p className="text-[10px] font-bold text-neutral-800 leading-tight">
                        {item.val}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mb-12">
                <h2 className="mb-4 border-b border-neutral-100 pb-2 text-[10px] font-black uppercase tracking-[0.2em] text-neutral-400">
                  About this event
                </h2>
                <p className="text-justify text-[13px] leading-relaxed text-neutral-600">
                  {selectedEvent.description ||
                    "No event description has been provided."}
                </p>
              </div>

              {Array.isArray(selectedEvent.schedule) &&
                selectedEvent.schedule.length > 0 && (
                  <div className="grid gap-10 md:grid-cols-2">
                    <div>
                      <h2 className="mb-4 border-b border-neutral-100 pb-2 text-[10px] font-black uppercase tracking-[0.2em] text-neutral-400">
                        Program Schedule
                      </h2>
                      <div className="divide-y divide-neutral-100">
                        {selectedEvent.schedule.map((item, index) => (
                          <div key={index} className="flex gap-6 py-3">
                            <span className="w-12 shrink-0 text-[11px] font-bold text-[#c49600]">
                              {item.day || `Day ${index + 1}`}
                            </span>
                            <div>
                              <p className="text-[12px] font-bold text-neutral-800">
                                {item.activity || item.title}
                              </p>
                              {item.description && (
                                <p className="text-[10px] italic text-neutral-400">
                                  {item.description}
                                </p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

              <div className="mt-16">
                <h2 className="mb-6 border-b border-[#f6c744] pb-2 text-[10px] font-black uppercase tracking-[0.2em] text-neutral-400">
                  Event Preview
                </h2>
                <img
                  src={getItemImage(selectedEvent)}
                  alt={selectedEvent.title}
                  className="aspect-video w-full max-w-3xl border border-neutral-200 object-cover"
                />
              </div>
            </section>

            <aside className="space-y-10">
              <div>
                <h2 className="mb-4 border-b border-neutral-100 pb-2 text-[10px] font-black uppercase tracking-widest text-neutral-400">
                  Venue
                </h2>
                <div className="flex aspect-square flex-col items-center justify-center border border-neutral-100 bg-neutral-50 p-6 text-center">
                  <p className="text-[11px] font-bold text-neutral-700">
                    {selectedEvent.location || selectedEvent.venue || "Venue TBA"}
                  </p>
                </div>
              </div>

              {relatedEvents.length > 0 && (
                <div>
                  <h2 className="mb-4 border-b border-neutral-100 pb-2 text-[10px] font-black uppercase tracking-widest text-neutral-400">
                    Related Events
                  </h2>
                  <div className="grid grid-cols-2 gap-2">
                    {relatedEvents.map((event, index) => (
                      <button
                        key={event._id || event.title}
                        onClick={() => setSelectedEvent(event)}
                        className={`border border-neutral-100 bg-white p-3 text-left ${
                          index === 2 ? "col-span-2" : ""
                        }`}
                      >
                        <img
                          src={getItemImage(event)}
                          alt={event.title}
                          className="mb-2 aspect-video w-full object-cover"
                        />
                        <p className="mb-1 text-[10px] font-black uppercase leading-tight">
                          {event.title}
                        </p>
                        <p className="text-[8px] font-bold uppercase text-neutral-400">
                          {formatDateRange(event)}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </aside>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-white text-black">
      <MainLayout
        hero={
          !loading && featuredEvent ? (
            <FeaturedHero
              event={featuredEvent}
              onView={() => setSelectedEvent(featuredEvent)}
            />
          ) : null
        }
      >
        <div className="px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
          <div className="mb-6 flex flex-col justify-between gap-2 md:flex-row md:items-end">
            <div>
              <h2 className="font-playfair text-3xl font-bold text-neutral-900">
                {searchTerm ? `Search results for "${searchTerm}"` : "Events"}
              </h2>
              <p className="mt-1 text-sm text-neutral-500">
                Browse published events across campus.
              </p>
            </div>
            {searchQuery && (
              <Link
                to="/events"
                onClick={() => setSearchInput("")}
                className="text-[10px] font-black uppercase tracking-widest text-[#c49600] hover:underline"
              >
                Clear search
              </Link>
            )}
          </div>

          <div className="mb-8 flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex h-11 w-full items-center rounded-xl bg-gray-50 px-3 transition-colors focus-within:bg-white focus-within:ring-1 focus-within:ring-yellow-500 sm:h-12 sm:px-4 lg:max-w-xl">
              <input
                type="text"
                value={searchInput}
                onChange={(event) => setSearchInput(event.target.value)}
                placeholder="Search events..."
                className="h-full w-full bg-transparent text-xs text-gray-900 outline-none placeholder:text-gray-400 sm:text-sm"
              />
            </div>

            <div className="grid grid-cols-2 gap-2 sm:w-auto sm:min-w-[320px]">
              <FilterDropdown
                label="Category"
                value={activeCategory}
                onChange={setActiveCategory}
                options={categories.map((category) => ({
                  label: category,
                  value: category,
                }))}
              />
              <FilterDropdown
                label="Sort"
                value={sortBy}
                onChange={setSortBy}
                options={[
                  { label: "Date ascending", value: "date-asc" },
                  { label: "Date descending", value: "date-desc" },
                  { label: "A-Z", value: "az" },
                  { label: "Z-A", value: "za" },
                ]}
              />
            </div>
          </div>

          {loading && (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
              {Array.from({ length: 8 }).map((_, index) => (
                <div key={index} className="border border-neutral-100 bg-white p-4">
                  <div className="aspect-video animate-pulse bg-neutral-200" />
                  <div className="mt-4 h-3 w-24 animate-pulse bg-neutral-200" />
                  <div className="mt-3 h-8 animate-pulse bg-neutral-200" />
                  <div className="mt-4 h-8 animate-pulse bg-neutral-200" />
                </div>
              ))}
            </div>
          )}

          {!loading && visibleEvents.length === 0 && (
            <div className="border border-dashed border-neutral-200 bg-white p-8 text-sm text-neutral-500">
              No events matched your search or filters.
            </div>
          )}

          {!loading && visibleEvents.length > 0 && (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
              {visibleEvents.map((event) => (
                <div
                  key={event._id || event.title}
                  className="group flex flex-col border border-neutral-100 border-t-[3px] border-t-[#f6c744] bg-white shadow-sm"
                >
                  <div className="relative aspect-video overflow-hidden bg-neutral-200">
                    <img
                      src={getItemImage(event)}
                      className="h-full w-full object-cover transition-all duration-500 group-hover:scale-105"
                      alt={event.title}
                    />
                  </div>
                  <div className="flex flex-1 flex-col p-4">
                    <span className="text-[8px] font-black uppercase tracking-widest text-neutral-400">
                      {event.category || "Event"}
                    </span>
                    <h3 className="mt-1.5 h-8 font-playfair text-[13px] font-bold leading-tight line-clamp-2 text-neutral-900 transition-colors group-hover:text-[#c49600]">
                      {event.title}
                    </h3>
                    <div className="mt-3 text-[10px] italic text-neutral-500">
                      <p className="truncate">
                        {event.location || event.venue || "Venue TBA"}
                      </p>
                      <p className="mt-0.5 truncate">{formatDateRange(event)}</p>
                    </div>
                    <button
                      onClick={() => setSelectedEvent(event)}
                      className="mt-4 w-full bg-[#f6c744] py-2 text-[8px] font-black uppercase tracking-widest text-black transition-colors hover:bg-[#e3b832]"
                    >
                      View
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {!loading && searchTerm && matchingAnnouncements.length > 0 && (
            <section className="mt-12">
              <div className="mb-5 flex items-center justify-between gap-4">
                <h3 className="font-playfair text-xl font-bold text-neutral-900">
                  Matching Announcements
                </h3>
                <Link
                  to={`/announcements?search=${encodeURIComponent(searchTerm)}`}
                  className="text-[10px] font-black uppercase tracking-widest text-[#c49600] hover:underline"
                >
                  View in announcements
                </Link>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                {matchingAnnouncements.map((announcement) => (
                  <Link
                    key={announcement._id || announcement.title}
                    to={`/announcements?search=${encodeURIComponent(searchTerm)}`}
                    state={{ featuredAnnouncement: announcement }}
                    className="border border-neutral-100 bg-white p-5 transition-colors hover:border-[#f6c744] hover:bg-[#fffdf5]"
                  >
                    <span className="text-[9px] font-black uppercase tracking-widest text-neutral-400">
                      {announcement.category || announcement.type || "Announcement"}
                    </span>
                    <h4 className="mt-1 font-inter text-sm font-bold text-neutral-900">
                      {announcement.title}
                    </h4>
                    <p className="mt-3 line-clamp-2 text-xs leading-5 text-neutral-600">
                      {getAnnouncementBody(announcement)}
                    </p>
                  </Link>
                ))}
              </div>
            </section>
          )}
        </div>
      </MainLayout>
    </div>
  );
}

function FeaturedHero({ event, onView }) {
  return (
    <section className="relative isolate min-h-[420px] overflow-hidden bg-black text-white sm:min-h-[500px] lg:min-h-[560px]">
      <img
        src={getItemImage(event)}
        alt={event.title}
        className="absolute inset-0 h-full w-full object-cover opacity-70"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-black/95 via-black/60 to-black/20" />
      <div className="relative mx-auto flex min-h-[420px] max-w-[1800px] flex-col justify-end px-5 py-10 sm:min-h-[500px] sm:px-8 lg:min-h-[560px] lg:px-12 lg:py-16">
        <p className="mb-4 text-[10px] font-black uppercase tracking-[0.4em] text-[#f6c744]">
          Featured Event
        </p>
        <h1 className="max-w-4xl font-playfair text-4xl font-black leading-tight sm:text-5xl lg:text-6xl">
          {event.title}
        </h1>
        <div className="mt-6 flex max-w-4xl flex-wrap gap-x-6 gap-y-2 text-[10px] font-black uppercase tracking-wider text-white/85 sm:text-xs">
          <span>{event.location || event.venue || "Venue TBA"}</span>
          <span>{formatDateRange(event)}</span>
          <span>{formatTimeRange(event)}</span>
        </div>
        <button
          onClick={onView}
          className="mt-8 w-fit bg-[#f6c744] px-10 py-3 text-[10px] font-black uppercase tracking-widest text-black transition-colors hover:bg-[#e3b832]"
        >
          View
        </button>
      </div>
    </section>
  );
}
