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

async function updateAnnouncementStatus(announcementId, status) {
  const db = await connectDB();

  const result = await db.collection("announcements").updateOne(
    { _id: announcementId },
    {
      $set: {
        status,
        updatedAt: new Date(),
      },
    }
  );

  if (result.matchedCount === 0) return null;

  return db.collection("announcements").findOne({ _id: announcementId });
}

module.exports = {
  getAllAnnouncements,
  getEventAnnouncements,
  getPublishedAnnouncements,
  updateAnnouncementStatus,
};
