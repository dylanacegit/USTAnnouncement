const express = require("express");
const { ObjectId } = require("mongodb");
const connectDB = require("../db");
const { requireAuth } = require("../middleware/auth.middleware");
const { isValidObjectId } = require("../utils/validators");

const router = express.Router();

router.use(requireAuth);

function getBookmarkIds(user) {
  return Array.isArray(user.bookmarked_event_ids)
    ? user.bookmarked_event_ids.map((id) => id.toString())
    : [];
}

function getEventIdQuery(eventId) {
  const query = [{ _id: eventId }];

  if (isValidObjectId(eventId)) {
    query.push({ _id: new ObjectId(eventId) });
  }

  return { $or: query };
}

function getBookmarkValue(event) {
  return event._id instanceof ObjectId ? event._id : event._id.toString();
}

router.get("/", async (req, res) => {
  res.json({ eventIds: getBookmarkIds(req.userRecord) });
});

router.post("/:eventId", async (req, res) => {
  try {
    const { eventId } = req.params;

    const db = await connectDB();
    const event = await db.collection("events").findOne(getEventIdQuery(eventId));

    if (!event) {
      return res.status(404).json({ message: "Event not found." });
    }

    const bookmarkValue = getBookmarkValue(event);

    await db.collection("users").updateOne(
      { _id: req.userRecord._id },
      {
        $addToSet: { bookmarked_event_ids: bookmarkValue },
        $set: {
          updated_by: req.user?.email || "User",
          updated_at: new Date(),
        },
      }
    );

    const updatedUser = await db.collection("users").findOne({ _id: req.userRecord._id });

    res.json({ eventIds: getBookmarkIds(updatedUser) });
  } catch (error) {
    console.error("POST /api/bookmarks/:eventId error:", error);
    res.status(500).json({ message: "Failed to bookmark event." });
  }
});

router.delete("/:eventId", async (req, res) => {
  try {
    const { eventId } = req.params;

    const db = await connectDB();
    const pullValues = [eventId];

    if (isValidObjectId(eventId)) {
      pullValues.push(new ObjectId(eventId));
    }

    await db.collection("users").updateOne(
      { _id: req.userRecord._id },
      {
        $pull: { bookmarked_event_ids: { $in: pullValues } },
        $set: {
          updated_by: req.user?.email || "User",
          updated_at: new Date(),
        },
      }
    );

    const updatedUser = await db.collection("users").findOne({ _id: req.userRecord._id });

    res.json({ eventIds: getBookmarkIds(updatedUser) });
  } catch (error) {
    console.error("DELETE /api/bookmarks/:eventId error:", error);
    res.status(500).json({ message: "Failed to remove bookmark." });
  }
});

module.exports = router;
