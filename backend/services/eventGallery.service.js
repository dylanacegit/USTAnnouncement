const connectDB = require("../db");

const COLLECTION = "event_gallery";

async function getEventGalleryItems(eventId) {
  const db = await connectDB();

  return db
    .collection(COLLECTION)
    .find({ eventId })
    .sort({ createdAt: -1 })
    .toArray();
}

async function createEventGalleryItem(galleryData) {
  const db = await connectDB();
  const now = new Date();
  const item = {
    ...galleryData,
    createdAt: now,
    updatedAt: now,
  };

  const result = await db.collection(COLLECTION).insertOne(item);

  return db.collection(COLLECTION).findOne({ _id: result.insertedId });
}

module.exports = {
  createEventGalleryItem,
  getEventGalleryItems,
};
