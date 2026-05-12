const express = require("express");
const cors = require("cors");
const rateLimit = require("express-rate-limit");

const accountsRoutes = require("./routes/accounts.routes");
const aiRoutes = require("./routes/ai.routes");
const announcementsRoutes = require("./routes/announcements.routes");
const eventsRoutes = require("./routes/events.routes");

const app = express();

const aiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 20,
  message: {
    message: "Too many AI requests. Please try again in a minute.",
  },
});

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Backend is running");
});

app.use("/api/events", eventsRoutes);
app.use("/api/announcements", announcementsRoutes);
app.use("/api/accounts", accountsRoutes);
app.use("/api/ai", aiLimiter, aiRoutes);

module.exports = app;
