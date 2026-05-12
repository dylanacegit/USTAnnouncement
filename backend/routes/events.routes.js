const express = require("express");
const {
  getAllEvents,
  updateEventStatus,
} = require("../services/events.service");
const {
  isAllowedValue,
  isValidObjectId,
  toObjectId,
} = require("../utils/validators");

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const events = await getAllEvents();

    res.json(events);
  } catch (error) {
    console.error("GET /api/events FULL ERROR:", error);
    res
      .status(500)
      .json({ message: "Failed to fetch events", error: error.message });
  }
});

router.patch("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!isValidObjectId(id)) {
      return res.status(400).json({ message: "Invalid event ID." });
    }

    if (!isAllowedValue(status, ["published", "archived"])) {
      return res.status(400).json({ message: "Invalid event status." });
    }

    const updatedEvent = await updateEventStatus(toObjectId(id), status);

    if (!updatedEvent) {
      return res.status(404).json({ message: "Event not found." });
    }

    res.json(updatedEvent);
  } catch (error) {
    console.error("PATCH /api/events/:id error:", error);
    res.status(500).json({ message: "Failed to update event" });
  }
});

module.exports = router;
