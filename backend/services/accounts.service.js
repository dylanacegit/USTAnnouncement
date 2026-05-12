const connectDB = require("../db");

async function getAllAccounts() {
  const db = await connectDB();

  return db.collection("accounts").find({}).sort({ createdAt: -1 }).toArray();
}

async function updateAccount(accountId, updates) {
  const db = await connectDB();

  const result = await db.collection("accounts").updateOne(
    { _id: accountId },
    { $set: updates }
  );

  if (result.matchedCount === 0) return null;

  return db.collection("accounts").findOne({ _id: accountId });
}

async function deleteAccount(accountId) {
  const db = await connectDB();
  const result = await db.collection("accounts").deleteOne({ _id: accountId });

  return result.deletedCount > 0;
}

module.exports = {
  deleteAccount,
  getAllAccounts,
  updateAccount,
};
