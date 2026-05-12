const connectDB = require("../db");

async function getAllEvents() {
  const db = await connectDB();

  return db.collection("events").find({}).sort({ createdAt: -1 }).toArray();
}

async function getPublishedEvents() {
  const db = await connectDB();

  return db
    .collection("events")
    .find({ status: "published" })
    .sort({ startDate: 1 })
    .toArray();
}

async function updateEventStatus(eventId, status) {
  const db = await connectDB();

  const result = await db.collection("events").updateOne(
    { _id: eventId },
    {
      $set: {
        status,
        updatedAt: new Date(),
      },
    }
  );

  if (result.matchedCount === 0) return null;

  return db.collection("events").findOne({ _id: eventId });
}

module.exports = {
  getAllEvents,
  getPublishedEvents,
  updateEventStatus,
};
