import { useEffect, useMemo, useState } from "react";
import "./App.css";
import AiChat from "./AiChat.jsx";

function formatDateRange(event) {
  if (event.startDate === event.endDate) return event.startDate;
  return `${event.startDate} — ${event.endDate}`;
}

function formatDateTime(value) {
  if (!value) return "Not available";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat("en-PH", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

function getPriorityClass(priority) {
  if (priority === "high") return "priority high";
  if (priority === "medium") return "priority medium";
  return "priority low";
}

function App() {
  const [events, setEvents] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [loadingAnnouncements, setLoadingAnnouncements] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchEvents() {
      try {
        const response = await fetch("http://localhost:5000/api/events");
        if (!response.ok) throw new Error("Failed to fetch events");
        const data = await response.json();
        setEvents(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoadingEvents(false);
      }
    }

    async function fetchAnnouncements() {
      try {
        const response = await fetch("http://localhost:5000/api/announcements");
        if (!response.ok) throw new Error("Failed to fetch announcements");
        const data = await response.json();
        setAnnouncements(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoadingAnnouncements(false);
      }
    }

    fetchEvents();
    fetchAnnouncements();
  }, []);

  const generalAnnouncements = useMemo(() => {
    return announcements.filter((item) => item.type === "general");
  }, [announcements]);

  const selectedEventAnnouncements = useMemo(() => {
    if (!selectedEvent) return [];
    return announcements.filter(
      (item) => item.type === "event" && item.eventTitle === selectedEvent.title
    );
  }, [announcements, selectedEvent]);

  return (
    <div className="app-shell">
      <div className="bg-orb orb-1" />
      <div className="bg-orb orb-2" />

      <header className="hero">
        <p className="eyebrow">DATABASE TESTING VIEW</p>
        <h1>UST Events & Announcements</h1>
        <p className="hero-copy">
          A cleaner prototype for testing event records, university-wide notices,
          and event-related announcements.
        </p>
      </header>

      <main className="page">
        {error && <p className="status error">{error}</p>}

        <section className="section">
          <div className="section-header">
            <div>
              <p className="section-kicker">UNIVERSITY NOTICES</p>
              <h2>General Announcements</h2>
            </div>
          </div>

          {loadingAnnouncements ? (
            <p className="status">Loading announcements...</p>
          ) : generalAnnouncements.length === 0 ? (
            <div className="empty-state">No general announcements found.</div>
          ) : (
            <div className="announcement-list">
              {generalAnnouncements.map((item) => (
                <article key={item._id} className="announcement-card">
                  <div className="announcement-top">
                    <div className="announcement-tags">
                      <span className="tag">General</span>
                      <span className={getPriorityClass(item.priority)}>
                        {item.priority}
                      </span>
                    </div>
                    <div className="timestamp">
                      <span>Posted</span>
                      <strong>{formatDateTime(item.createdAt)}</strong>
                    </div>
                  </div>

                  <h3>{item.title}</h3>
                  <p>{item.content}</p>
                </article>
              ))}
            </div>
          )}
        </section>

        <section className="section">
          <div className="section-header">
            <div>
              <p className="section-kicker">EVENT RECORDS</p>
              <h2>Events</h2>
            </div>
          </div>

          {loadingEvents ? (
            <p className="status">Loading events...</p>
          ) : events.length === 0 ? (
            <div className="empty-state">No events found.</div>
          ) : (
            <div className="events-grid">
              {events.map((event) => {
                const relatedCount = announcements.filter(
                  (item) => item.type === "event" && item.eventTitle === event.title
                ).length;

                return (
                  <article key={event._id} className="event-card">
                    <div className="event-card-top">
                      <span className="tag solid">{event.category}</span>
                    </div>

                    <div className="event-main">
                      <h3>{event.title}</h3>
                      <p className="event-description">{event.description}</p>

                      <div className="event-meta-grid">
                        <div className="meta-item">
                          <span>Date</span>
                          <strong>{formatDateRange(event)}</strong>
                        </div>

                        {event.startTime && event.endTime ? (
                          <div className="meta-item">
                            <span>Time</span>
                            <strong>
                              {event.startTime} - {event.endTime}
                            </strong>
                          </div>
                        ) : (
                          <div className="meta-item">
                            <span>Time</span>
                            <strong>Flexible / per schedule</strong>
                          </div>
                        )}

                        <div className="meta-item">
                          <span>Location</span>
                          <strong>{event.location}</strong>
                        </div>

                        <div className="meta-item">
                          <span>Organizer</span>
                          <strong>{event.organizer}</strong>
                        </div>

                        <div className="meta-item full">
                          <span>Created</span>
                          <strong>{formatDateTime(event.createdAt)}</strong>
                        </div>
                      </div>
                    </div>

                    <div className="event-footer">
                      <div className="footer-stat">
                        <span>Schedule</span>
                        <strong>
                          {event.schedule?.length > 0
                            ? `${event.schedule.length} item(s)`
                            : "No daily breakdown"}
                        </strong>
                      </div>

                      <div className="footer-stat">
                        <span>Related Notices</span>
                        <strong>{relatedCount}</strong>
                      </div>

                      <button
                        className="open-btn"
                        onClick={() => setSelectedEvent(event)}
                      >
                        View Details
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </main>

          <AiChat />

      {selectedEvent && (
        <div className="modal-overlay" onClick={() => setSelectedEvent(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <p className="section-kicker">EVENT DETAILS</p>
                <h2>{selectedEvent.title}</h2>
                <p className="modal-description">{selectedEvent.description}</p>
              </div>

              <button className="close-btn" onClick={() => setSelectedEvent(null)}>
                ×
              </button>
            </div>

            <div className="modal-grid">
              <section className="panel">
                <h4>Overview</h4>
                <div className="info-list">
                  <div className="info-row">
                    <span>Date</span>
                    <strong>{formatDateRange(selectedEvent)}</strong>
                  </div>

                  {selectedEvent.startTime && selectedEvent.endTime ? (
                    <div className="info-row">
                      <span>Time</span>
                      <strong>
                        {selectedEvent.startTime} - {selectedEvent.endTime}
                      </strong>
                    </div>
                  ) : null}

                  <div className="info-row">
                    <span>Location</span>
                    <strong>{selectedEvent.location}</strong>
                  </div>

                  <div className="info-row">
                    <span>Organizer</span>
                    <strong>{selectedEvent.organizer}</strong>
                  </div>

                  <div className="info-row">
                    <span>Created</span>
                    <strong>{formatDateTime(selectedEvent.createdAt)}</strong>
                  </div>
                </div>
              </section>

              <section className="panel">
                <h4>Daily Schedule</h4>

                {selectedEvent.schedule?.length === 0 ? (
                  <div className="soft-empty">
                    No specific schedule was added for each day.
                  </div>
                ) : (
                  <div className="schedule-list">
                    {selectedEvent.schedule.map((item, index) => (
                      <div key={index} className="schedule-card">
                        <div className="schedule-head">
                          <strong>{item.title}</strong>
                          <span>{item.date}</span>
                        </div>
                        <p className="schedule-time">
                          {item.startTime} - {item.endTime}
                        </p>
                        <p>{item.description}</p>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            </div>

            <section className="panel full-panel">
              <h4>Event-related Announcements</h4>

              {selectedEventAnnouncements.length === 0 ? (
                <div className="soft-empty">
                  No event-related announcements found.
                </div>
              ) : (
                <div className="related-list">
                  {selectedEventAnnouncements.map((item) => (
                    <article key={item._id} className="related-card">
                      <div className="related-top">
                        <strong>{item.title}</strong>
                        <span className={getPriorityClass(item.priority)}>
                          {item.priority}
                        </span>
                      </div>
                      <p>{item.content}</p>
                      <div className="related-time">
                        <span>Posted</span>
                        <strong>{formatDateTime(item.createdAt)}</strong>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </section>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;