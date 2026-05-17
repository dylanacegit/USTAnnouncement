const connectDB = require("../db");

const COLLECTION = "event_gallery";

async function getEventGalleryItems(eventId) {
  const db = await connectDB();

  return db
    .collection(COLLECTION)
    .find({ eventId, status: "approved" })
    .sort({ createdAt: -1 })
    .toArray();
}

async function getRecentEventGalleryItems(limit = 6) {
  const db = await connectDB();

  return db
    .collection(COLLECTION)
    .find({ status: "approved" })
    .sort({ createdAt: -1 })
    .limit(limit)
    .toArray();
}

async function getApprovedEventGalleryItems() {
  const db = await connectDB();

  return db
    .collection(COLLECTION)
    .find({ status: "approved" })
    .sort({ reviewedAt: -1, createdAt: -1 })
    .toArray();
}

async function getGalleryReviewItems() {
  const db = await connectDB();

  return db
    .collection(COLLECTION)
    .find({ status: "pending" })
    .sort({ createdAt: 1 })
    .toArray();
}

async function createEventGalleryItem(galleryData) {
  const db = await connectDB();
  const now = new Date();
  const item = {
    status: "pending",
    visibility: "hidden",
    ...galleryData,
    createdAt: now,
    updatedAt: now,
  };

  const result = await db.collection(COLLECTION).insertOne(item);

  return db.collection(COLLECTION).findOne({ _id: result.insertedId });
}

async function approveEventGalleryItem(itemId, reviewer) {
  const db = await connectDB();
  const now = new Date();
  const result = await db.collection(COLLECTION).findOneAndUpdate(
    { _id: itemId, status: "pending" },
    {
      $set: {
        status: "approved",
        visibility: "visible",
        reviewedAt: now,
        reviewedBy: reviewer,
        updatedAt: now,
      },
    },
    { returnDocument: "after" }
  );

  return result;
}

async function declineAndDeleteEventGalleryItem(itemId, reviewer, reason) {
  const db = await connectDB();
  const item = await db.collection(COLLECTION).findOne({ _id: itemId });

  if (!item) return null;

  await db.collection(COLLECTION).deleteOne({ _id: itemId });

  return {
    ...item,
    status: "declined",
    visibility: "deleted",
    reviewedAt: new Date(),
    reviewedBy: reviewer,
    declineReason: reason,
  };
}

async function deleteApprovedEventGalleryItems(itemIds) {
  const db = await connectDB();

  if (!Array.isArray(itemIds) || itemIds.length === 0) {
    return { deletedCount: 0 };
  }

  return db.collection(COLLECTION).deleteMany({
    _id: { $in: itemIds },
    status: "approved",
  });
}

module.exports = {
  approveEventGalleryItem,
  createEventGalleryItem,
  deleteApprovedEventGalleryItems,
  declineAndDeleteEventGalleryItem,
  getApprovedEventGalleryItems,
  getEventGalleryItems,
  getGalleryReviewItems,
  getRecentEventGalleryItems,
};
