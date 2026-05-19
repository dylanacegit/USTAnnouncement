const express = require("express");
const {
  createEvent,
  deleteEvent,
  getAllEvents,
  updateEvent,
  updateEventFeatured,
  updateEventStatus,
} = require("../services/events.service");
const {
  isAllowedValue,
  isValidObjectId,
  toObjectId,
} = require("../utils/validators");
const { requireAdmin, requireAuth } = require("../middleware/auth.middleware");
const { getUserAttribution } = require("../utils/attribution");

const router = express.Router();
const MAX_IMAGE_LENGTH = 2.75 * 1024 * 1024;
const MAX_SCHEDULE_IMAGE_LENGTH = 1.5 * 1024 * 1024;
const LIMITS = {
  title: 120,
  category: 60,
  description: 1000,
  location: 160,
  organizer: 120,
  scheduleTitle: 120,
  scheduleDescription: 500,
};

function cleanText(value) {
  return typeof value === "string" ? value.trim() : "";
}

function cleanOptionalText(value) {
  return typeof value === "string" ? value.trim() : "";
}

function isValidDateInput(value) {
  if (!value) return false;

  const parsed = new Date(value);
  return !Number.isNaN(parsed.valueOf());
}

function normalizeSchedule(schedule) {
  if (!Array.isArray(schedule)) return [];

  return schedule
    .map((item, index) => ({
      day: cleanText(item.day) || `Day ${index + 1}`,
      date: cleanOptionalText(item.date),
      startTime: cleanOptionalText(item.startTime),
      endTime: cleanOptionalText(item.endTime),
      title: cleanOptionalText(item.title),
      description: cleanOptionalText(item.description),
      image: cleanOptionalText(item.image),
    }))
    .filter(
      (item) =>
        item.date ||
        item.startTime ||
        item.endTime ||
        item.title ||
        item.description ||
        item.image
    );
}

function hasTooLongText(value, maxLength) {
  return value.length > maxLength;
}

function validateSchedule(schedule, startDate, endDate) {
  for (const item of schedule) {
    if (hasTooLongText(item.title, LIMITS.scheduleTitle)) {
      return "Schedule activity titles must be 120 characters or fewer.";
    }

    if (hasTooLongText(item.description, LIMITS.scheduleDescription)) {
      return "Schedule details must be 500 characters or fewer.";
    }

    if (item.image && item.image.length > MAX_SCHEDULE_IMAGE_LENGTH) {
      return "Each schedule image must be smaller than 1 MB.";
    }

    if (item.startTime && item.endTime && item.endTime < item.startTime) {
      return "Schedule end time cannot be before schedule start time.";
    }

    if (
      item.date &&
      (new Date(item.date) < new Date(startDate) ||
        new Date(item.date) > new Date(endDate))
    ) {
      return "Schedule dates must be within the event date range.";
    }
  }

  return null;
}

function buildEventPayload(body, attributionField) {
  const title = cleanText(body.title);
  const category = cleanText(body.category);
  const description = cleanText(body.description);
  const startDate = cleanText(body.startDate);
  const endDate = cleanText(body.endDate);
  const location = cleanText(body.location);
  const organizer = cleanText(body.organizer);
  const startTime = cleanOptionalText(body.startTime);
  const endTime = cleanOptionalText(body.endTime);
  const image = cleanOptionalText(body.image);
  const attribution = cleanOptionalText(body[attributionField]) || "Admin";

  if (!title) return { error: "Title is required." };
  if (hasTooLongText(title, LIMITS.title)) {
    return { error: "Title must be 120 characters or fewer." };
  }
  if (!category) return { error: "Category is required." };
  if (hasTooLongText(category, LIMITS.category)) {
    return { error: "Category must be 60 characters or fewer." };
  }
  if (!description) return { error: "Description is required." };
  if (hasTooLongText(description, LIMITS.description)) {
    return { error: "Description must be 1000 characters or fewer." };
  }
  if (!isValidDateInput(startDate)) return { error: "Start date is required." };
  if (!isValidDateInput(endDate)) return { error: "End date is required." };
  if (new Date(endDate) < new Date(startDate)) {
    return { error: "End date cannot be before start date." };
  }
  if (startDate === endDate && startTime && endTime && endTime < startTime) {
    return { error: "End time cannot be before start time." };
  }
  if (!location) return { error: "Location is required." };
  if (hasTooLongText(location, LIMITS.location)) {
    return { error: "Location must be 160 characters or fewer." };
  }
  if (!organizer) return { error: "Organizer is required." };
  if (hasTooLongText(organizer, LIMITS.organizer)) {
    return { error: "Organizer must be 120 characters or fewer." };
  }
  if (image && image.length > MAX_IMAGE_LENGTH) {
    return { error: "Event photo must be smaller than 2 MB." };
  }

  const schedule = normalizeSchedule(body.schedule);
  const scheduleError = validateSchedule(schedule, startDate, endDate);

  if (scheduleError) return { error: scheduleError };

  return {
    payload: {
      title,
      category,
      description,
      startDate,
      endDate,
      startTime,
      endTime,
      location,
      organizer,
      image,
      schedule,
      [attributionField]: attribution,
    },
  };
}

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

