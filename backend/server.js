require("dotenv").config();

const express = require("express");
const cors = require("cors");
const connectDB = require("./db");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Backend is running");
});

// GET all events
app.get("/api/events", async (req, res) => {
  try {
    const db = await connectDB();

    const events = await db
      .collection("events")
      .find({})
      .sort({ createdAt: -1 })
      .toArray();

    res.json(events);
  } catch (error) {
    console.error("GET /api/events error:", error);
    res.status(500).json({ message: "Failed to fetch events" });
  }
});

// GET all announcements
app.get("/api/announcements", async (req, res) => {
  try {
    const db = await connectDB();

    const announcements = await db
      .collection("announcements")
      .find({})
      .sort({ createdAt: -1 })
      .toArray();

    res.json(announcements);
  } catch (error) {
    console.error("GET /api/announcements error:", error);
    res.status(500).json({ message: "Failed to fetch announcements" });
  }
});

// GET event-related announcements by event title
app.get("/api/announcements/event/:eventTitle", async (req, res) => {
  try {
    const db = await connectDB();
    const { eventTitle } = req.params;

    const announcements = await db
      .collection("announcements")
      .find({ type: "event", eventTitle })
      .sort({ createdAt: -1 })
      .toArray();

    res.json(announcements);
  } catch (error) {
    console.error("GET /api/announcements/event/:eventTitle error:", error);
    res.status(500).json({ message: "Failed to fetch event announcements" });
  }
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});