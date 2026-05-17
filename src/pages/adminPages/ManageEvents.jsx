import { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import EventFilters from "../../components/adminComponents/events/EventFilters";
import EventCreateModal from "../../components/adminComponents/events/EventCreateModal";
import EventModal from "../../components/adminComponents/events/EventModal";
import EventStats from "../../components/adminComponents/events/EventStats";
import EventsTable from "../../components/adminComponents/events/EventsTable";
import {
  createEvent,
  deleteEvent,
  getEvents,
  updateEvent,
  updateEventFeatured,
  updateEventStatus,
} from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import {
  withCreatedAttribution,
  withUpdatedAttribution,
} from "../../utils/adminAttribution";

const EVENTS_PER_PAGE = 10;

export default function ManageEvents() {
  const location = useLocation();
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [activeTab, setActiveTab] = useState("published");
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [venueFilter, setVenueFilter] = useState("all");
  const [sortBy, setSortBy] = useState("az");
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);

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

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const query = params.get("search") || "";
    const tab = params.get("tab");

    if (["published", "archived"].includes(tab)) {
      setActiveTab(tab);
    }

    if (params.get("action") === "create") {
      setIsCreateModalOpen(true);
    }

    setSearchTerm(query);
  }, [location.search]);

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
    const updatedEvent = await updateEventStatus(
      event._id,
      nextStatus,
      withUpdatedAttribution({}, user)
    );

    setEvents((current) =>
      current.map((item) =>
        item._id === event._id ? { ...item, ...updatedEvent } : item
      )
    );
  };

  const handleToggleFeatured = async (event) => {
    const updatedEvent = await updateEventFeatured(
      event._id,
      !event.isFeatured,
      withUpdatedAttribution({}, user)
    );

    setEvents((current) =>
      current.map((item) => {
        if (item._id === updatedEvent._id) return { ...item, ...updatedEvent };
        if (updatedEvent.isFeatured) return { ...item, isFeatured: false };
        return item;
      })
    );
    setSelectedEvent((current) => {
      if (!current) return current;
      if (current._id === updatedEvent._id) return { ...current, ...updatedEvent };
      if (updatedEvent.isFeatured) return { ...current, isFeatured: false };
      return current;
    });
  };

  const handleCreateEvent = async (eventData) => {
    const createdEvent = await createEvent(withCreatedAttribution(eventData, user));

    setEvents((current) => [createdEvent, ...current]);
    setActiveTab("published");
    setSelectedEvent(createdEvent);
  };

  const handleUpdateEvent = async (eventData) => {
    const updatedEvent = await updateEvent(
      editingEvent._id,
      withUpdatedAttribution(eventData, user)
    );

    setEvents((current) =>
      current.map((item) =>
        item._id === updatedEvent._id ? { ...item, ...updatedEvent } : item
      )
    );
    setSelectedEvent((current) =>
      current?._id === updatedEvent._id ? { ...current, ...updatedEvent } : current
    );
    setEditingEvent(null);
  };

  const handleDeleteEvent = async (event) => {
    await deleteEvent(event._id);

    setEvents((current) => current.filter((item) => item._id !== event._id));
    setSelectedEvent((current) => (current?._id === event._id ? null : current));
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
          venue.toLowerCase().includes(keyword) ||
          event.organizer?.toLowerCase().includes(keyword) ||
          event.createdBy?.toLowerCase().includes(keyword) ||
          event.createdByEmail?.toLowerCase().includes(keyword) ||
          event.updatedBy?.toLowerCase().includes(keyword) ||
          event.updatedByEmail?.toLowerCase().includes(keyword) ||
          event.description?.toLowerCase().includes(keyword)
        );
      });
    }

    if (categoryFilter !== "all") {
      result = result.filter(
        (event) => normalizeOption(event.category) === categoryFilter
      );
    }

    if (venueFilter !== "all") {
      result = result.filter(
        (event) => normalizeOption(event.location || event.venue) === venueFilter
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
        onToggleFeatured={handleToggleFeatured}
        onDeleteEvent={handleDeleteEvent}
        onViewEvent={setSelectedEvent}
        onEditEvent={setEditingEvent}
        onCreateEvent={() => setIsCreateModalOpen(true)}
      />

      <EventCreateModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreate={handleCreateEvent}
      />

      <EventCreateModal
        key={editingEvent?._id || "event-edit"}
        isOpen={Boolean(editingEvent)}
        onClose={() => setEditingEvent(null)}
        onUpdate={handleUpdateEvent}
        event={editingEvent}
        mode="edit"
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
    new Set(
      items
        .map((item) => normalizeOption(getValue(item)))
        .filter(Boolean)
    )
  ).sort((a, b) => a.localeCompare(b));
}

function normalizeOption(value) {
  return String(value || "").replace(/\s+/g, " ").trim();
}
