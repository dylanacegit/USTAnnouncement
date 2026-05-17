const { ObjectId } = require("mongodb");
const connectDB = require("../db");

const COLLECTION = "notifications";

function toObjectId(value) {
  if (!value) return null;
  if (value instanceof ObjectId) return value;
  if (ObjectId.isValid(value)) return new ObjectId(value);
  return null;
}

async function createNotification({
  userId,
  type,
  title,
  message,
  metadata = {},
}) {
  const db = await connectDB();
  const userObjectId = toObjectId(userId);

  if (!userObjectId) return null;

  const user = await db.collection("users").findOne({ _id: userObjectId });
  if (user?.notifications_enabled === false) return null;

  const now = new Date();
  const notification = {
    user_id: userObjectId,
    type,
    title,
    message,
    metadata,
    read_at: null,
    created_at: now,
  };

  const result = await db.collection(COLLECTION).insertOne(notification);

  return db.collection(COLLECTION).findOne({ _id: result.insertedId });
}

async function getNotificationsForUser(userId) {
  const db = await connectDB();
  const userObjectId = toObjectId(userId);

  if (!userObjectId) return [];

  return db
    .collection(COLLECTION)
    .find({ user_id: userObjectId })
    .sort({ created_at: -1 })
    .limit(30)
    .toArray();
}

async function markNotificationRead(notificationId, userId) {
  const db = await connectDB();
  const _id = toObjectId(notificationId);
  const userObjectId = toObjectId(userId);

  if (!_id || !userObjectId) return null;

  await db.collection(COLLECTION).updateOne(
    { _id, user_id: userObjectId },
    { $set: { read_at: new Date() } }
  );

  return db.collection(COLLECTION).findOne({ _id, user_id: userObjectId });
}

async function markAllNotificationsRead(userId) {
  const db = await connectDB();
  const userObjectId = toObjectId(userId);

  if (!userObjectId) return 0;

  const result = await db.collection(COLLECTION).updateMany(
    { user_id: userObjectId, read_at: null },
    { $set: { read_at: new Date() } }
  );

  return result.modifiedCount;
}

async function clearNotificationsForUser(userId) {
  const db = await connectDB();
  const userObjectId = toObjectId(userId);

  if (!userObjectId) return 0;

  const result = await db.collection(COLLECTION).deleteMany({ user_id: userObjectId });

  return result.deletedCount;
}

module.exports = {
  clearNotificationsForUser,
  createNotification,
  getNotificationsForUser,
  markAllNotificationsRead,
  markNotificationRead,
};
