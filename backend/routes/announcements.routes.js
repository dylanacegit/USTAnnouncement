const express = require("express");
const {
  createAnnouncement,
  deleteAnnouncement,
  getAllAnnouncements,
  getEventAnnouncements,
  updateAnnouncement,
  updateAnnouncementFeatured,
  updateAnnouncementStatus,
} = require("../services/announcements.service");
const {
  isAllowedValue,
  isValidObjectId,
  toObjectId,
} = require("../utils/validators");
const { requireAdmin, requireAuth } = require("../middleware/auth.middleware");
const { getUserAttribution } = require("../utils/attribution");

const router = express.Router();
const MAX_IMAGE_LENGTH = 2.75 * 1024 * 1024;
const LIMITS = {
  title: 140,
  content: 1200,
  category: 80,
  eventTitle: 140,
  createdBy: 120,
};

function cleanText(value) {
  return typeof value === "string" ? value.trim() : "";
}

function cleanOptionalText(value) {
  return typeof value === "string" ? value.trim() : "";
}

function hasTooLongText(value, maxLength) {
  return value.length > maxLength;
}

function buildAnnouncementPayload(body, attributionField) {
  const title = cleanText(body.title);
  const content = cleanText(body.content || body.caption);
  const type = cleanText(body.type || "general").toLowerCase();
  const eventTitle = cleanOptionalText(body.eventTitle);
  const category = cleanOptionalText(body.category);
  const priority = cleanText(body.priority || "medium").toLowerCase();
  const image = cleanOptionalText(body.image || body.imageUrl || body.bannerImage);
  const attribution = cleanOptionalText(body[attributionField]) || "Admin";

  if (!title) return { error: "Title is required." };
  if (hasTooLongText(title, LIMITS.title)) {
    return { error: "Title must be 140 characters or fewer." };
  }
  if (!content) return { error: "Content is required." };
  if (hasTooLongText(content, LIMITS.content)) {
    return { error: "Content must be 1200 characters or fewer." };
  }
  if (!isAllowedValue(type, ["general", "event"])) {
    return { error: "Announcement type must be general or event." };
  }
  if (type === "event" && !eventTitle) {
    return { error: "Event title is required for event announcements." };
  }
  if (hasTooLongText(eventTitle, LIMITS.eventTitle)) {
    return { error: "Event title must be 140 characters or fewer." };
  }
  if (hasTooLongText(category, LIMITS.category)) {
    return { error: "Category must be 80 characters or fewer." };
  }
  if (!isAllowedValue(priority, ["low", "medium", "high"])) {
    return { error: "Priority must be low, medium, or high." };
  }
  if (image && image.length > MAX_IMAGE_LENGTH) {
    return { error: "Announcement photo must be smaller than 2 MB." };
  }
  if (hasTooLongText(attribution, LIMITS.createdBy)) {
    return { error: "Admin attribution must be 120 characters or fewer." };
  }

  return {
    payload: {
      title,
      content,
      type,
      eventTitle: type === "event" ? eventTitle : "",
      category,
      priority,
      image,
      [attributionField]: attribution,
    },
  };
}

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

router.post("/", requireAuth, requireAdmin, async (req, res) => {
  try {
    const { payload, error } = buildAnnouncementPayload(req.body, "createdBy");

    if (error) return res.status(400).json({ message: error });

    const admin = getUserAttribution(req, "Admin");
    const announcement = await createAnnouncement({
      ...payload,
      createdBy: admin.name,
      createdByEmail: admin.email,
      updatedBy: admin.name,
      updatedByEmail: admin.email,
    });

    res.status(201).json(announcement);
  } catch (error) {
    console.error("POST /api/announcements error:", error);
    res.status(500).json({ message: "Failed to create announcement" });
  }
});

router.put("/:id", requireAuth, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({ message: "Invalid announcement ID." });
    }

    const { payload, error } = buildAnnouncementPayload(req.body, "updatedBy");

    if (error) return res.status(400).json({ message: error });

    const admin = getUserAttribution(req, "Admin");
    const updatedAnnouncement = await updateAnnouncement(toObjectId(id), {
      ...payload,
      updatedBy: admin.name,
      updatedByEmail: admin.email,
    });

    if (!updatedAnnouncement) {
      return res.status(404).json({ message: "Announcement not found." });
    }

    res.json(updatedAnnouncement);
  } catch (error) {
    console.error("PUT /api/announcements/:id error:", error);
    res.status(500).json({ message: "Failed to update announcement" });
  }
});

router.patch("/:id", requireAuth, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { isAdminFeatured, status } = req.body;

    if (!isValidObjectId(id)) {
      return res.status(400).json({ message: "Invalid announcement ID." });
    }

    if (typeof isAdminFeatured === "boolean") {
      const updatedAnnouncement = await updateAnnouncementFeatured(
        toObjectId(id),
        isAdminFeatured,
        getUserAttribution(req, "Admin")
      );

      if (!updatedAnnouncement) {
        return res.status(404).json({ message: "Announcement not found." });
      }

      return res.json(updatedAnnouncement);
    }

    if (!isAllowedValue(status, ["published", "archived"])) {
      return res.status(400).json({ message: "Invalid announcement status." });
    }

    const updatedAnnouncement = await updateAnnouncementStatus(
      toObjectId(id),
      status,
      getUserAttribution(req, "Admin")
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

router.delete("/:id", requireAuth, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({ message: "Invalid announcement ID." });
    }

    const deleted = await deleteAnnouncement(toObjectId(id));

    if (!deleted) {
      return res.status(404).json({ message: "Announcement not found." });
    }

    res.json({ message: "Announcement deleted successfully." });
  } catch (error) {
    console.error("DELETE /api/announcements/:id error:", error);
    res.status(500).json({ message: "Failed to delete announcement" });
  }
});

module.exports = router;
