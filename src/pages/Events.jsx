import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import MainLayout from "../components/MainLayout";
import BookmarkButton from "../components/BookmarkButton";
import Pagination from "../components/Pagination";
import FilterDropdown from "../components/adminComponents/FilterDropdown";
import { useAuth } from "../context/AuthContext";
import {
  createEventGalleryItem,
  getAnnouncements,
  getEventGallery,
  getEvents,
} from "../services/api";
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

function normalizeTitle(value) {
  return String(value || "").replace(/\s+/g, " ").trim().toLowerCase();
}

const ITEMS_PER_PAGE = 12;
const GALLERY_ITEMS_PER_PAGE = 6;

export default function Events() {
  const location = useLocation();
  const navigate = useNavigate();
  const { eventId } = useParams();
  const primedBackStackRef = useRef(false);
  const { isAuthenticated, isBookmarked } = useAuth();
  const [events, setEvents] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(location.state?.selectedEvent || null);
  const [galleryItems, setGalleryItems] = useState([]);
  const [galleryLoading, setGalleryLoading] = useState(false);
  const [galleryError, setGalleryError] = useState("");
  const [isGalleryModalOpen, setIsGalleryModalOpen] = useState(false);
  const [previewViewer, setPreviewViewer] = useState(null);
  const [activeCategory, setActiveCategory] = useState("All");
  const [bookmarkFilter, setBookmarkFilter] = useState("all");
  const [sortBy, setSortBy] = useState("date-asc");
  const [searchInput, setSearchInput] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const searchQuery = new URLSearchParams(location.search).get("search") || "";
  const bookmarkQuery = new URLSearchParams(location.search).get("bookmarks") || "";

  useEffect(() => {
    setSearchInput(searchQuery);
  }, [searchQuery]);

  useEffect(() => {
    if (["all", "bookmarked", "not-bookmarked"].includes(bookmarkQuery)) {
      setBookmarkFilter(bookmarkQuery);
    }
  }, [bookmarkQuery]);

  useEffect(() => {
    if (
      eventId &&
      location.state?.primeEventsBack &&
      !location.state?.eventsBackPrimed &&
      !primedBackStackRef.current
    ) {
      primedBackStackRef.current = true;
      const eventFromState = location.state.selectedEvent;

      navigate("/events", { replace: true });

      window.setTimeout(() => {
        navigate(`/events/${eventId}`, {
          state: {
            selectedEvent: eventFromState,
            eventsBackPrimed: true,
          },
        });
      }, 0);
    }

    return undefined;
  }, [eventId, location.state, navigate]);

  useEffect(() => {
    if (location.state?.selectedEvent) {
      setSelectedEvent(location.state.selectedEvent);
      return;
    }

    if (!eventId) {
      setSelectedEvent(null);
    }
  }, [eventId, location.state]);

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

  useEffect(() => {
    if (!eventId || selectedEvent?._id?.toString() === eventId) return;

    const matchedEvent = events.find((event) => event._id?.toString() === eventId);

    if (matchedEvent) {
      setSelectedEvent(matchedEvent);
    }
  }, [eventId, events, selectedEvent?._id]);

  function openEventDetail(event, options = {}) {
    if (!event?._id) return;

    setSelectedEvent(event);
    navigate(`/events/${event._id}`, {
      state: {
        selectedEvent: event,
        ...options,
      },
    });
  }

  useEffect(() => {
    let ignore = false;
    const eventId = selectedEvent?._id;

    async function loadGallery() {
      if (!eventId) {
        setGalleryItems([]);
        setGalleryError("");
        setGalleryLoading(false);
        return;
      }

      setGalleryLoading(true);
      setGalleryError("");

      try {
        const galleryData = await getEventGallery(eventId);

        if (!ignore) {
          setGalleryItems(Array.isArray(galleryData) ? galleryData : []);
        }
      } catch (error) {
        console.error("Failed to load event gallery:", error);

        if (!ignore) {
          setGalleryItems([]);
          setGalleryError(error.message || "Failed to load event gallery.");
        }
      } finally {
        if (!ignore) setGalleryLoading(false);
      }
    }

    loadGallery();

    return () => {
      ignore = true;
    };
  }, [selectedEvent?._id]);

  async function handleGallerySubmit(payload) {
    if (!selectedEvent?._id) return;

    const result = await createEventGalleryItem(selectedEvent._id, payload);

    window.alert(
      result.message ||
        "Photo passed Vision AI and is pending admin approval."
    );
  }

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
  const bookmarkedEventCount = useMemo(() => {
    return events.filter((event) => isBookmarked(event._id)).length;
  }, [events, isBookmarked]);

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

    if (bookmarkFilter === "bookmarked") {
      result = result.filter((event) => isBookmarked(event._id));
    }

    if (bookmarkFilter === "not-bookmarked") {
      result = result.filter((event) => !isBookmarked(event._id));
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
  }, [activeCategory, bookmarkFilter, events, isBookmarked, searchTerm, sortBy]);

  const totalEventPages = Math.ceil(visibleEvents.length / ITEMS_PER_PAGE);
  const paginatedEvents = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;

    return visibleEvents.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [currentPage, visibleEvents]);

  useEffect(() => {
    setCurrentPage(1);
  }, [activeCategory, bookmarkFilter, searchTerm, sortBy]);

  useEffect(() => {
    if (totalEventPages > 0 && currentPage > totalEventPages) {
      setCurrentPage(totalEventPages);
    }
  }, [currentPage, totalEventPages]);

  function handlePageChange(page) {
    setCurrentPage(Math.min(Math.max(page, 1), totalEventPages));
  }

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
    const taggedAnnouncements = announcements
      .filter((announcement) => {
        const announcementEventTitle = normalizeTitle(announcement.eventTitle);
        const selectedTitle = normalizeTitle(selectedEvent.title);

        return announcementEventTitle && selectedTitle && announcementEventTitle === selectedTitle;
      })
      .slice(0, 3);

    return (
      <div className="min-h-screen bg-white text-black font-inter">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <button
            onClick={() => navigate("/events")}
            className="mb-6 flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-[#c49600] transition-colors hover:text-black"
          >
            Go back
          </button>

          <div className="grid grid-cols-1 gap-12 lg:grid-cols-[1fr_300px]">
            <section>
              <div className="mb-8 flex items-start justify-between gap-4">
                <h1 className="font-playfair text-4xl font-black uppercase tracking-tight text-neutral-900">
                  {selectedEvent.title}
                </h1>
                <BookmarkButton eventId={selectedEvent._id} className="shrink-0" size={20} />
              </div>

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
                  <ProgramSchedule schedule={selectedEvent.schedule} />
                )}

              <div className="mt-16">
                <h2 className="mb-6 border-b border-[#f6c744] pb-2 text-[10px] font-black uppercase tracking-[0.2em] text-neutral-400">
                  Event Preview
                </h2>
                <button
                  type="button"
                  onClick={() =>
                    setPreviewViewer({
                      image: getItemImage(selectedEvent),
                      title: selectedEvent.title,
                      label: "Event Preview",
                      description: selectedEvent.description,
                    })
                  }
                  className="group block w-full max-w-3xl overflow-hidden border border-neutral-200 bg-neutral-100 text-left"
                >
                  <img
                    src={getItemImage(selectedEvent)}
                    alt={selectedEvent.title}
                    className="aspect-video w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <span className="block bg-white px-4 py-3 text-[9px] font-black uppercase tracking-widest text-neutral-400 transition-colors group-hover:text-[#c49600]">
                    Click to view full image
                  </span>
                </button>
              </div>

              <EventGallerySection
                key={selectedEvent._id}
                items={galleryItems}
                loading={galleryLoading}
                error={galleryError}
                isAuthenticated={isAuthenticated}
                onCreate={() => setIsGalleryModalOpen(true)}
              />
            </section>

            <aside className="space-y-10">
              {taggedAnnouncements.length > 0 && (
                <div>
                  <h2 className="mb-4 border-b border-neutral-100 pb-2 text-[10px] font-black uppercase tracking-widest text-neutral-400">
                    Related Announcements
                  </h2>
                  <div className="grid gap-3">
                    {taggedAnnouncements.map((announcement) => (
                      <Link
                        key={announcement._id || announcement.title}
                        to="/announcements"
                        state={{ selectedAnnouncement: announcement }}
                        className="block border border-neutral-100 border-t-[3px] border-t-[#f6c744] bg-white p-4 text-left shadow-sm transition-colors hover:border-[#f6c744] hover:bg-[#fffdf5]"
                      >
                        <div className="mb-2 flex flex-wrap gap-1.5">
                          <span className="bg-neutral-100 px-2 py-1 text-[7px] font-black uppercase tracking-widest text-neutral-500">
                            {announcement.type || "Announcement"}
                          </span>
                          <span className="bg-[#fff8df] px-2 py-1 text-[7px] font-black uppercase tracking-widest text-[#9b7200]">
                            {announcement.category || "Uncategorized"}
                          </span>
                        </div>
                        <p className="text-[12px] font-bold leading-snug text-neutral-900 line-clamp-2">
                          {announcement.title}
                        </p>
                        <p className="mt-2 line-clamp-2 text-[11px] leading-5 text-neutral-500">
                          {getAnnouncementBody(announcement)}
                        </p>
                        <p className="mt-3 text-[8px] font-semibold uppercase tracking-wider text-neutral-400">
                          {new Date(announcement.createdAt).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </p>
                        <p className="mt-3 text-[8px] font-black uppercase tracking-widest text-[#9b7200]">
                          View announcement
                        </p>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {relatedEvents.length > 0 && (
                <div>
                  <h2 className="mb-4 border-b border-neutral-100 pb-2 text-[10px] font-black uppercase tracking-widest text-neutral-400">
                    Other Events
                  </h2>
                  <div className="grid gap-3">
                    {relatedEvents.map((event) => (
                      <button
                        key={event._id || event.title}
                        onClick={() => openEventDetail(event)}
                        className="border border-neutral-100 border-t-[3px] border-t-[#f6c744] bg-white p-4 text-left shadow-sm transition-colors hover:border-[#f6c744] hover:bg-[#fffdf5]"
                      >
                        <img
                          src={getItemImage(event)}
                          alt={event.title}
                          className="mb-3 aspect-video w-full object-cover"
                        />
                        <div className="mb-2 flex flex-wrap gap-1.5">
                          <span className="bg-[#fff8df] px-2 py-1 text-[7px] font-black uppercase tracking-widest text-[#9b7200]">
                            {event.category || "Event"}
                          </span>
                        </div>
                        <p className="text-[12px] font-bold leading-snug text-neutral-900 line-clamp-2">
                          {event.title}
                        </p>
                        <p className="mt-2 line-clamp-2 text-[11px] leading-5 text-neutral-500">
                          {event.description || "No event description has been provided."}
                        </p>
                        <div className="mt-3 space-y-1 text-[9px] text-neutral-500">
                          <p>
                            <span className="uppercase tracking-wider text-neutral-400">Date</span>{" "}
                            {formatDateRange(event)}
                          </p>
                          <p>
                            <span className="uppercase tracking-wider text-neutral-400">Time</span>{" "}
                            {formatTimeRange(event)}
                          </p>
                        </div>
                        <p className="mt-3 text-[8px] font-black uppercase tracking-widest text-[#9b7200]">
                          View event
                        </p>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </aside>
          </div>
        </div>
        {isGalleryModalOpen && (
          <GalleryCreateModal
            eventTitle={selectedEvent.title}
            onClose={() => setIsGalleryModalOpen(false)}
            onSubmit={handleGallerySubmit}
          />
        )}
        {previewViewer && (
          <ImageViewer
            item={previewViewer}
            onClose={() => setPreviewViewer(null)}
          />
        )}
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
              onView={() => openEventDetail(featuredEvent)}
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

            <div className="grid grid-cols-2 gap-2 sm:w-auto sm:min-w-[480px] lg:grid-cols-3">
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
                label="Bookmarks"
                value={bookmarkFilter}
                onChange={setBookmarkFilter}
                options={[
                  { label: "All events", value: "all" },
                  {
                    label: isAuthenticated
                      ? `Bookmarked (${bookmarkedEventCount})`
                      : "Bookmarked",
                    value: "bookmarked",
                  },
                  { label: "Not bookmarked", value: "not-bookmarked" },
                ]}
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
            <>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
                {paginatedEvents.map((event) => (
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
                      <BookmarkButton
                        eventId={event._id}
                        className="absolute right-3 top-3"
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
                        onClick={() => openEventDetail(event)}
                        className="mt-4 w-full bg-[#f6c744] py-2 text-[8px] font-black uppercase tracking-widest text-black transition-colors hover:bg-[#e3b832]"
                      >
                        View
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <Pagination
                currentPage={currentPage}
                totalPages={totalEventPages}
                onPageChange={handlePageChange}
              />
            </>
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
                    to="/announcements"
                    state={{ selectedAnnouncement: announcement }}
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

function EventGallerySection({
  items,
  loading,
  error,
  isAuthenticated,
  onCreate,
}) {
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(items.length / GALLERY_ITEMS_PER_PAGE));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const paginatedItems = useMemo(() => {
    const startIndex = (safeCurrentPage - 1) * GALLERY_ITEMS_PER_PAGE;

    return items.slice(startIndex, startIndex + GALLERY_ITEMS_PER_PAGE);
  }, [safeCurrentPage, items]);

  return (
    <section className="mt-16">
      <div className="mb-6 flex flex-col gap-3 border-b border-[#f6c744] pb-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-400">
            Event Gallery
          </h2>
          <p className="mt-2 text-xs text-neutral-500">
            Share your experiences with the event through photos and short captions.
          </p>
        </div>
        {isAuthenticated ? (
          <button
            type="button"
            onClick={onCreate}
            className="w-fit bg-[#f6c744] px-5 py-2.5 text-[9px] font-black uppercase tracking-widest text-black transition-colors hover:bg-[#e3b832]"
          >
            Create
          </button>
        ) : (
          <p className="text-[10px] font-semibold text-neutral-400">
            Sign in to add a photo.
          </p>
        )}
      </div>

      {error && (
        <div className="mb-4 border border-red-100 bg-red-50 p-4 text-xs text-red-600">
          {error}
        </div>
      )}

      {loading && (
        <div className="columns-1 gap-4 sm:columns-2 xl:columns-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div
              key={index}
              className="mb-4 break-inside-avoid bg-neutral-200"
              style={{ height: index % 2 === 0 ? 180 : 250 }}
            />
          ))}
        </div>
      )}

      {!loading && items.length === 0 && (
        <div className="columns-1 gap-4 sm:columns-2 xl:columns-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div
              key={index}
              className="mb-4 break-inside-avoid bg-neutral-200"
              style={{ height: index % 3 === 0 ? 170 : index % 3 === 1 ? 230 : 200 }}
            />
          ))}
        </div>
      )}

      {!loading && items.length > 0 && (
        <>
          <div className="columns-1 gap-4 sm:columns-2 xl:columns-3">
            {paginatedItems.map((item) => (
              <button
                key={item._id || `${item.title}-${item.createdAt}`}
                type="button"
                onClick={() => setSelectedPhoto(item)}
                className="group relative mb-4 block w-full break-inside-avoid overflow-hidden border border-neutral-100 bg-neutral-100 text-left shadow-sm"
              >
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-full transition-transform duration-500 group-hover:scale-105"
                />
                <div className="pointer-events-none absolute inset-x-0 bottom-0 translate-y-3 bg-gradient-to-t from-black/85 via-black/55 to-transparent p-4 pt-12 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                  <p className="text-[8px] font-black uppercase tracking-widest text-[#f6c744]">
                    {item.submittedByName || "UST user"}
                  </p>
                  <h3 className="mt-1 text-sm font-bold leading-snug text-white">
                    {item.title}
                  </h3>
                  {item.description && (
                    <p className="mt-1 line-clamp-2 text-[11px] leading-4 text-white/75">
                      {item.description}
                    </p>
                  )}
                </div>
              </button>
            ))}
          </div>

          {items.length > GALLERY_ITEMS_PER_PAGE && (
            <div className="mt-6 border-t border-neutral-100 pt-5">
              <Pagination
                currentPage={safeCurrentPage}
                totalPages={totalPages}
                onPageChange={(page) =>
                  setCurrentPage(Math.min(Math.max(page, 1), totalPages))
                }
              />
            </div>
          )}
        </>
      )}

      {selectedPhoto && (
        <ImageViewer
          item={{
            image: selectedPhoto.image,
            title: selectedPhoto.title || "Gallery photo",
            label: "Event Gallery",
            description: selectedPhoto.description,
            submittedByName: selectedPhoto.submittedByName,
          }}
          onClose={() => setSelectedPhoto(null)}
        />
      )}
    </section>
  );
}

function ImageViewer({ item, onClose }) {
  const [zoom, setZoom] = useState(1);

  const zoomOut = () => setZoom((current) => Math.max(0.5, current - 0.2));
  const zoomIn = () => setZoom((current) => Math.min(3, current + 0.2));
  const resetZoom = () => setZoom(1);

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/90 px-3 py-4 sm:px-5">
      <button
        type="button"
        onClick={onClose}
        className="absolute inset-0 cursor-default"
        aria-label="Close gallery viewer"
      />

      <div className="relative z-10 flex max-h-[94vh] w-full max-w-7xl flex-col overflow-hidden border border-white/10 bg-[#0f0f0f] shadow-2xl">
        <div className="flex flex-col gap-3 border-b border-white/10 bg-[#111] px-4 py-4 text-white sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div className="min-w-0">
            <p className="text-[9px] font-black uppercase tracking-[0.25em] text-[#f6c744]">
              {item.label || "Image Viewer"}
            </p>
            <h2 className="mt-1 truncate font-playfair text-xl font-bold">
              {item.title || "Gallery photo"}
            </h2>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={zoomOut}
              className="grid h-10 w-10 place-items-center border border-white/15 text-lg font-black text-white transition-colors hover:border-[#f6c744] hover:text-[#f6c744]"
              aria-label="Zoom out"
            >
              -
            </button>
            <button
              type="button"
              onClick={resetZoom}
              className="h-10 min-w-20 border border-white/15 px-3 text-[10px] font-black uppercase tracking-widest text-white transition-colors hover:border-[#f6c744] hover:text-[#f6c744]"
              aria-label="Reset zoom"
            >
              {Math.round(zoom * 100)}%
            </button>
            <button
              type="button"
              onClick={zoomIn}
              className="grid h-10 w-10 place-items-center border border-white/15 text-lg font-black text-white transition-colors hover:border-[#f6c744] hover:text-[#f6c744]"
              aria-label="Zoom in"
            >
              +
            </button>
            <button
              type="button"
              onClick={onClose}
              className="h-10 bg-[#f6c744] px-5 text-[10px] font-black uppercase tracking-widest text-black transition-colors hover:bg-[#e3b832]"
            >
              Close
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-auto bg-black">
          <div
            className="grid min-h-[62vh] place-items-center p-4 sm:p-6"
            style={{ minWidth: zoom > 1 ? `${zoom * 100}%` : "100%" }}
          >
            <img
              src={item.image}
              alt={item.title || "Gallery photo"}
              className="max-h-[74vh] max-w-full select-none object-contain transition-transform duration-200"
              style={{ transform: `scale(${zoom})` }}
              draggable="false"
            />
          </div>
        </div>

        {(item.description || item.submittedByName) && (
          <div className="border-t border-white/10 bg-[#111] px-5 py-4 text-white">
            <p className="text-[9px] font-black uppercase tracking-widest text-[#f6c744]">
              {item.submittedByName || item.label || "Details"}
            </p>
            {item.description && (
              <p className="mt-2 line-clamp-3 text-sm leading-6 text-white/75">
                {item.description}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function GalleryCreateModal({ eventTitle, onClose, onSubmit }) {
  const [form, setForm] = useState({ title: "", description: "", images: [] });
  const [error, setError] = useState("");
  const [isProcessingImage, setIsProcessingImage] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function updateField(field, value) {
    setForm((currentForm) => ({ ...currentForm, [field]: value }));
    setError("");
  }

  async function handleImageChange(fileList) {
    const files = Array.from(fileList || []);

    if (files.length === 0) return;

    if (form.images.length + files.length > 5) {
      setError("You can submit up to 5 photos at a time.");
      return;
    }

    if (files.some((file) => !file.type.startsWith("image/"))) {
      setError("Please choose image files only.");
      return;
    }

    setIsProcessingImage(true);
    setError("");

    try {
      const images = [];

      for (const file of files) {
        const image = await compressGalleryImage(file, {
          maxBytes: 2 * 1024 * 1024,
          maxWidth: 1280,
        });
        images.push(image);
      }

      setForm((currentForm) => ({
        ...currentForm,
        images: [...currentForm.images, ...images].slice(0, 5),
      }));
    } catch (imageError) {
      setError(imageError.message || "One of the images could not be processed.");
    } finally {
      setIsProcessingImage(false);
    }
  }

  function removeImage(index) {
    setForm((currentForm) => ({
      ...currentForm,
      images: currentForm.images.filter((_, imageIndex) => imageIndex !== index),
    }));
    setError("");
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (!form.title.trim()) {
      setError("Photo title is required.");
      return;
    }

    if (form.images.length === 0) {
      setError("Please upload at least one gallery image.");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      await onSubmit({
        title: form.title.trim(),
        description: form.description.trim(),
        images: form.images,
      });
      onClose();
    } catch (submitError) {
      setError(submitError.message || "Failed to submit gallery photo.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 py-8">
      <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto bg-white shadow-2xl">
        <div className="border-b border-neutral-100 bg-black px-6 py-5 text-white">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-[9px] font-black uppercase tracking-[0.3em] text-[#f6c744]">
                Event Gallery
              </p>
              <h2 className="mt-2 font-playfair text-2xl font-bold leading-tight">
                Add a photo
              </h2>
              <p className="mt-1 text-xs text-white/60 line-clamp-1">{eventTitle}</p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="text-[10px] font-black uppercase tracking-widest text-white/70 transition-colors hover:text-[#f6c744]"
            >
              Close
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="grid gap-6 p-6 lg:grid-cols-[1fr_340px]">
          <div className="space-y-4">
            <GalleryField
              label="Title"
              value={form.title}
              onChange={(value) => updateField("title", value)}
              placeholder="Photo title"
              maxLength={100}
              required
            />
            <GalleryTextArea
              label="Description"
              value={form.description}
              onChange={(value) => updateField("description", value)}
              placeholder="Short caption"
              maxLength={100}
            />

            {error && (
              <div className="border border-red-100 bg-red-50 px-4 py-3 text-xs font-semibold text-red-600">
                {error}
              </div>
            )}
          </div>

          <div>
            <div className="flex items-center justify-between gap-3">
              <p className="text-[10px] font-black uppercase tracking-widest text-neutral-400">
                Images
              </p>
              <span className="text-[10px] font-bold text-neutral-400">
                {form.images.length}/5
              </span>
            </div>

            {form.images.length > 0 ? (
              <div className="mt-2 grid grid-cols-2 gap-2">
                {form.images.map((image, index) => (
                  <div
                    key={`${image.slice(0, 32)}-${index}`}
                    className="relative overflow-hidden border border-neutral-200 bg-neutral-100"
                  >
                    <img
                      src={image}
                      alt={`Gallery preview ${index + 1}`}
                      className="aspect-square h-full w-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute right-1.5 top-1.5 bg-black/80 px-2 py-1 text-[8px] font-black uppercase tracking-wider text-white transition-colors hover:bg-red-600"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="mt-2 grid aspect-[4/3] place-items-center border border-dashed border-neutral-200 bg-neutral-50 px-6 text-center text-xs font-semibold text-neutral-400">
                Choose up to 5 event photos.
              </div>
            )}

            {form.images.length < 5 && (
              <label className="mt-3 block cursor-pointer bg-black px-4 py-3 text-center text-[10px] font-black uppercase tracking-widest text-white transition-colors hover:bg-[#f6c744] hover:text-black">
                {isProcessingImage ? "Processing..." : "Choose images"}
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  disabled={isProcessingImage || isSubmitting}
                  onChange={(event) => {
                    handleImageChange(event.target.files);
                    event.target.value = "";
                  }}
                  className="hidden"
                />
              </label>
            )}

            {form.images.length > 0 && (
              <button
                type="button"
                onClick={() => updateField("images", [])}
                className="mt-2 w-full border border-neutral-200 px-4 py-2 text-[9px] font-black uppercase tracking-widest text-neutral-500 transition-colors hover:border-red-200 hover:text-red-600"
              >
                Remove all images
              </button>
            )}

            <p className="mt-3 text-[10px] leading-5 text-neutral-400">
              Each photo will pass Vision AI first, then appear in admin photo
              approvals as a separate review item.
            </p>
          </div>

          <div className="flex flex-col-reverse gap-2 border-t border-neutral-100 pt-5 sm:flex-row sm:justify-end lg:col-span-2">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-3 text-[10px] font-black uppercase tracking-widest text-neutral-500 transition-colors hover:text-black"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || isProcessingImage}
              className="bg-[#f6c744] px-6 py-3 text-[10px] font-black uppercase tracking-widest text-black transition-colors hover:bg-[#e3b832] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting
                ? "Submitting..."
                : `Submit ${form.images.length || ""} photo${form.images.length === 1 ? "" : "s"}`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function GalleryField({
  label,
  value,
  onChange,
  placeholder,
  maxLength,
  required = false,
}) {
  return (
    <label className="block">
      <div className="flex items-center justify-between gap-3">
        <span className="text-[10px] font-black uppercase tracking-widest text-neutral-400">
          {label} {required && <span className="text-[#c49600]">*</span>}
        </span>
        <span className="text-[10px] font-semibold text-neutral-400">
          {value.length}/{maxLength}
        </span>
      </div>
      <input
        value={value}
        maxLength={maxLength}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="mt-2 h-12 w-full border border-neutral-200 bg-white px-4 text-sm text-neutral-900 outline-none transition-colors placeholder:text-neutral-300 focus:border-[#f6c744] focus:ring-2 focus:ring-yellow-100"
      />
    </label>
  );
}

function GalleryTextArea({ label, value, onChange, placeholder, maxLength }) {
  return (
    <label className="block">
      <div className="flex items-center justify-between gap-3">
        <span className="text-[10px] font-black uppercase tracking-widest text-neutral-400">
          {label}
        </span>
        <span className="text-[10px] font-semibold text-neutral-400">
          {value.length}/{maxLength}
        </span>
      </div>
      <textarea
        value={value}
        maxLength={maxLength}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        rows={4}
        className="mt-2 w-full resize-y border border-neutral-200 bg-white px-4 py-3 text-sm text-neutral-900 outline-none transition-colors placeholder:text-neutral-300 focus:border-[#f6c744] focus:ring-2 focus:ring-yellow-100"
      />
    </label>
  );
}

function FeaturedHero({ event, onView }) {
  return (
    <section className="relative isolate min-h-[500px] overflow-hidden bg-black text-white sm:min-h-[540px] lg:min-h-[580px]">
      <img
        src={getItemImage(event)}
        alt={event.title}
        className="absolute inset-0 h-full w-full object-cover opacity-80"
      />
      <div className="absolute inset-0 bg-black/55" />
      <div className="relative z-10 flex min-h-[500px] max-w-3xl flex-col justify-center px-4 py-12 sm:min-h-[540px] sm:px-8 lg:min-h-[580px] lg:px-12">
        <p className="mb-3 font-inter text-[8px] font-black uppercase tracking-[0.4em] text-[#f6c744] sm:text-[9px]">
          Featured Event
        </p>
        <h1 className="font-playfair text-4xl font-bold leading-[1.05] text-white sm:text-5xl lg:text-6xl">
          {event.title}
        </h1>
        <div className="mt-5 flex flex-wrap gap-x-6 gap-y-2 font-inter text-[11px] font-medium text-white/85 sm:text-xs">
          <span>{event.location || event.venue || "Venue TBA"}</span>
          <span>{formatDateRange(event)}</span>
          <span>{formatTimeRange(event)}</span>
        </div>
        <button
          onClick={onView}
          className="mt-8 w-fit bg-[#f6c744] px-10 py-3 font-inter text-[10px] font-black text-black transition-colors hover:bg-[#e3b832]"
        >
          View
        </button>
      </div>
    </section>
  );
}

function ProgramSchedule({ schedule }) {
  const [openDay, setOpenDay] = useState(0);

  return (
    <section className="mt-12">
      <div className="mb-5 border-b border-neutral-100 pb-3">
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-400">
          Program Schedule
        </p>
        <h2 className="mt-2 font-playfair text-2xl font-bold text-neutral-950">
          Day-by-day activities
        </h2>
      </div>

      <div className="space-y-3">
        {schedule.map((item, index) => {
          const isOpen = openDay === index;
          const title = item.activity || item.title || "Activity details";
          const day = item.day || `Day ${index + 1}`;
          const date = formatScheduleDate(item.date);
          const time = formatScheduleTime(item);

          return (
            <article
              key={`${day}-${index}`}
              className="overflow-hidden border border-neutral-100 bg-white shadow-sm"
            >
              <button
                type="button"
                onClick={() => setOpenDay(isOpen ? -1 : index)}
                className="flex w-full items-center justify-between gap-5 bg-[#fffdf5] px-5 py-4 text-left transition-colors hover:bg-[#fff8df]"
              >
                <span className="grid min-w-0 gap-1 sm:grid-cols-[90px_1fr] sm:items-center sm:gap-5">
                  <span className="text-[11px] font-black uppercase tracking-[0.18em] text-[#c49600]">
                    {day}
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-bold text-neutral-950">
                      {title}
                    </span>
                    <span className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-[10px] font-semibold uppercase tracking-wider text-neutral-400">
                      {date && <span>{date}</span>}
                      {time && <span>{time}</span>}
                      {item.image && <span>Image included</span>}
                    </span>
                  </span>
                </span>
                <span
                  className={`shrink-0 text-lg font-bold text-[#c49600] transition-transform ${
                    isOpen ? "rotate-45" : ""
                  }`}
                  aria-hidden="true"
                >
                  +
                </span>
              </button>

              {isOpen && (
                <div className="grid gap-5 border-t border-neutral-100 p-5 lg:grid-cols-[280px_1fr]">
                  {item.image ? (
                    <img
                      src={item.image}
                      alt={`${day} ${title}`}
                      className="aspect-video w-full border border-neutral-100 bg-neutral-100 object-cover lg:aspect-[4/3]"
                    />
                  ) : (
                    <div className="grid aspect-video place-items-center border border-dashed border-neutral-200 bg-neutral-50 px-6 text-center text-[10px] font-bold uppercase tracking-widest text-neutral-300 lg:aspect-[4/3]">
                      No image added
                    </div>
                  )}

                  <div className="space-y-4">
                    <div className="grid gap-3 sm:grid-cols-3">
                      <ScheduleMeta label="Day" value={day} />
                      <ScheduleMeta label="Date" value={date || "Date TBA"} />
                      <ScheduleMeta label="Time" value={time || "Time TBA"} />
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-[0.18em] text-neutral-400">
                        Activity
                      </p>
                      <h3 className="mt-1 font-playfair text-xl font-bold text-neutral-950">
                        {title}
                      </h3>
                      <p className="mt-3 text-sm leading-7 text-neutral-600">
                        {item.description || "No additional details were provided."}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </article>
          );
        })}
      </div>
    </section>
  );
}

function ScheduleMeta({ label, value }) {
  return (
    <div className="border border-neutral-100 bg-neutral-50 px-4 py-3">
      <p className="text-[9px] font-black uppercase tracking-[0.18em] text-neutral-400">
        {label}
      </p>
      <p className="mt-1 text-xs font-bold text-neutral-900">{value}</p>
    </div>
  );
}

function formatScheduleDate(value) {
  if (!value) return "";

  const parsed = new Date(value);
  if (Number.isNaN(parsed.valueOf())) return value;

  return parsed.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatScheduleTime(item) {
  if (item.startTime && item.endTime) return `${item.startTime} - ${item.endTime}`;
  return item.startTime || item.endTime || "";
}

function compressGalleryImage(file, { maxBytes, maxWidth }) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onerror = () => reject(new Error("Image could not be read."));
    reader.onload = () => {
      const image = new Image();

      image.onerror = () => reject(new Error("Image could not be loaded."));
      image.onload = () => {
        const scale = Math.min(1, maxWidth / image.width);
        const canvas = document.createElement("canvas");
        canvas.width = Math.max(1, Math.round(image.width * scale));
        canvas.height = Math.max(1, Math.round(image.height * scale));

        const context = canvas.getContext("2d");
        context.drawImage(image, 0, 0, canvas.width, canvas.height);

        const outputType = supportsGalleryWebP() ? "image/webp" : "image/jpeg";
        let quality = 0.82;
        let dataUrl = canvas.toDataURL(outputType, quality);

        while (dataUrl.length > maxBytes && quality > 0.45) {
          quality -= 0.08;
          dataUrl = canvas.toDataURL(outputType, quality);
        }

        if (dataUrl.length > maxBytes) {
          reject(
            new Error(
              "Image is still too large after compression. Please choose a smaller image."
            )
          );
          return;
        }

        resolve(dataUrl);
      };

      image.src = reader.result;
    };

    reader.readAsDataURL(file);
  });
}

function supportsGalleryWebP() {
  const canvas = document.createElement("canvas");
  canvas.width = 1;
  canvas.height = 1;

  return canvas.toDataURL("image/webp").startsWith("data:image/webp");
}
