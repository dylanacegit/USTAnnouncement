require("dotenv").config();

const express = require("express");
const cors = require("cors");
const rateLimit = require("express-rate-limit");
const { ObjectId } = require("mongodb");
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

app.patch("/api/events/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid event ID." });
    }

    if (!["published", "archived"].includes(status)) {
      return res.status(400).json({ message: "Invalid event status." });
    }

    const db = await connectDB();
    const eventId = new ObjectId(id);

    const result = await db.collection("events").updateOne(
      { _id: eventId },
      {
        $set: {
          status,
          updatedAt: new Date(),
        },
      }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ message: "Event not found." });
    }

    const updatedEvent = await db.collection("events").findOne({ _id: eventId });

    res.json(updatedEvent);
  } catch (error) {
    console.error("PATCH /api/events/:id error:", error);
    res.status(500).json({ message: "Failed to update event" });
  }
});

app.patch("/api/announcements/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid announcement ID." });
    }

    if (!["published", "archived"].includes(status)) {
      return res.status(400).json({ message: "Invalid announcement status." });
    }

    const db = await connectDB();
    const announcementId = new ObjectId(id);

    const result = await db.collection("announcements").updateOne(
      { _id: announcementId },
      {
        $set: {
          status,
          updatedAt: new Date(),
        },
      }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ message: "Announcement not found." });
    }

    const updatedAnnouncement = await db
      .collection("announcements")
      .findOne({ _id: announcementId });

    res.json(updatedAnnouncement);
  } catch (error) {
    console.error("PATCH /api/announcements/:id error:", error);
    res.status(500).json({ message: "Failed to update announcement" });
  }
});

app.get("/api/accounts", async (req, res) => {
  try {
    const db = await connectDB();

    const accounts = await db
      .collection("accounts")
      .find({})
      .sort({ createdAt: -1 })
      .toArray();

    res.json(accounts);
  } catch (error) {
    console.error("GET /api/accounts FULL ERROR:", error);
    res.status(500).json({
      message: "Failed to fetch accounts",
      error: error.message
    });
  }
});

app.patch("/api/accounts/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { status, department, firstName, lastName, email } = req.body;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid account ID." });
    }

    const updates = {
      updatedAt: new Date(),
    };

    if (status !== undefined) {
      if (!["active", "archived"].includes(status)) {
        return res.status(400).json({ message: "Invalid account status." });
      }

      updates.status = status;
    }

    if (department !== undefined) {
      if (!department || !department.trim()) {
        return res.status(400).json({ message: "Department is required." });
      }

      updates.department = department.trim();
    }

    if (firstName !== undefined) {
      if (!firstName || !firstName.trim()) {
        return res.status(400).json({ message: "First name is required." });
      }

      updates.firstName = firstName.trim();
    }

    if (lastName !== undefined) {
      if (!lastName || !lastName.trim()) {
        return res.status(400).json({ message: "Last name is required." });
      }

      updates.lastName = lastName.trim();
    }

    if (email !== undefined) {
      const trimmedEmail = email.trim().toLowerCase();

      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
        return res.status(400).json({ message: "Valid email is required." });
      }

      updates.email = trimmedEmail;
    }

    if (Object.keys(updates).length === 1) {
      return res.status(400).json({ message: "No account updates provided." });
    }

    const db = await connectDB();

    const accountId = new ObjectId(id);
    const result = await db.collection("accounts").updateOne(
      { _id: accountId },
      { $set: updates },
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ message: "Account not found." });
    }

    const updatedAccount = await db
      .collection("accounts")
      .findOne({ _id: accountId });

    res.json(updatedAccount);
  } catch (error) {
    console.error("PATCH /api/accounts/:id error:", error);
    res.status(500).json({ message: "Failed to update account" });
  }
});

app.delete("/api/accounts/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid account ID." });
    }

    const db = await connectDB();
    const accountId = new ObjectId(id);

    const result = await db.collection("accounts").deleteOne({ _id: accountId });

    if (result.deletedCount === 0) {
      return res.status(404).json({ message: "Account not found." });
    }

    res.json({ message: "Account deleted successfully." });
  } catch (error) {
    console.error("DELETE /api/accounts/:id error:", error);
    res.status(500).json({ message: "Failed to delete account" });
  }
});

