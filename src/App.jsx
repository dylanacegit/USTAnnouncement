import { useEffect, useState } from "react";
import "./App.css";

function formatDateRange(event) {
  const sameDay = event.startDate === event.endDate;

  if (sameDay) {
    return event.startDate;
  }

  return `${event.startDate} to ${event.endDate}`;
}

function App() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedEvent, setSelectedEvent] = useState(null);

  useEffect(() => {
    async function fetchEvents() {
      try {
        const response = await fetch("http://localhost:5000/api/events");

        if (!response.ok) {
          throw new Error("Failed to fetch events");
        }

        const data = await response.json();
        setEvents(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchEvents();
  }, []);

  return (
    <div className="app">
      <header className="hero">
        <h1>UST Events Test Page</h1>
        <p>Testing single-day and multi-day event structures</p>
      </header>

      <main className="container">
        {loading && <p className="status">Loading events...</p>}
        {error && <p className="status error">{error}</p>}

        <div className="grid">
          {events.map((event) => (
            <div key={event._id} className="card">
              <div className="card-top" />
              <span className="badge">{event.category}</span>
              <h2>{event.title}</h2>
              <p className="desc">{event.description}</p>

              <div className="meta">
                <p><strong>Date:</strong> {formatDateRange(event)}</p>
                {event.startTime && event.endTime && (
                  <p><strong>Time:</strong> {event.startTime} - {event.endTime}</p>
                )}
                <p><strong>Location:</strong> {event.location}</p>
                <p><strong>Organizer:</strong> {event.organizer}</p>
              </div>

              <div className="schedule-indicator">
                {event.schedule?.length > 0
                  ? `${event.schedule.length} scheduled activity/activities`
                  : "No detailed daily schedule"}
              </div>

              <button
                className="btn"
                onClick={() => setSelectedEvent(event)}
              >
                View Details
              </button>
            </div>
          ))}
        </div>
      </main>

      {selectedEvent && (
        <div className="modal-overlay" onClick={() => setSelectedEvent(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>{selectedEvent.title}</h2>
            <p className="modal-desc">{selectedEvent.description}</p>

            <div className="meta modal-meta">
              <p><strong>Category:</strong> {selectedEvent.category}</p>
              <p><strong>Date:</strong> {formatDateRange(selectedEvent)}</p>
              {selectedEvent.startTime && selectedEvent.endTime && (
                <p>
                  <strong>Time:</strong> {selectedEvent.startTime} - {selectedEvent.endTime}
                </p>
              )}
              <p><strong>Location:</strong> {selectedEvent.location}</p>
              <p><strong>Organizer:</strong> {selectedEvent.organizer}</p>
            </div>

            <h3>Daily Schedule</h3>

            {selectedEvent.schedule?.length === 0 ? (
              <p className="empty-schedule">
                No specific activities were added for each day.
              </p>
            ) : (
              <div className="schedule-list">
                {selectedEvent.schedule.map((item, index) => (
                  <div key={index} className="schedule-item">
                    <p><strong>Date:</strong> {item.date}</p>
                    <p><strong>Time:</strong> {item.startTime} - {item.endTime}</p>
                    <p><strong>Activity:</strong> {item.title}</p>
                    <p>{item.description}</p>
                  </div>
                ))}
              </div>
            )}

            <button className="btn close-btn" onClick={() => setSelectedEvent(null)}>
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;