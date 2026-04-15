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

/* -------------------- EVENTS -------------------- */

// Get all events
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

// Insert 3 sample events
app.post("/api/events/seed", async (req, res) => {
  try {
    const db = await connectDB();

    const sampleEvents = [
      {
        title: "Thomasian Research Congress 2026",
        description:
          "A single-day university-wide academic conference for students and faculty.",
        category: "Academic",
        startDate: "2026-04-03",
        endDate: "2026-04-03",
        startTime: "08:00",
        endTime: "18:00",
        location: "Main Building Auditorium",
        organizer: "Office of Student Affairs",
        imageUrl: "",
        status: "published",
        schedule: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        title: "UST Engineering Week 2026",
        description:
          "A multi-day event celebrating engineering innovation, exhibits, and student activities.",
        category: "Academic",
        startDate: "2026-04-17",
        endDate: "2026-04-24",
        startTime: "",
        endTime: "",
        location: "UST Engineering Complex",
        organizer: "Engineering Student Council",
        imageUrl: "",
        status: "published",
        schedule: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        title: "UST Innovation and Technology Summit 2026",
        description:
          "A week-long summit with talks, workshops, exhibits, and competitions scheduled on specific days.",
        category: "Academic",
        startDate: "2026-05-10",
        endDate: "2026-05-15",
        startTime: "",
        endTime: "",
        location: "Thomas Aquinas Research Complex",
        organizer: "UST Innovation Office",
        imageUrl: "",
        status: "published",
        schedule: [
          {
            date: "2026-05-10",
            startTime: "09:00",
            endTime: "11:00",
            title: "Opening Ceremony",
            description: "Official opening program and keynote address.",
          },
          {
            date: "2026-05-11",
            startTime: "13:00",
            endTime: "16:00",
            title: "Startup Pitch Session",
            description: "Student and alumni startup presentations.",
          },
          {
            date: "2026-05-13",
            startTime: "10:00",
            endTime: "15:00",
            title: "AI and Robotics Workshop",
            description: "Hands-on training on AI tools and robotics systems.",
          },
          {
            date: "2026-05-15",
            startTime: "15:00",
            endTime: "17:00",
            title: "Closing and Awarding",
            description: "Recognition of participants and closing remarks.",
          },
        ],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    await db.collection("events").deleteMany({});
    const result = await db.collection("events").insertMany(sampleEvents);

    res.json({
      message: "Sample events inserted successfully",
      insertedCount: result.insertedCount,
    });
  } catch (error) {
    console.error("POST /api/events/seed error:", error);
    res.status(500).json({ message: "Failed to seed events" });
  }
});

// Create one event manually
app.post("/api/events", async (req, res) => {
  try {
    const db = await connectDB();

    const newEvent = {
      ...req.body,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await db.collection("events").insertOne(newEvent);

    res.status(201).json({
      message: "Event created successfully",
      insertedId: result.insertedId,
    });
  } catch (error) {
    console.error("POST /api/events error:", error);
    res.status(500).json({ message: "Failed to create event" });
  }
});

/* -------------------- ANNOUNCEMENTS -------------------- */

app.get("/api/announcements", async (req, res) => {
  try {
    const db = await connectDB();
    const announcements = await db.collection("announcements").find({}).toArray();
    res.json(announcements);
  } catch (error) {
    console.error("GET /api/announcements error:", error);
    res.status(500).json({ message: "Failed to fetch announcements" });
  }
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});