router.post("/", requireAuth, requireAdmin, async (req, res) => {
  try {
    const { payload, error } = buildEventPayload(req.body, "createdBy");

    if (error) return res.status(400).json({ message: error });

    const admin = getUserAttribution(req, "Admin");
    const event = await createEvent({
      ...payload,
      createdBy: admin.name,
      createdByEmail: admin.email,
    });

    res.status(201).json(event);
  } catch (error) {
    console.error("POST /api/events error:", error);
    res.status(500).json({ message: "Failed to create event" });
  }
});

router.put("/:id", requireAuth, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({ message: "Invalid event ID." });
    }

    const { payload, error } = buildEventPayload(req.body, "updatedBy");

    if (error) return res.status(400).json({ message: error });

    const admin = getUserAttribution(req, "Admin");
    const updatedEvent = await updateEvent(toObjectId(id), {
      ...payload,
      updatedBy: admin.name,
      updatedByEmail: admin.email,
    });

    if (!updatedEvent) {
      return res.status(404).json({ message: "Event not found." });
    }

    res.json(updatedEvent);
  } catch (error) {
    console.error("PUT /api/events/:id error:", error);
    res.status(500).json({ message: "Failed to update event" });
  }
});

router.patch("/:id", requireAuth, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { status, isFeatured } = req.body;

    if (!isValidObjectId(id)) {
      return res.status(400).json({ message: "Invalid event ID." });
    }

    if (status !== undefined && isFeatured !== undefined) {
      return res.status(400).json({ message: "Update one event field at a time." });
    }

    let updatedEvent = null;

    if (status !== undefined) {
      if (!isAllowedValue(status, ["published", "archived"])) {
        return res.status(400).json({ message: "Invalid event status." });
      }

      updatedEvent = await updateEventStatus(
        toObjectId(id),
        status,
        getUserAttribution(req, "Admin")
      );
    } else if (isFeatured !== undefined) {
      updatedEvent = await updateEventFeatured(
        toObjectId(id),
        Boolean(isFeatured),
        getUserAttribution(req, "Admin")
      );
    } else {
      return res.status(400).json({ message: "No event update provided." });
    }

    if (!updatedEvent) {
      return res.status(404).json({ message: "Event not found." });
    }

    res.json(updatedEvent);
  } catch (error) {
    console.error("PATCH /api/events/:id error:", error);
    res.status(500).json({ message: "Failed to update event" });
  }
});

router.delete("/:id", requireAuth, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({ message: "Invalid event ID." });
    }

    const deleted = await deleteEvent(toObjectId(id));

    if (!deleted) {
      return res.status(404).json({ message: "Event not found." });
    }

    res.json({ message: "Event deleted successfully." });
  } catch (error) {
    console.error("DELETE /api/events/:id error:", error);
    res.status(500).json({ message: "Failed to delete event" });
  }
});

module.exports = router;
