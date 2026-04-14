import { useEffect, useState } from "react";

function App() {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchAnnouncements() {
      try {
        const response = await fetch("http://localhost:5000/api/announcements");
        if (!response.ok) {
          throw new Error("Failed to fetch announcements");
        }

        const data = await response.json();
        setAnnouncements(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchAnnouncements();
  }, []);

  if (loading) return <h2>Loading announcements...</h2>;
  if (error) return <h2>{error}</h2>;

  return (
    <div>
      <h1>UST Announcements</h1>

      {announcements.length === 0 ? (
        <p>No announcements found.</p>
      ) : (
        announcements.map((item) => (
          <div key={item._id} style={{ border: "1px solid #ccc", padding: "16px", marginBottom: "12px" }}>
            <h2>{item.title}</h2>
            <p>{item.description}</p>
            <p><strong>Category:</strong> {item.category}</p>
            <p><strong>Location:</strong> {item.location}</p>
            <p><strong>Event Date:</strong> {item.eventDate}</p>
          </div>
        ))
      )}
    </div>
  );
}

export default App;