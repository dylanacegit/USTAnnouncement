const express = require("express");
const { ObjectId } = require("mongodb");
const connectDB = require("../db");
const { requireAdmin, requireAuth } = require("../middleware/auth.middleware");
const {
  approveEventGalleryItem,
  createEventGalleryItem,
  deleteApprovedEventGalleryItems,
  declineAndDeleteEventGalleryItem,
  getApprovedEventGalleryItems,
  getEventGalleryItems,
  getGalleryReviewItems,
  getRecentEventGalleryItems,
} = require("../services/eventGallery.service");
const { createNotification } = require("../services/notifications.service");
const { moderateGalleryImage } = require("../services/visionModeration.service");
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

function getVisionErrorMessage(error, fallback) {
  if (
    error.message?.includes("requires billing to be enabled") ||
    error.message?.includes("billing/enable")
  ) {
    return "Google Vision AI requires billing to be enabled for this project. Enable billing in Google Cloud, then try again after a few minutes.";
  }

  if (
    error.message?.includes("Could not load the default credentials") ||
    error.message?.includes("GOOGLE_APPLICATION_CREDENTIALS")
  ) {
    return "Google Vision AI is not configured. Add GOOGLE_APPLICATION_CREDENTIALS to backend/.env.";
  }

  return fallback;
}

router.get("/", async (req, res) => {
  try {
    const requestedLimit = Number.parseInt(req.query.limit, 10);
    const limit = Number.isFinite(requestedLimit)
      ? Math.min(Math.max(requestedLimit, 1), 12)
      : 6;
    const items = await getRecentEventGalleryItems(limit);

    res.json(items);
  } catch (error) {
    console.error("GET /api/event-gallery error:", error);
    res.status(500).json({ message: "Failed to fetch recent event highlights." });
  }
});

router.post("/moderate-preview", requireAuth, requireAdmin, async (req, res) => {
  try {
    const image = cleanText(req.body.image);

    if (!image || !image.startsWith("data:image/")) {
      return res.status(400).json({ message: "A valid image is required." });
    }

    const moderation = await moderateGalleryImage(image);

    res.json(moderation);
  } catch (error) {
    console.error("POST /api/event-gallery/moderate-preview error:", error);
    res.status(502).json({
      message: getVisionErrorMessage(
        error,
        "Google Vision AI moderation failed. Please try again."
      ),
    });
  }
});

router.get("/admin/review", requireAuth, requireAdmin, async (req, res) => {
  try {
    const items = await getGalleryReviewItems();

    res.json(items);
  } catch (error) {
    console.error("GET /api/event-gallery/admin/review error:", error);
    res.status(500).json({ message: "Failed to load gallery approvals." });
  }
});

router.get("/admin/approved", requireAuth, requireAdmin, async (req, res) => {
  try {
    const items = await getApprovedEventGalleryItems();

    res.json(items);
  } catch (error) {
    console.error("GET /api/event-gallery/admin/approved error:", error);
    res.status(500).json({ message: "Failed to load approved gallery photos." });
  }
});

router.post("/admin/approved/delete", requireAuth, requireAdmin, async (req, res) => {
  try {
    const ids = Array.isArray(req.body.ids) ? req.body.ids : [];

    if (ids.length === 0) {
      return res.status(400).json({ message: "Select at least one photo to delete." });
    }

    const invalidId = ids.find((id) => !isValidObjectId(id));

    if (invalidId) {
      return res.status(400).json({ message: "Invalid gallery photo ID." });
    }

    const result = await deleteApprovedEventGalleryItems(
      ids.map((id) => new ObjectId(id))
    );

    res.json({ deletedCount: result.deletedCount || 0 });
  } catch (error) {
    console.error("POST /api/event-gallery/admin/approved/delete error:", error);
    res.status(500).json({ message: "Failed to delete gallery photos." });
  }
});

router.patch("/admin/review/:id", requireAuth, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const action = cleanText(req.body.action).toLowerCase();
    const reason = cleanText(req.body.reason);

    if (!isValidObjectId(id)) {
      return res.status(400).json({ message: "Invalid gallery photo ID." });
    }

    if (!["approve", "decline"].includes(action)) {
      return res.status(400).json({ message: "Review action must be approve or decline." });
    }

    const reviewer = req.user?.email || "Admin";
    const itemId = new ObjectId(id);
    const item =
      action === "approve"
        ? await approveEventGalleryItem(itemId, reviewer)
        : await declineAndDeleteEventGalleryItem(
            itemId,
            reviewer,
            reason || "Declined by admin review."
          );

    if (!item) {
      return res.status(404).json({ message: "Gallery photo was not found." });
    }

    await createNotification({
      userId: item.submittedBy,
      type: action === "approve" ? "gallery_approved" : "gallery_declined",
      title: action === "approve" ? "Gallery photo posted" : "Gallery photo declined",
      message:
        action === "approve"
          ? `"${item.title}" has been approved and posted to ${item.eventTitle}.`
          : `"${item.title}" was declined during admin review.`,
      metadata: {
        galleryId: item._id?.toString(),
        eventId: item.eventId,
        eventTitle: item.eventTitle,
      },
    });

    res.json({ item, action });
  } catch (error) {
    console.error("PATCH /api/event-gallery/admin/review/:id error:", error);
    res.status(500).json({ message: "Failed to review gallery photo." });
  }
});

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

    const moderation = await moderateGalleryImage(payload.image);

    if (!moderation.approved) {
      await createNotification({
        userId: req.user?.id,
        type: "gallery_ai_rejected",
        title: "Gallery photo rejected",
        message: `"${payload.title}" did not pass automated safety moderation.`,
        metadata: {
          eventId: getStoredEventId(event),
          eventTitle: event.title || "",
          reason: moderation.reason,
        },
      });

      return res.status(422).json({
        message: moderation.reason,
        moderation,
      });
    }

    const item = await createEventGalleryItem({
      ...payload,
      eventId: getStoredEventId(event),
      eventTitle: event.title || "",
      moderation,
    });

    await createNotification({
      userId: req.user?.id,
      type: "gallery_pending",
      title: "Gallery photo pending review",
      message: `"${payload.title}" passed Vision AI and is waiting for admin approval.`,
      metadata: {
        galleryId: item._id?.toString(),
        eventId: item.eventId,
        eventTitle: item.eventTitle,
      },
    });

    res.status(202).json({
      ...item,
      message: "Photo passed Vision AI and is pending admin approval.",
    });
  } catch (error) {
    console.error("POST /api/event-gallery/:eventId error:", error);
    res.status(502).json({
      message: getVisionErrorMessage(
        error,
        "Failed to moderate and submit gallery photo."
      ),
    });
  }
});

module.exports = router;
