const connectDB = require("../db");
const { createAdminManagedUser } = require("./auth.service");
const { getEffectiveRole, getOccupation } = require("../utils/auth");

function toDashboardAccount(user) {
  return {
    _id: user._id,
    firstName: user.first_name,
    lastName: user.last_name,
    email: user.email,
    department: user.faculty,
    role: getEffectiveRole(user),
    occupation: getOccupation(user),
    status: user.account_status || "active",
    createdBy: user.created_by || "Registration",
    createdByEmail: user.created_by_email || "",
    createdAt: user.created_at,
    updatedBy: user.updated_by,
    updatedByEmail: user.updated_by_email || "",
    updatedAt: user.updated_at,
    isVerified: Boolean(user.is_verified),
    studentOrEmployeeNumber: user.student_employee_number,
    yearLevel: user.year_level,
  };
}

function mapAccountUpdates(updates) {
  const mappedUpdates = {};

  if (updates.status !== undefined) mappedUpdates.account_status = updates.status;
  if (updates.department !== undefined) mappedUpdates.faculty = updates.department;
  if (updates.firstName !== undefined) mappedUpdates.first_name = updates.firstName;
  if (updates.lastName !== undefined) mappedUpdates.last_name = updates.lastName;
  if (updates.email !== undefined) mappedUpdates.email = updates.email;
  if (updates.updatedBy !== undefined) mappedUpdates.updated_by = updates.updatedBy;
  if (updates.updatedByEmail !== undefined) {
    mappedUpdates.updated_by_email = updates.updatedByEmail;
  }
  if (updates.updatedAt !== undefined) mappedUpdates.updated_at = updates.updatedAt;

  return mappedUpdates;
}

async function getAllAccounts() {
  const db = await connectDB();

  const users = await db.collection("users").find({}).sort({ created_at: -1 }).toArray();

  return users.map(toDashboardAccount);
}

async function createAccount(accountData) {
  const user = await createAdminManagedUser(accountData);
  return toDashboardAccount(user);
}

async function updateAccount(accountId, updates) {
  const db = await connectDB();
  const mappedUpdates = mapAccountUpdates(updates);

  const result = await db.collection("users").updateOne(
    { _id: accountId },
    { $set: mappedUpdates }
  );

  if (result.matchedCount === 0) return null;

  const user = await db.collection("users").findOne({ _id: accountId });

  return toDashboardAccount(user);
}

async function deleteAccount(accountId) {
  const db = await connectDB();
  const result = await db.collection("users").deleteOne({ _id: accountId });

  return result.deletedCount > 0;
}

module.exports = {
  createAccount,
  deleteAccount,
  getAllAccounts,
  updateAccount,
};