// OPENROUTER AI ROUTE
app.post("/api/ai/ask", async (req, res) => {
  try {
    const { question, history = [] } = req.body;

    if (!question || !question.trim()) {
      return res.status(400).json({
        answer: "Please enter a question.",
      });
    }

    const db = await connectDB();

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const isFollowUpQuestion = (text) =>
      /\b(it|that|this|they|them|there|the event|the announcement)\b/i.test(
        text
      );

    const getRecentConversationTopic = (items = []) => {
      return items
        .slice(-4)
        .map((msg) => `${msg.role}: ${msg.text}`)
        .join("\n");
    };

    const recentTopic = getRecentConversationTopic(history);
    const resolvedQuestion =
      isFollowUpQuestion(question) && recentTopic
        ? `${question}\n\nPrevious conversation:\n${recentTopic}`
        : question;

    const q = resolvedQuestion.toLowerCase().trim();

    const rawEvents = await db
      .collection("events")
      .find({ status: "published" })
      .sort({ startDate: 1 })
      .toArray();

    const rawAnnouncements = await db
      .collection("announcements")
      .find({ status: "published" })
      .sort({ createdAt: -1 })
      .toArray();

    const normalizeDate = (date) => {
      if (!date) return null;
      const d = new Date(date);
      if (isNaN(d)) return null;
      d.setHours(0, 0, 0, 0);
      return d;
    };

    const formatDate = (date) => {
      if (!date) return "No date provided";
      return new Date(date).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      });
    };

    const formatTime = (event) => {
      if (event.startTime && event.endTime) {
        return `${event.startTime} - ${event.endTime}`;
      }
      return event.startTime || "No time provided";
    };

    const getEventStatus = (event) => {
      const start = normalizeDate(event.startDate);
      const end = normalizeDate(event.endDate || event.startDate);

      if (!start || !end) return "unknown";

      end.setHours(23, 59, 59, 999);

      if (today > end) return "done";
      if (today >= start && today <= end) return "ongoing";
      return "upcoming";
    };

    const events = rawEvents.map((event) => ({
      ...event,
      eventProgressStatus: getEventStatus(event),
    }));

    const announcements = rawAnnouncements;

    const words = q
      .replace(/[^\w\s]/g, " ")
      .split(/\s+/)
      .filter(Boolean);

    const stopWords = new Set([
      "what",
      "when",
      "where",
      "who",
      "how",
      "is",
      "are",
      "the",
      "a",
      "an",
      "of",
      "to",
      "for",
      "in",
      "on",
      "at",
      "about",
      "details",
      "detail",
      "event",
      "events",
      "announcement",
      "announcements",
      "please",
      "show",
      "give",
      "tell",
      "me",
      "it",
      "that",
      "this",
      "they",
      "them",
      "there",
      "previous",
      "conversation",
      "user",
      "assistant",
    ]);

    const importantWords = words.filter(
      (word) => word.length > 2 && !stopWords.has(word)
    );

    const aliases = {
      upcoming: ["upcoming", "future", "next", "soon", "coming"],
      previous: ["previous", "past", "done", "finished", "ended", "old"],
      today: ["today"],
      tomorrow: ["tomorrow"],
      week: ["this week"],
      where: ["where", "venue", "location", "held"],
      when: ["when", "date", "schedule"],
      time: ["time", "hour"],
      organizer: ["organizer", "host", "created"],
      detailed: ["details", "full", "complete", "information", "info"],
    };

    const hasAny = (list) => list.some((term) => q.includes(term));

    const intent = {
      upcoming: hasAny(aliases.upcoming),
      previous: hasAny(aliases.previous),
      today: hasAny(aliases.today),
      tomorrow: hasAny(aliases.tomorrow),
      thisWeek: q.includes("this week"),
      where: hasAny(aliases.where),
      when: hasAny(aliases.when),
      time: hasAny(aliases.time),
      organizer: hasAny(aliases.organizer),
      detailed: hasAny(aliases.detailed),
    };

    const searchableText = (item) =>
      `
      ${item.title || ""}
      ${item.eventTitle || ""}
      ${item.description || ""}
      ${item.caption || ""}
      ${item.content || ""}
      ${item.category || ""}
      ${item.location || ""}
      ${item.organizer || ""}
      ${item.createdBy || ""}
      ${item.updatedBy || ""}
      ${(item.aliases || []).join(" ")}
    `.toLowerCase();

    const matchesQuestion = (item) => {
      const text = searchableText(item);

      if (importantWords.length === 0) return false;

      return importantWords.some((word) => text.includes(word));
    };

    const relatedAnnouncementsForEvent = (event) => {
      return announcements.filter((announcement) => {
        const eventTitle = event.title?.toLowerCase();
        const announcementEventTitle = announcement.eventTitle?.toLowerCase();

        return (
          announcementEventTitle === eventTitle ||
          searchableText(announcement).includes(eventTitle)
        );
      });
    };

    let selectedEvents = [];
    let selectedAnnouncements = [];

    if (intent.upcoming) {
      selectedEvents = events
        .filter((event) => event.eventProgressStatus === "upcoming")
        .sort((a, b) => new Date(a.startDate) - new Date(b.startDate))
        .slice(0, 5);
    } else if (intent.previous) {
      selectedEvents = events
        .filter((event) => event.eventProgressStatus === "done")
        .sort((a, b) => new Date(b.startDate) - new Date(a.startDate))
        .slice(0, 5);
    } else if (intent.today) {
      selectedEvents = events.filter((event) => {
        const start = normalizeDate(event.startDate);
        const end = normalizeDate(event.endDate || event.startDate);
        return start && end && today >= start && today <= end;
      });
    } else if (intent.tomorrow) {
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      selectedEvents = events.filter((event) => {
        const start = normalizeDate(event.startDate);
        const end = normalizeDate(event.endDate || event.startDate);
        return start && end && tomorrow >= start && tomorrow <= end;
      });
    } else if (intent.thisWeek) {
      const endOfWeek = new Date(today);
      endOfWeek.setDate(endOfWeek.getDate() + 7);

      selectedEvents = events.filter((event) => {
        const start = normalizeDate(event.startDate);
        return start && start >= today && start <= endOfWeek;
      });
    } else {
      selectedEvents = events.filter(matchesQuestion).slice(0, 5);
      selectedAnnouncements = announcements.filter(matchesQuestion).slice(0, 5);
    }

    selectedEvents.forEach((event) => {
      selectedAnnouncements.push(...relatedAnnouncementsForEvent(event));
    });

    selectedAnnouncements = selectedAnnouncements.slice(0, 5);

    if (selectedEvents.length === 0 && selectedAnnouncements.length === 0) {
      return res.json({
        answer: "No matching information was found.",
      });
    }

    // Direct answers for simple questions
    if (selectedEvents.length === 1) {
      const event = selectedEvents[0];

      if (intent.where) {
        return res.json({
          answer: event.location
            ? `The event will be held at ${event.location}.`
            : "No location was provided for this event.",
        });
      }

      if (intent.when) {
        const dateText =
          event.endDate && event.endDate !== event.startDate
            ? `${formatDate(event.startDate)} to ${formatDate(event.endDate)}`
            : formatDate(event.startDate);

        return res.json({
          answer: `The event is scheduled on ${dateText}.`,
        });
      }

      if (intent.time) {
        return res.json({
          answer: `The event time is ${formatTime(event)}.`,
        });
      }

      if (intent.organizer) {
        return res.json({
          answer: event.organizer
            ? `The event is organized by ${event.organizer}.`
            : "No organizer was provided for this event.",
        });
      }
    }

    const cleanEvents = selectedEvents.map((event) => ({
      title: event.title,
      category: event.category,
      status: event.eventProgressStatus,
      date:
        event.endDate && event.endDate !== event.startDate
          ? `${formatDate(event.startDate)} to ${formatDate(event.endDate)}`
          : formatDate(event.startDate),
      time: formatTime(event),
      location: event.location || "No location provided",
      organizer: event.organizer || "No organizer provided",
      description: event.description || "",
      schedule: event.schedule || [],
    }));

    const cleanAnnouncements = selectedAnnouncements.map((announcement) => ({
      title: announcement.title,
      type: announcement.type,
      eventTitle: announcement.eventTitle,
      category: announcement.category,
      caption: announcement.caption || "",
      content: announcement.content || "",
      createdBy: announcement.createdBy || "",
      createdAt: announcement.createdAt,
    }));

    const contextText = JSON.stringify(
      {
        today: today.toDateString(),
        events: cleanEvents,
        announcements: cleanAnnouncements,
      },
      null,
      2
    );

    const cacheKey = `${q}-${JSON.stringify(cleanEvents)}-${JSON.stringify(
      cleanAnnouncements
    )}`;

    const cached = questionCache.get(cacheKey);

    if (cached && Date.now() - cached.createdAt < CACHE_TTL_MS) {
      return res.json({ answer: cached.answer });
    }

    const answer = await askOpenRouter(resolvedQuestion, contextText, history);

    questionCache.set(cacheKey, {
      answer,
      createdAt: Date.now(),
    });

    res.json({ answer });
  } catch (error) {
    console.error("AI ask error:", error);

    if (error.message?.includes("OPENROUTER_API_KEY")) {
      return res.status(500).json({
        answer: "AI service is not configured properly.",
      });
    }

    if (error.message?.includes("timed out")) {
      return res.status(504).json({
        answer: "The AI took too long to respond. Please try again.",
      });
    }

    res.status(500).json({
      answer: "Something went wrong while getting the AI response.",
    });
  }
});
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
