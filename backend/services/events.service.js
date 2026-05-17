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

async function getNextEventId(db) {
  const latestEvent = await db
    .collection("events")
    .find({ eventId: { $type: "number" } })
    .sort({ eventId: -1 })
    .limit(1)
    .next();

  return (latestEvent?.eventId || 0) + 1;
}

async function createEvent(eventData) {
  const db = await connectDB();
  const now = new Date();
  const eventId = await getNextEventId(db);

  const event = {
    eventId,
    ...eventData,
    status: "published",
    isFeatured: false,
    createdAt: now,
    updatedAt: now,
  };

  const result = await db.collection("events").insertOne(event);

  return db.collection("events").findOne({ _id: result.insertedId });
}

function buildAuditFields(actor) {
  return {
    updatedBy: actor?.name || "Admin",
    updatedByEmail: actor?.email || "",
  };
}

async function updateEventStatus(eventId, status, actor) {
  const db = await connectDB();

  const result = await db.collection("events").updateOne(
    { _id: eventId },
    {
      $set: {
        status,
        ...buildAuditFields(actor),
        updatedAt: new Date(),
      },
    }
  );

  if (result.matchedCount === 0) return null;

  return db.collection("events").findOne({ _id: eventId });
}

async function updateEvent(eventId, eventData) {
  const db = await connectDB();

  const result = await db.collection("events").updateOne(
    { _id: eventId },
    {
      $set: {
        ...eventData,
        updatedAt: new Date(),
      },
    }
  );

  if (result.matchedCount === 0) return null;

  return db.collection("events").findOne({ _id: eventId });
}

async function updateEventFeatured(eventId, isFeatured, actor) {
  const db = await connectDB();
  const now = new Date();
  const auditFields = buildAuditFields(actor);

  if (isFeatured) {
    await db.collection("events").updateMany(
      { _id: { $ne: eventId }, isFeatured: true },
      {
        $set: {
          isFeatured: false,
          ...auditFields,
          updatedAt: now,
        },
      }
    );
  }

  const result = await db.collection("events").updateOne(
    { _id: eventId },
    {
      $set: {
        isFeatured: Boolean(isFeatured),
        ...auditFields,
        updatedAt: new Date(),
      },
    }
  );

  if (result.matchedCount === 0) return null;

  return db.collection("events").findOne({ _id: eventId });
}

async function deleteEvent(eventId) {
  const db = await connectDB();
  const result = await db.collection("events").deleteOne({ _id: eventId });

  return result.deletedCount > 0;
}

module.exports = {
  createEvent,
  deleteEvent,
  getAllEvents,
  getPublishedEvents,
  updateEvent,
  updateEventFeatured,
  updateEventStatus,
};
