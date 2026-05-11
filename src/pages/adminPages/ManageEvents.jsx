import { useEffect, useMemo, useState } from "react";
import EventFilters from "../../components/adminComponents/events/EventFilters";
import EventModal from "../../components/adminComponents/events/EventModal";
import EventStats from "../../components/adminComponents/events/EventStats";
import EventsTable from "../../components/adminComponents/events/EventsTable";
import { getEvents, updateEventStatus } from "../../services/api";

const EVENTS_PER_PAGE = 10;

export default function ManageEvents() {
  const [events, setEvents] = useState([]);
  const [activeTab, setActiveTab] = useState("published");
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [venueFilter, setVenueFilter] = useState("all");
  const [sortBy, setSortBy] = useState("az");
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState(null);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const data = await getEvents();
        setEvents(Array.isArray(data) ? data : data.events || []);
      } catch (error) {
        console.error("Failed to fetch events:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  const eventsForActiveTab = useMemo(() => {
    return events.filter((event) => {
      const status = event.status?.toLowerCase();
      return activeTab === "archived"
        ? status === "archived"
        : status !== "archived";
    });
  }, [events, activeTab]);

  const categoryOptions = useMemo(() => {
    return uniqueOptions(eventsForActiveTab, (event) => event.category);
  }, [eventsForActiveTab]);

  const venueOptions = useMemo(() => {
    return uniqueOptions(eventsForActiveTab, (event) => event.location || event.venue);
  }, [eventsForActiveTab]);

  useEffect(() => {
    if (categoryFilter !== "all" && !categoryOptions.includes(categoryFilter)) {
      setCategoryFilter("all");
    }
  }, [categoryFilter, categoryOptions]);

  useEffect(() => {
    if (venueFilter !== "all" && !venueOptions.includes(venueFilter)) {
      setVenueFilter("all");
    }
  }, [venueFilter, venueOptions]);

  const handleToggleArchive = async (event) => {
    const nextStatus =
      event.status?.toLowerCase() === "archived" ? "published" : "archived";
    const updatedEvent = await updateEventStatus(event._id, nextStatus);

    setEvents((current) =>
      current.map((item) =>
        item._id === event._id ? { ...item, ...updatedEvent } : item
      )
    );
  };

  const filteredEvents = useMemo(() => {
    let result = [...eventsForActiveTab];

    if (searchTerm.trim()) {
      const keyword = searchTerm.toLowerCase();
      result = result.filter((event) => {
        const venue = event.location || event.venue || "";
        return (
          event.title?.toLowerCase().includes(keyword) ||
          event.category?.toLowerCase().includes(keyword) ||
          venue.toLowerCase().includes(keyword)
        );
      });
    }

    if (categoryFilter !== "all") {
      result = result.filter((event) => event.category === categoryFilter);
    }

    if (venueFilter !== "all") {
      result = result.filter(
        (event) => (event.location || event.venue) === venueFilter
      );
    }

    result.sort((a, b) => {
      const titleA = a.title?.toLowerCase() || "";
      const titleB = b.title?.toLowerCase() || "";
      const dateA = new Date(a.startDate || a.date || a.createdAt);
      const dateB = new Date(b.startDate || b.date || b.createdAt);

      if (sortBy === "az") return titleA.localeCompare(titleB);
      if (sortBy === "za") return titleB.localeCompare(titleA);
      if (sortBy === "newest") return dateB - dateA;
      if (sortBy === "oldest") return dateA - dateB;
      return 0;
    });

    return result;
  }, [eventsForActiveTab, searchTerm, categoryFilter, venueFilter, sortBy]);

  const totalPages = Math.max(1, Math.ceil(filteredEvents.length / EVENTS_PER_PAGE));

  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, searchTerm, categoryFilter, venueFilter, sortBy]);

  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages);
  }, [currentPage, totalPages]);

  const paginatedEvents = useMemo(() => {
    const start = (currentPage - 1) * EVENTS_PER_PAGE;
    return filteredEvents.slice(start, start + EVENTS_PER_PAGE);
  }, [filteredEvents, currentPage]);

  return (
    <div className="mx-auto max-w-[1800px] space-y-5 sm:space-y-6">
      <div>
        <h1 className="font-playfair text-2xl font-bold text-gray-950 sm:text-3xl">
          Manage Events
        </h1>
        <p className="mt-1 text-sm text-gray-500 sm:text-base">
          View, search, and manage organization events.
        </p>
      </div>

      <EventStats events={events} />

      <EventFilters
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        categoryFilter={categoryFilter}
        setCategoryFilter={setCategoryFilter}
        categoryOptions={categoryOptions}
        venueFilter={venueFilter}
        setVenueFilter={setVenueFilter}
        venueOptions={venueOptions}
        sortBy={sortBy}
        setSortBy={setSortBy}
      />

      <EventsTable
        events={paginatedEvents}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        loading={loading}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        totalEvents={filteredEvents.length}
        totalPages={totalPages}
        pageSize={EVENTS_PER_PAGE}
        onToggleArchive={handleToggleArchive}
        onViewEvent={setSelectedEvent}
      />

      <EventModal
        isOpen={Boolean(selectedEvent)}
        onClose={() => setSelectedEvent(null)}
        event={selectedEvent || {}}
      />
    </div>
  );
}

function uniqueOptions(items, getValue) {
  return Array.from(
    new Set(items.map((item) => getValue(item)?.trim()).filter(Boolean))
  ).sort((a, b) => a.localeCompare(b));
}
