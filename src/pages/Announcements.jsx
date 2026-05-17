import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import HomeLayout from "../components/MainLayout";
import Pagination from "../components/Pagination";
import FilterDropdown from "../components/adminComponents/FilterDropdown";
import { getAnnouncements, getEvents } from "../services/api";
import {
  formatDisplayDate,
  getAnnouncementBody,
  getItemImage,
  getPublishedItems,
  matchesSearch,
} from "../utils/contentFormatters";

const ITEMS_PER_PAGE = 12;

export default function Announcements() {
  const location = useLocation();
  const topRef = useRef(null);
  const [announcements, setAnnouncements] = useState([]);
  const [events, setEvents] = useState([]);
  const [displayItem, setDisplayItem] = useState(
    location.state?.featuredAnnouncement || null
  );
  const [selectedAnnouncement, setSelectedAnnouncement] = useState(
    location.state?.selectedAnnouncement || null
  );
  const [activeCategory, setActiveCategory] = useState("All");
  const [activeType, setActiveType] = useState("All");
  const [eventFilter, setEventFilter] = useState("all");
  const [sortBy, setSortBy] = useState("date-desc");
  const [searchInput, setSearchInput] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const searchQuery = new URLSearchParams(location.search).get("search") || "";

  useEffect(() => {
    setSearchInput(searchQuery);
  }, [searchQuery]);

  useEffect(() => {
    let ignore = false;

    async function loadAnnouncements() {
      try {
        const [announcementData, eventData] = await Promise.all([
          getAnnouncements(),
          getEvents(),
        ]);
        const publishedAnnouncements = getPublishedItems(
          Array.isArray(announcementData)
            ? announcementData
            : announcementData.announcements || []
        ).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        const publishedEvents = getPublishedItems(
          Array.isArray(eventData) ? eventData : eventData.events || []
        );

        if (!ignore) {
          setAnnouncements(publishedAnnouncements);
          setEvents(publishedEvents);
          setDisplayItem((current) => {
            if (current) return current;

            return (
              publishedAnnouncements.find((item) => item.isAdminFeatured) ||
              publishedAnnouncements[0] ||
              null
            );
          });
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

  useEffect(() => {
    const featuredAnnouncement = location.state?.featuredAnnouncement;
    const nextSelectedAnnouncement = location.state?.selectedAnnouncement;

    if (nextSelectedAnnouncement) {
      setSelectedAnnouncement(nextSelectedAnnouncement);
      window.requestAnimationFrame(() => {
        topRef.current?.scrollIntoView({ behavior: "smooth" });
      });
      return;
    }

    if (featuredAnnouncement) {
      setDisplayItem(featuredAnnouncement);
      window.requestAnimationFrame(() => {
        topRef.current?.scrollIntoView({ behavior: "smooth" });
      });
    }
  }, [location.state]);

  const featuredAnnouncement = useMemo(() => {
    return (
      announcements.find((item) => item.isAdminFeatured) ||
      announcements[0] ||
      null
    );
  }, [announcements]);

  const visibleAnnouncements = useMemo(() => {
    let result = [...announcements];
    const searchTerm = searchInput.trim();

    if (activeCategory !== "All") {
      result = result.filter((item) => (item.category || "Uncategorized") === activeCategory);
    }

    if (activeType !== "All") {
      result = result.filter((item) => (item.type || "General") === activeType);
    }

    if (eventFilter === "tagged") {
      result = result.filter((item) => Boolean(item.eventTitle));
    }

    if (eventFilter === "not-tagged") {
      result = result.filter((item) => !item.eventTitle);
    }

    if (searchTerm) {
      result = result.filter((item) =>
        matchesSearch(item, searchTerm, [
          "title",
          "category",
          "type",
          "eventTitle",
          "content",
          "caption",
          "createdBy",
        ])
      );
    }

    result.sort((a, b) => {
      const titleA = a.title?.toLowerCase() || "";
      const titleB = b.title?.toLowerCase() || "";
      const dateA = new Date(a.createdAt || a.updatedAt);
      const dateB = new Date(b.createdAt || b.updatedAt);

      if (sortBy === "az") return titleA.localeCompare(titleB);
      if (sortBy === "za") return titleB.localeCompare(titleA);
      if (sortBy === "date-asc") return dateA - dateB;
      return dateB - dateA;
    });

    return result;
  }, [activeCategory, activeType, announcements, eventFilter, searchInput, sortBy]);

  const totalAnnouncementPages = Math.ceil(
    visibleAnnouncements.length / ITEMS_PER_PAGE
  );
  const paginatedAnnouncements = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;

    return visibleAnnouncements.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [currentPage, visibleAnnouncements]);

  useEffect(() => {
    setCurrentPage(1);
  }, [activeCategory, activeType, eventFilter, searchInput, sortBy]);

  useEffect(() => {
    if (totalAnnouncementPages > 0 && currentPage > totalAnnouncementPages) {
      setCurrentPage(totalAnnouncementPages);
    }
  }, [currentPage, totalAnnouncementPages]);

  function handlePageChange(page) {
    setCurrentPage(Math.min(Math.max(page, 1), totalAnnouncementPages));
  }

  const categories = useMemo(() => {
    return [
      "All",
      ...Array.from(
        new Set(announcements.map((item) => item.category || "Uncategorized"))
      ).sort((a, b) => a.localeCompare(b)),
    ];
  }, [announcements]);

  const types = useMemo(() => {
    return [
      "All",
      ...Array.from(
        new Set(announcements.map((item) => item.type || "General"))
      ).sort((a, b) => a.localeCompare(b)),
    ];
  }, [announcements]);

  const handleView = (announcement) => {
    setSelectedAnnouncement(announcement);
    topRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleCardKeyDown = (event, announcement) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      handleView(announcement);
    }
  };

  const getTaggedEventLink = (eventTitle) => {
    const taggedEvent = events.find(
      (event) => event.title?.trim().toLowerCase() === eventTitle?.trim().toLowerCase()
    );

    if (taggedEvent) {
      return {
        state: {
          selectedEvent: taggedEvent,
          primeEventsBack: true,
        },
        to: `/events/${taggedEvent._id}`,
      };
    }

    return {
      state: undefined,
      to: `/events?search=${encodeURIComponent(eventTitle || "")}`,
    };
  };

  const resetToFeatured = () => {
    setDisplayItem(featuredAnnouncement);
    topRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const searchTerm = searchInput.trim();

  const isViewingSpecific =
    displayItem && featuredAnnouncement
      ? displayItem._id !== featuredAnnouncement._id
      : false;

  if (selectedAnnouncement) {
    const relatedAnnouncements = announcements
      .filter((item) => item._id !== selectedAnnouncement._id)
      .slice(0, 3);

    return (
      <div className="min-h-screen bg-white text-black font-inter">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <button
            onClick={() => setSelectedAnnouncement(null)}
            className="mb-6 flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-[#c49600] transition-colors hover:text-black"
          >
            Go back
          </button>

          <div className="grid grid-cols-1 gap-12 lg:grid-cols-[1fr_300px]">
            <section>
              <div className="mb-8">
                <div className="mb-4 flex flex-wrap gap-2">
                  <span className="bg-neutral-100 px-2 py-1 text-[9px] font-black uppercase tracking-widest text-neutral-500">
                    {selectedAnnouncement.type || "Announcement"}
                  </span>
                  <span className="bg-[#fff8df] px-2 py-1 text-[9px] font-black uppercase tracking-widest text-[#9b7200]">
                    {selectedAnnouncement.category || "Uncategorized"}
                  </span>
                  {selectedAnnouncement.isAdminFeatured && (
                    <span className="bg-black px-2 py-1 text-[9px] font-black uppercase tracking-widest text-[#f6c744]">
                      Pinned
                    </span>
                  )}
                </div>
                <h1 className="font-playfair text-3xl font-bold leading-tight text-neutral-900 sm:text-4xl">
                  {selectedAnnouncement.title}
                </h1>
                <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-xs font-medium text-neutral-500">
                  <span>Published {formatDisplayDate(selectedAnnouncement.createdAt)}</span>
                  <span>Updated {formatDisplayDate(selectedAnnouncement.updatedAt)}</span>
                  {selectedAnnouncement.eventTitle && (
                    <TaggedEventLink
                      eventTitle={selectedAnnouncement.eventTitle}
                      getTaggedEventLink={getTaggedEventLink}
                      className="text-[#9b7200] underline-offset-4 hover:underline"
                    />
                  )}
                </div>
              </div>

              <div className="mb-12">
                <h2 className="mb-4 border-b border-neutral-100 pb-2 text-[10px] font-black uppercase tracking-[0.2em] text-neutral-400">
                  Announcement Details
                </h2>
                <p className="whitespace-pre-line text-justify text-[14px] leading-7 text-neutral-700">
                  {getAnnouncementBody(selectedAnnouncement)}
                </p>
              </div>

              <div className="mt-12">
                <h2 className="mb-6 border-b border-[#f6c744] pb-2 text-[10px] font-black uppercase tracking-[0.2em] text-neutral-400">
                  Announcement Preview
                </h2>
                <img
                  src={getItemImage(selectedAnnouncement)}
                  alt={selectedAnnouncement.title}
                  className="aspect-video w-full max-w-3xl border border-neutral-200 object-cover"
                />
              </div>
            </section>

            <aside className="space-y-10">
              {selectedAnnouncement.eventTitle && (
                <div>
                  <h2 className="mb-4 border-b border-neutral-100 pb-2 text-[10px] font-black uppercase tracking-widest text-neutral-400">
                    Tagged Event
                  </h2>
                  <TaggedEventLink
                    eventTitle={selectedAnnouncement.eventTitle}
                    getTaggedEventLink={getTaggedEventLink}
                    className="block border border-neutral-100 border-t-[3px] border-t-[#f6c744] bg-white p-4 text-left shadow-sm transition-colors hover:border-[#f6c744] hover:bg-[#fffdf5]"
                  >
                    <div className="mb-2 flex flex-wrap gap-1.5">
                      <span className="bg-[#fff8df] px-2 py-1 text-[7px] font-black uppercase tracking-widest text-[#9b7200]">
                        Event
                      </span>
                    </div>
                    <p className="text-[12px] font-semibold leading-snug text-neutral-900">
                      {selectedAnnouncement.eventTitle}
                    </p>
                    <p className="mt-3 text-[8px] font-black uppercase tracking-widest text-[#9b7200]">
                      View event
                    </p>
                  </TaggedEventLink>
                </div>
              )}

              {relatedAnnouncements.length > 0 && (
                <div>
                  <h2 className="mb-4 border-b border-neutral-100 pb-2 text-[10px] font-black uppercase tracking-widest text-neutral-400">
                    Related Announcements
                  </h2>
                  <div className="grid gap-3">
                    {relatedAnnouncements.map((item) => (
                      <button
                        key={item._id || item.title}
                        onClick={() => setSelectedAnnouncement(item)}
                        className="border border-neutral-100 border-t-[3px] border-t-[#f6c744] bg-white p-4 text-left shadow-sm transition-colors hover:border-[#f6c744] hover:bg-[#fffdf5]"
                      >
                        <div className="mb-2 flex flex-wrap gap-1.5">
                          <span className="bg-neutral-100 px-2 py-1 text-[7px] font-black uppercase tracking-widest text-neutral-500">
                            {item.type || "Announcement"}
                          </span>
                          <span className="bg-[#fff8df] px-2 py-1 text-[7px] font-black uppercase tracking-widest text-[#9b7200]">
                            {item.category || "Uncategorized"}
                          </span>
                        </div>
                        <p className="text-[12px] font-bold leading-snug text-neutral-900 line-clamp-2">
                          {item.title}
                        </p>
                        <p className="mt-2 line-clamp-2 text-[11px] leading-5 text-neutral-500">
                          {getAnnouncementBody(item)}
                        </p>
                        {item.eventTitle && (
                          <p className="mt-2 truncate text-[9px] text-[#9b7200]">
                            Event: {item.eventTitle}
                          </p>
                        )}
                        <p className="mt-2 text-[8px] font-semibold uppercase tracking-wider text-neutral-400">
                          {formatDisplayDate(item.createdAt)}
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
      <HomeLayout>
        <div ref={topRef} className="px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
          {loading && (
            <div className="max-w-6xl">
              <div className="h-8 w-56 animate-pulse bg-neutral-200" />
              <div className="mt-8 h-64 animate-pulse bg-neutral-100" />
            </div>
          )}

          {!loading && !displayItem && (
            <div className="max-w-6xl border border-dashed border-neutral-200 p-8 text-sm text-neutral-500">
              No published announcements are available yet.
            </div>
          )}

          {!loading && displayItem && (
            <>
              <article className="max-w-6xl animate-in fade-in slide-in-from-bottom-4 duration-700">
                <div className="mb-6 flex items-center justify-between">
                  <div className="flex-1">
                    <span
                      className={`text-[11px] font-bold uppercase tracking-[0.2em] ${
                        isViewingSpecific ? "text-[#c49600]" : "text-neutral-800"
                      }`}
                    >
                      {isViewingSpecific
                        ? "Currently Viewing"
                        : searchTerm
                          ? "Search Result"
                        : "Featured Announcement"}
                    </span>
                    <div className="mt-2 h-[1px] w-full bg-[#f6c744]" />
                  </div>

                  {isViewingSpecific && (
                    <button
                      onClick={resetToFeatured}
                      className="ml-6 shrink-0 text-[10px] font-black uppercase tracking-widest text-neutral-400 transition-colors hover:text-black"
                    >
                      Back to Featured
                    </button>
                  )}
                </div>

                {searchTerm && (
                  <p className="mb-6 text-xs font-semibold text-neutral-500">
                    Showing announcements matching &quot;{searchTerm}&quot;.
                  </p>
                )}

                <h1 className="font-playfair text-2xl lg:text-[34px] font-black leading-tight text-neutral-900">
                  {displayItem.title}
                </h1>

                <div className="mt-4 flex flex-wrap items-center gap-2 text-[11px] font-medium text-neutral-500">
                  <span className="font-bold uppercase tracking-widest text-[#c49600]">
                    {displayItem.type || "Announcement"}
                  </span>
                  <span className="text-neutral-300">|</span>
                  <span>{displayItem.category || "Uncategorized"}</span>
                  {displayItem.eventTitle && (
                    <>
                      <span className="text-neutral-300">|</span>
                      <span>Event: {displayItem.eventTitle}</span>
                    </>
                  )}
                  <span className="text-neutral-300">|</span>
                  <span>Published {formatDisplayDate(displayItem.createdAt)}</span>
                </div>

                <div className="mt-10 flex flex-col gap-10 lg:flex-row">
                  <div className="flex-1 text-[15px] leading-relaxed text-neutral-800 text-justify">
                    {getAnnouncementBody(displayItem)}
                    <button
                      onClick={() => handleView(displayItem)}
                      className="mt-8 block bg-[#f6c744] px-10 py-3 text-[10px] font-black uppercase tracking-widest text-black transition-colors hover:bg-[#e3b832]"
                    >
                      Read full announcement
                    </button>
                  </div>
                  <div className="w-full lg:w-[420px] shrink-0 border border-neutral-200 p-0.5">
                    <img
                      src={getItemImage(displayItem)}
                      alt={displayItem.title}
                      className="w-full h-auto"
                    />
                  </div>
                </div>
              </article>

              <section className="mt-16 max-w-7xl">
                <div className="mb-6 flex flex-col justify-between gap-2 md:flex-row md:items-end">
                  <div>
                    <h2 className="font-playfair text-3xl font-bold text-neutral-900">
                      {searchTerm ? `Search results for "${searchTerm}"` : "Announcements"}
                    </h2>
                    <p className="mt-1 text-sm text-neutral-500">
                      Browse published campus announcements and advisories.
                    </p>
                  </div>
                  {searchQuery && (
                    <Link
                      to="/announcements"
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
                      placeholder="Search announcements..."
                      className="h-full w-full bg-transparent text-xs text-gray-900 outline-none placeholder:text-gray-400 sm:text-sm"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2 sm:w-auto sm:min-w-[640px] lg:grid-cols-4">
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
                      label="Type"
                      value={activeType}
                      onChange={setActiveType}
                      options={types.map((type) => ({
                        label: type,
                        value: type,
                      }))}
                    />
                    <FilterDropdown
                      label="Event Tag"
                      value={eventFilter}
                      onChange={setEventFilter}
                      options={[
                        { label: "All", value: "all" },
                        { label: "Tagged with event", value: "tagged" },
                        { label: "Not tagged", value: "not-tagged" },
                      ]}
                    />
                    <FilterDropdown
                      label="Sort"
                      value={sortBy}
                      onChange={setSortBy}
                      options={[
                        { label: "Newest first", value: "date-desc" },
                        { label: "Oldest first", value: "date-asc" },
                        { label: "A-Z", value: "az" },
                        { label: "Z-A", value: "za" },
                      ]}
                    />
                  </div>
                </div>

                {visibleAnnouncements.length === 0 && (
                  <div className="border border-dashed border-neutral-200 bg-white p-8 text-sm text-neutral-500">
                    No announcements matched your search or filters.
                  </div>
                )}

                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {paginatedAnnouncements.map((item) => (
                    <article
                      key={item._id}
                      role="button"
                      tabIndex={0}
                      onClick={() => handleView(item)}
                      onKeyDown={(event) => handleCardKeyDown(event, item)}
                      className={`flex min-h-[310px] flex-col border border-t-[3px] bg-white p-5 shadow-sm transition-all ${
                        displayItem._id === item._id
                          ? "border-[#f6c744] border-t-[#f6c744] ring-1 ring-[#f6c744]"
                          : "border-neutral-100 border-t-[#f6c744] hover:border-[#f6c744]"
                      }`}
                    >
                      <div className="mb-3 flex flex-wrap gap-2">
                        <span className="bg-neutral-100 px-2 py-1 text-[8px] font-black uppercase tracking-widest text-neutral-500">
                          {item.type || "Announcement"}
                        </span>
                        <span className="bg-[#fff8df] px-2 py-1 text-[8px] font-black uppercase tracking-widest text-[#9b7200]">
                          {item.category || "Uncategorized"}
                        </span>
                      </div>
                      <h3 className="font-playfair text-[17px] font-bold leading-tight text-neutral-900 line-clamp-2">
                        {item.title}
                      </h3>
                      <p className="mt-3 min-h-12 text-sm leading-6 text-neutral-600 line-clamp-2">
                        {getAnnouncementBody(item)}
                      </p>
                      <div className="mt-5 space-y-3 text-[11px] text-neutral-500">
                        {item.eventTitle && (
                          <Link
                            {...getTaggedEventLink(item.eventTitle)}
                            onClick={(event) => event.stopPropagation()}
                            className="block border border-neutral-100 bg-neutral-50 px-3 py-2.5 text-neutral-600 transition-colors hover:border-[#f6c744] hover:bg-[#fffdf5] hover:text-neutral-900"
                          >
                            <span className="block text-[8px] font-black uppercase tracking-widest text-neutral-400">
                              Tagged Event
                            </span>
                            <span className="mt-1 block truncate text-[11px] font-medium">
                              {item.eventTitle}
                            </span>
                          </Link>
                        )}
                        <p className="text-neutral-500">
                          <span className="tracking-widest text-neutral-400">Publish</span>{" "}
                          {formatDisplayDate(item.createdAt)}
                        </p>
                      </div>
                      <button
                        onClick={(event) => {
                          event.stopPropagation();
                          handleView(item);
                        }}
                        className="mt-auto w-full bg-[#f6c744] py-2.5 text-[10px] font-black uppercase tracking-widest text-black transition-colors hover:bg-[#e3b832]"
                      >
                        View
                      </button>
                    </article>
                  ))}
                </div>

                <Pagination
                  currentPage={currentPage}
                  totalPages={totalAnnouncementPages}
                  onPageChange={handlePageChange}
                />
              </section>
            </>
          )}
        </div>
      </HomeLayout>
    </div>
  );
}

function TaggedEventLink({ children, className, eventTitle, getTaggedEventLink }) {
  const linkProps = getTaggedEventLink(eventTitle);

  return (
    <Link {...linkProps} className={className}>
      {children || `Event: ${eventTitle}`}
    </Link>
  );
}
