require("dotenv").config();

const express = require("express");
const cors = require("cors");
const rateLimit = require("express-rate-limit");
const connectDB = require("./db");
const askOpenRouter = require("./openrouter");

const app = express();

const questionCache = new Map();
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes
const MAX_CONTEXT_EVENTS = 12;
const MAX_CONTEXT_ANNOUNCEMENTS = 12;

const aiLimiter = rateLimit({
  windowMs: 60 * 1000,
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

function normalizeText(text = "") {
  return text.trim().toLowerCase().replace(/\s+/g, " ");
}

function keywordsFromText(text = "") {
  return normalizeText(text)
    .replace(/[^\w\s]/g, " ")
    .split(/\s+/)
    .filter((word) => word.length > 2);
}

function escapeRegex(text) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function toDateOrNull(value) {
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function startOfDay(date = new Date()) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function endOfDay(date = new Date()) {
  const d = new Date(date);
  d.setHours(23, 59, 59, 999);
  return d;
}

function getEventStartDate(event) {
  return toDateOrNull(event.startDate) || toDateOrNull(event.eventDate) || toDateOrNull(event.date);
}

function getEventEndDate(event) {
  return (
    toDateOrNull(event.endDate) ||
    toDateOrNull(event.startDate) ||
    toDateOrNull(event.eventDate) ||
    toDateOrNull(event.date)
  );
}

function withEventProgressStatus(event, today) {
  const rawStart = getEventStartDate(event);
  const rawEnd = getEventEndDate(event);

  if (!rawStart || !rawEnd) {
    return { ...event, eventProgressStatus: "unknown" };
  }

  const eventStart = startOfDay(rawStart);
  const eventEnd = endOfDay(rawEnd);

  let eventProgressStatus = "upcoming";
  if (today > eventEnd) eventProgressStatus = "done";
  else if (today >= eventStart && today <= eventEnd) eventProgressStatus = "ongoing";

  return { ...event, eventProgressStatus };
}

async function fetchEventsForQuestion(db, normalizedQuestion, today, keywords) {
  const eventsCollection = db.collection("events");

  if (normalizedQuestion.includes("today")) {
    const todayStart = startOfDay(today);
    const todayEnd = endOfDay(today);

    return eventsCollection
      .find({
        status: "published",
        $or: [
          { startDate: { $gte: todayStart, $lte: todayEnd } },
          { eventDate: { $gte: todayStart, $lte: todayEnd } },
          { date: { $gte: todayStart, $lte: todayEnd } },
        ],
      })
      .sort({ startDate: 1 })
      .limit(MAX_CONTEXT_EVENTS)
      .toArray();
  }

  if (normalizedQuestion.includes("tomorrow")) {
    const tomorrow = startOfDay(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowEnd = endOfDay(tomorrow);

    return eventsCollection
      .find({
        status: "published",
        $or: [
          { startDate: { $gte: startOfDay(tomorrow), $lte: tomorrowEnd } },
          { eventDate: { $gte: startOfDay(tomorrow), $lte: tomorrowEnd } },
          { date: { $gte: startOfDay(tomorrow), $lte: tomorrowEnd } },
        ],
      })
      .sort({ startDate: 1 })
      .limit(MAX_CONTEXT_EVENTS)
      .toArray();
  }

  if (normalizedQuestion.includes("this week")) {
    const weekEnd = endOfDay(today);
    weekEnd.setDate(weekEnd.getDate() + 7);
    const weekStart = startOfDay(today);

    return eventsCollection
      .find({
        status: "published",
        $or: [
          { startDate: { $gte: weekStart, $lte: weekEnd } },
          { eventDate: { $gte: weekStart, $lte: weekEnd } },
          { date: { $gte: weekStart, $lte: weekEnd } },
        ],
      })
      .sort({ startDate: 1 })
      .limit(MAX_CONTEXT_EVENTS)
      .toArray();
  }

  if (
    normalizedQuestion.includes("upcoming") ||
    normalizedQuestion.includes("next event") ||
    normalizedQuestion.includes("future event")
  ) {
    return eventsCollection
      .find({
        status: "published",
        $or: [
          { endDate: { $gte: startOfDay(today) } },
          { endDate: { $exists: false }, startDate: { $gte: startOfDay(today) } },
          { endDate: { $exists: false }, eventDate: { $gte: startOfDay(today) } },
          { endDate: { $exists: false }, date: { $gte: startOfDay(today) } },
        ],
      })
      .sort({ startDate: 1 })
      .limit(MAX_CONTEXT_EVENTS)
      .toArray();
  }

  if (keywords.length === 0) {
    return eventsCollection.find({ status: "published" }).sort({ startDate: 1 }).limit(MAX_CONTEXT_EVENTS).toArray();
  }

  const keywordRegex = new RegExp(keywords.map(escapeRegex).join("|"), "i");
  return eventsCollection
    .find({
      status: "published",
      $or: [
        { title: keywordRegex },
        { description: keywordRegex },
        { category: keywordRegex },
        { location: keywordRegex },
        { organizer: keywordRegex },
      ],
    })
    .sort({ startDate: 1 })
    .limit(MAX_CONTEXT_EVENTS)
    .toArray();
}

async function fetchAnnouncementsForQuestion(db, normalizedQuestion, keywords) {
  const announcementsCollection = db.collection("announcements");

  const isRelativeQuery =
    normalizedQuestion.includes("upcoming") ||
    normalizedQuestion.includes("today") ||
    normalizedQuestion.includes("tomorrow") ||
    normalizedQuestion.includes("this week");

  if (isRelativeQuery) {
    return announcementsCollection.find({ status: "published" }).sort({ createdAt: -1 }).limit(6).toArray();
  }

  if (keywords.length === 0) {
    return announcementsCollection
      .find({ status: "published" })
      .sort({ createdAt: -1 })
      .limit(MAX_CONTEXT_ANNOUNCEMENTS)
      .toArray();
  }

  const keywordRegex = new RegExp(keywords.map(escapeRegex).join("|"), "i");
  return announcementsCollection
    .find({
      status: "published",
      $or: [
        { title: keywordRegex },
        { content: keywordRegex },
        { category: keywordRegex },
        { eventTitle: keywordRegex },
        { createdBy: keywordRegex },
      ],
    })
    .sort({ createdAt: -1 })
    .limit(MAX_CONTEXT_ANNOUNCEMENTS)
    .toArray();
}

app.get("/api/events", async (req, res) => {
  try {
    const db = await connectDB();
    const events = await db.collection("events").find({}).sort({ createdAt: -1 }).toArray();
    res.json(events);
  } catch (error) {
    console.error("GET /api/events FULL ERROR:", error);
    res.status(500).json({ message: "Failed to fetch events", error: error.message });
  }
});

app.get("/api/announcements", async (req, res) => {
  try {
    const db = await connectDB();
    const announcements = await db.collection("announcements").find({}).sort({ createdAt: -1 }).toArray();
    res.json(announcements);
  } catch (error) {
    console.error("GET /api/announcements FULL ERROR:", error);
    res.status(500).json({ message: "Failed to fetch announcements", error: error.message });
  }
});

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

app.post("/api/ai/ask", async (req, res) => {
  try {
    const { question, history = [] } = req.body;

    if (!question || !question.trim()) {
      return res.status(400).json({ message: "Question is required." });
    }

    const normalizedQuestion = normalizeText(question);
    const cached = questionCache.get(normalizedQuestion);

    if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
      return res.json({ answer: cached.answer, cached: true });
    }

    const db = await connectDB();
    const today = startOfDay(new Date());
    const keywords = keywordsFromText(question);

    let events = await fetchEventsForQuestion(db, normalizedQuestion, today, keywords);
    const announcements = await fetchAnnouncementsForQuestion(db, normalizedQuestion, keywords);

    if (events.length === 0) {
      events = await db.collection("events").find({ status: "published" }).sort({ startDate: 1 }).limit(5).toArray();
    }

    const safeHistory = Array.isArray(history)
      ? history
          .filter((entry) => entry && typeof entry.role === "string" && typeof entry.text === "string")
          .slice(-6)
      : [];

    const contextText = `
EVENTS:
${JSON.stringify(events.map((event) => withEventProgressStatus(event, today)), null, 2)}

ANNOUNCEMENTS:
${JSON.stringify(announcements, null, 2)}

TODAY:
${today.toDateString()}
    `.trim();

    const answer = await askOpenRouter(question, contextText, safeHistory);

    questionCache.set(normalizedQuestion, { answer, timestamp: Date.now() });

    res.json({ answer, cached: false });
  } catch (error) {
    console.error("AI ask error:", error);
    res.status(500).json({ message: "Failed to get AI response." });
  }
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
