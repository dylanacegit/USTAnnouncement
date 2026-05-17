const connectDB = require("../db");

async function getAllAnnouncements() {
  const db = await connectDB();

  return db
    .collection("announcements")
    .find({})
    .sort({ createdAt: -1 })
    .toArray();
}

async function getEventAnnouncements(eventTitle) {
  const db = await connectDB();

  return db
    .collection("announcements")
    .find({ type: "event", eventTitle })
    .sort({ createdAt: -1 })
    .toArray();
}

async function getPublishedAnnouncements() {
  const db = await connectDB();

  return db
    .collection("announcements")
    .find({ status: "published" })
    .sort({ createdAt: -1 })
    .toArray();
}

async function createAnnouncement(announcementData) {
  const db = await connectDB();
  const now = new Date();

  const announcement = {
    ...announcementData,
    status: "published",
    createdAt: now,
    updatedAt: now,
  };

  const result = await db.collection("announcements").insertOne(announcement);

  return db.collection("announcements").findOne({ _id: result.insertedId });
}

function buildAuditFields(actor) {
  return {
    updatedBy: actor?.name || "Admin",
    updatedByEmail: actor?.email || "",
  };
}

async function updateAnnouncement(announcementId, announcementData) {
  const db = await connectDB();

  const result = await db.collection("announcements").updateOne(
    { _id: announcementId },
    {
      $set: {
        ...announcementData,
        updatedAt: new Date(),
      },
    }
  );

  if (result.matchedCount === 0) return null;

  return db.collection("announcements").findOne({ _id: announcementId });
}

async function updateAnnouncementStatus(announcementId, status, actor) {
  const db = await connectDB();

  const result = await db.collection("announcements").updateOne(
    { _id: announcementId },
    {
      $set: {
        status,
        ...buildAuditFields(actor),
        updatedAt: new Date(),
      },
    }
  );

  if (result.matchedCount === 0) return null;

  return db.collection("announcements").findOne({ _id: announcementId });
}

async function updateAnnouncementFeatured(announcementId, isAdminFeatured, actor) {
  const db = await connectDB();
  const now = new Date();
  const auditFields = buildAuditFields(actor);

  if (isAdminFeatured) {
    await db.collection("announcements").updateMany(
      { _id: { $ne: announcementId } },
      {
        $set: {
          isAdminFeatured: false,
          ...auditFields,
          updatedAt: now,
        },
      }
    );
  }

  const result = await db.collection("announcements").updateOne(
    { _id: announcementId },
    {
      $set: {
        isAdminFeatured,
        ...auditFields,
        updatedAt: now,
      },
    }
  );

  if (result.matchedCount === 0) return null;

  return db.collection("announcements").findOne({ _id: announcementId });
}

async function deleteAnnouncement(announcementId) {
  const db = await connectDB();
  const result = await db
    .collection("announcements")
    .deleteOne({ _id: announcementId });

  return result.deletedCount > 0;
}

module.exports = {
  createAnnouncement,
  deleteAnnouncement,
  getAllAnnouncements,
  getEventAnnouncements,
  getPublishedAnnouncements,
  updateAnnouncement,
  updateAnnouncementFeatured,
  updateAnnouncementStatus,
};
