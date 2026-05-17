const express = require("express");
const { ObjectId } = require("mongodb");
const connectDB = require("../db");
const { requireAuth } = require("../middleware/auth.middleware");
const {
  createEventGalleryItem,
  getEventGalleryItems,
} = require("../services/eventGallery.service");
const { isValidObjectId } = require("../utils/validators");

const router = express.Router();
const MAX_IMAGE_LENGTH = 2.75 * 1024 * 1024;
const LIMITS = {
  title: 100,
  description: 100,
};

function cleanText(value) {
  return typeof value === "string" ? value.trim() : "";
}

function getEventIdQuery(eventId) {
  const query = [{ _id: eventId }];

  if (isValidObjectId(eventId)) {
    query.push({ _id: new ObjectId(eventId) });
  }

  return { $or: query };
}

function getStoredEventId(event) {
  return event._id instanceof ObjectId ? event._id.toString() : String(event._id);
}

function getSubmitterName(user) {
  const fullName = [user?.firstName, user?.lastName].filter(Boolean).join(" ").trim();

  return fullName || user?.email || "UST user";
}

function buildGalleryPayload(body, user) {
  const title = cleanText(body.title);
  const description = cleanText(body.description);
  const image = cleanText(body.image);

  if (!title) return { error: "Photo title is required." };
  if (title.length > LIMITS.title) {
    return { error: "Photo title must be 100 characters or fewer." };
  }
  if (description.length > LIMITS.description) {
    return { error: "Description must be 100 characters or fewer." };
  }
  if (!image) return { error: "Photo image is required." };
  if (!image.startsWith("data:image/")) {
    return { error: "Photo image must be a valid image file." };
  }
  if (image.length > MAX_IMAGE_LENGTH) {
    return { error: "Gallery photo must be smaller than 2 MB." };
  }

  return {
    payload: {
      title,
      description,
      image,
      submittedBy: user?.id || "",
      submittedByName: getSubmitterName(user),
      submittedByEmail: user?.email || "",
    },
  };
}

router.get("/:eventId", async (req, res) => {
  try {
    const db = await connectDB();
    const event = await db
      .collection("events")
      .findOne(getEventIdQuery(req.params.eventId));

    if (!event) {
      return res.status(404).json({ message: "Event not found." });
    }

    const items = await getEventGalleryItems(getStoredEventId(event));

    res.json(items);
  } catch (error) {
    console.error("GET /api/event-gallery/:eventId error:", error);
    res.status(500).json({ message: "Failed to fetch event gallery." });
  }
});

router.post("/:eventId", requireAuth, async (req, res) => {
  try {
    const db = await connectDB();
    const event = await db
      .collection("events")
      .findOne(getEventIdQuery(req.params.eventId));

    if (!event) {
      return res.status(404).json({ message: "Event not found." });
    }

    const { payload, error } = buildGalleryPayload(req.body, req.user);

    if (error) return res.status(400).json({ message: error });

    const item = await createEventGalleryItem({
      ...payload,
      eventId: getStoredEventId(event),
      eventTitle: event.title || "",
    });

    res.status(201).json(item);
  } catch (error) {
    console.error("POST /api/event-gallery/:eventId error:", error);
    res.status(500).json({ message: "Failed to submit gallery photo." });
  }
});

module.exports = router;
