const express = require("express");
const {
  getAllAnnouncements,
  getEventAnnouncements,
  updateAnnouncementStatus,
} = require("../services/announcements.service");
const {
  isAllowedValue,
  isValidObjectId,
  toObjectId,
} = require("../utils/validators");

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const announcements = await getAllAnnouncements();

    res.json(announcements);
  } catch (error) {
    console.error("GET /api/announcements FULL ERROR:", error);
    res.status(500).json({
      message: "Failed to fetch announcements",
      error: error.message,
    });
  }
});

router.get("/event/:eventTitle", async (req, res) => {
  try {
    const { eventTitle } = req.params;
    const announcements = await getEventAnnouncements(eventTitle);

    res.json(announcements);
  } catch (error) {
    console.error("GET /api/announcements/event/:eventTitle error:", error);
    res.status(500).json({ message: "Failed to fetch event announcements" });
  }
});

router.patch("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!isValidObjectId(id)) {
      return res.status(400).json({ message: "Invalid announcement ID." });
    }

    if (!isAllowedValue(status, ["published", "archived"])) {
      return res.status(400).json({ message: "Invalid announcement status." });
    }

    const updatedAnnouncement = await updateAnnouncementStatus(
      toObjectId(id),
      status
    );

    if (!updatedAnnouncement) {
      return res.status(404).json({ message: "Announcement not found." });
    }

    res.json(updatedAnnouncement);
  } catch (error) {
    console.error("PATCH /api/announcements/:id error:", error);
    res.status(500).json({ message: "Failed to update announcement" });
  }
});

module.exports = router;
