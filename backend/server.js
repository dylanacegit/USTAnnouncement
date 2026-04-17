require("dotenv").config();

const express = require("express");
const cors = require("cors");
const connectDB = require("./db");
const askOpenRouter = require("./openrouter");

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
    const { question } = req.body;

    if (!question || !question.trim()) {
      return res.status(400).json({ message: "Question is required." });
    }

    const db = await connectDB();

    const cleanedQuestion = question
      .toLowerCase()
      .replace(/[^\w\s]/g, "")
      .trim();

    const fillerWords = new Set([
      "what",
      "when",
      "where",
      "who",
      "which",
      "is",
      "are",
      "the",
      "a",
      "an",
      "about",
      "there",
      "any",
      "during",
      "for",
      "of",
      "to",
      "in",
      "on",
      "at",
      "do",
      "does",
      "did",
      "with",
      "tell",
      "me",
      "happening",
      "happen",
      "details",
      "information",
      "update",
      "updates",
      "news",
    ]);

    const words = cleanedQuestion.split(/\s+/).filter(Boolean);

    const phraseWords = words.filter((word) => !fillerWords.has(word));
    const phrase = phraseWords.join(" ");

    const keywords = phraseWords.filter((word) => word.length > 2);

    // 1. Try phrase-first search (best for titles)
    let events = [];
    let announcements = [];

    if (phrase) {
      events = await db
        .collection("events")
        .find({
          $or: [
            { title: { $regex: phrase, $options: "i" } },
            { description: { $regex: phrase, $options: "i" } },
            { location: { $regex: phrase, $options: "i" } },
            { organizer: { $regex: phrase, $options: "i" } },
            { "schedule.title": { $regex: phrase, $options: "i" } },
            { "schedule.description": { $regex: phrase, $options: "i" } },
          ],
        })
        .limit(5)
        .toArray();

      announcements = await db
        .collection("announcements")
        .find({
          $or: [
            { title: { $regex: phrase, $options: "i" } },
            { content: { $regex: phrase, $options: "i" } },
            { eventTitle: { $regex: phrase, $options: "i" } },
          ],
        })
        .limit(5)
        .toArray();
    }

    // 2. If phrase search finds nothing, fall back to keyword search
    if (events.length === 0 && announcements.length === 0) {
      const searchTerms = keywords.length > 0 ? keywords : [cleanedQuestion];

      const eventQuery = {
        $or: searchTerms.flatMap((word) => [
          { title: { $regex: word, $options: "i" } },
          { description: { $regex: word, $options: "i" } },
          { location: { $regex: word, $options: "i" } },
          { organizer: { $regex: word, $options: "i" } },
          { "schedule.title": { $regex: word, $options: "i" } },
          { "schedule.description": { $regex: word, $options: "i" } },
          { "schedule.date": { $regex: word, $options: "i" } },
        ]),
      };

      const announcementQuery = {
        $or: searchTerms.flatMap((word) => [
          { title: { $regex: word, $options: "i" } },
          { content: { $regex: word, $options: "i" } },
          { eventTitle: { $regex: word, $options: "i" } },
        ]),
      };

      events = await db.collection("events").find(eventQuery).limit(5).toArray();

      announcements = await db
        .collection("announcements")
        .find(announcementQuery)
        .limit(5)
        .toArray();
    }

    if (events.length === 0 && announcements.length === 0) {
      return res.json({
        answer: "No matching information was found.",
      });
    }

    const contextText = `
MATCHED EVENTS:
${JSON.stringify(events, null, 2)}

MATCHED ANNOUNCEMENTS:
${JSON.stringify(announcements, null, 2)}
    `;

    const answer = await askOpenRouter(question, contextText);

    res.json({
      answer,
    });
  } catch (error) {
    console.error("POST /api/ai/ask error:", error);
    res.status(500).json({
      message: "Failed to get AI response.",
    });
  }
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});