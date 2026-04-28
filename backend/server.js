require("dotenv").config();

const express = require("express");
const cors = require("cors");
const rateLimit = require("express-rate-limit");
const connectDB = require("./db");
const askOpenRouter = require("./openrouter");

const app = express();

const questionCache = new Map();
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

const aiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 20,
  message: {
    message: "Too many AI requests. Please try again in a minute.",
  },
});

app.use(cors());
app.use(express.json());
app.use("/api/ai", aiLimiter);

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
    console.error("GET /api/events FULL ERROR:", error);
    res.status(500).json({ message: "Failed to fetch events", error: error.message });
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
    console.error("GET /api/announcements FULL ERROR:", error);
    res.status(500).json({ message: "Failed to fetch announcements", error: error.message });
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

// OPENROUTER AI ROUTE
app.post("/api/ai/ask", async (req, res) => {
  try {
    const { question, history = [] } = req.body;

    if (!question || !question.trim()) {
      return res.status(400).json({
        message: "Question is required.",
      });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const upcomingEvents = events
      .filter((event) => {
        const eventEnd = new Date(event.endDate || event.startDate);
        eventEnd.setHours(23, 59, 59, 999);

        return eventEnd >= today;
      })
  .sort((a, b) => new Date(a.startDate) - new Date(b.startDate));

    const rawEvents = await db
      .collection("events")
      .find({ status: "published" })
      .sort({ startDate: 1 })
      .toArray();

    const events = rawEvents.map((event) => {
      const eventStart = new Date(event.startDate);
      const eventEnd = event.endDate
        ? new Date(event.endDate)
        : new Date(event.startDate);

      eventStart.setHours(0, 0, 0, 0);
      eventEnd.setHours(23, 59, 59, 999);

      let eventProgressStatus = "upcoming";

      if (today > eventEnd) {
        eventProgressStatus = "done";
      } else if (today >= eventStart && today <= eventEnd) {
        eventProgressStatus = "ongoing";
      }

      return {
        ...event,
        eventProgressStatus,
      };
    });
    
    const lowerQuestion = question.toLowerCase();

    const events = await db
      .collection("events")
      .find({ status: "published" })
      .sort({ startDate: 1 })
      .toArray();

    const announcements = await db
      .collection("announcements")
      .find({ status: "published" })
      .sort({ createdAt: -1 })
      .toArray();

    const upcomingEvents = events.filter((event) => {
    new Date(event.endDate || event.startDate) >= today
    });

    const isUpcomingQuery =
      lowerQuestion.includes("upcoming") ||
      lowerQuestion.includes("next event") ||
      lowerQuestion.includes("future event");

    const isTodayQuery = lowerQuestion.includes("today");

    const isTomorrowQuery = lowerQuestion.includes("tomorrow");

    const isThisWeekQuery =
      lowerQuestion.includes("this week") || lowerQuestion.includes("week");

    const keywords = lowerQuestion
      .replace(/[^\w\s]/g, "")
      .split(" ")
      .filter((word) => word.length > 2);

    const matchesQuestion = (item) => {
      const searchableText = `
        ${item.title || ""}
        ${item.description || ""}
        ${item.content || ""}
        ${item.category || ""}
        ${item.location || ""}
        ${item.organizer || ""}
        ${item.createdBy || ""}
        ${item.eventTitle || ""}
      `.toLowerCase();

      return keywords.some((word) => searchableText.includes(word));
    };

    let selectedEvents = [];
    let selectedAnnouncements = [];

    if (isUpcomingQuery) {
      selectedEvents = upcomingEvents.slice(0, 8);
    } else if (isTodayQuery) {
      selectedEvents = events.filter((event) => {
        const eventDate = new Date(event.startDate);
        return eventDate.toDateString() === today.toDateString();
      });
    } else if (isTomorrowQuery) {
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      selectedEvents = events.filter((event) => {
        const eventDate = new Date(event.startDate);
        return eventDate.toDateString() === tomorrow.toDateString();
      });
    } else if (isThisWeekQuery) {
      const endOfWeek = new Date(today);
      endOfWeek.setDate(endOfWeek.getDate() + 7);

      selectedEvents = events.filter((event) => {
        const eventDate = new Date(event.startDate);
        return eventDate >= today && eventDate <= endOfWeek;
      });
    } else {
      selectedEvents = events.filter(matchesQuestion).slice(0, 8);
      selectedAnnouncements = announcements.filter(matchesQuestion).slice(0, 8);
    }

    if (selectedEvents.length === 0 && selectedAnnouncements.length === 0) {
      selectedEvents = upcomingEvents.slice(0, 5);
      selectedAnnouncements = announcements.slice(0, 5);
    }

    const contextText = `
EVENTS:
${JSON.stringify(selectedEvents, null, 2)}

ANNOUNCEMENTS:
${JSON.stringify(selectedAnnouncements, null, 2)}

TODAY:
${today.toDateString()}
    `.trim();

    const answer = await askOpenRouter(question, contextText, history);

    res.json({ answer });
  } catch (error) {
    console.error("AI ask error:", error);

    res.status(500).json({
      message: "Failed to get AI response.",
    });
  }
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});