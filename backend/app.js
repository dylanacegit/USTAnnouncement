const express = require("express");
const cors = require("cors");
const rateLimit = require("express-rate-limit");

const authRoutes = require("./routes/auth.routes");
const accountsRoutes = require("./routes/accounts.routes");
const aiRoutes = require("./routes/ai.routes");
const announcementsRoutes = require("./routes/announcements.routes");
const bookmarksRoutes = require("./routes/bookmarks.routes");
const eventGalleryRoutes = require("./routes/eventGallery.routes");
const eventsRoutes = require("./routes/events.routes");
const { testEmail } = require("./controllers/auth.controller");

const app = express();

const aiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 20,
  message: {
    message: "Too many AI requests. Please try again in a minute.",
  },
});

app.use(cors({
  origin: process.env.CLIENT_URL || process.env.CLIENT_ORIGIN || "http://localhost:5173",
  credentials: true,
}));
app.use(express.json({ limit: "8mb" }));

app.get("/", (req, res) => {
  res.send("Backend is running");
});

app.get("/api/test-email", testEmail);

app.use("/api/events", eventsRoutes);
app.use("/api/event-gallery", eventGalleryRoutes);
app.use("/api/announcements", announcementsRoutes);
app.use("/api/accounts", accountsRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/bookmarks", bookmarksRoutes);
app.use("/api/ai", aiLimiter, aiRoutes);

app.use((error, req, res, next) => {
  if (error.type === "entity.too.large") {
    return res.status(413).json({
      message: "Upload is too large. Please choose smaller event images.",
    });
  }

  next(error);
});

module.exports = app;
