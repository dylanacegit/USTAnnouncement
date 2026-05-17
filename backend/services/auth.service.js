const bcrypt = require("bcrypt");
const connectDB = require("../db");

const USERS_COLLECTION = "users";
const VERIFICATION_TOKEN_TTL_HOURS = 1;
const PASSWORD_RESET_TOKEN_TTL_MINUTES = 30;

function getVerificationExpiresAt() {
  return new Date(Date.now() + VERIFICATION_TOKEN_TTL_HOURS * 60 * 60 * 1000);
}

function getPasswordResetExpiresAt() {
  return new Date(Date.now() + PASSWORD_RESET_TOKEN_TTL_MINUTES * 60 * 1000);
}

async function usersCollection() {
  const db = await connectDB();
  const users = db.collection(USERS_COLLECTION);

  await users.createIndex({ email: 1 }, { unique: true });
  await users.createIndex({ verification_token: 1 }, { sparse: true });
  await users.createIndex({ password_reset_token: 1 }, { sparse: true });

  return users;
}

async function findUserByEmail(email) {
  const users = await usersCollection();
  return users.findOne({ email });
}

async function createUser(userData) {
  const users = await usersCollection();
  const hashedPassword = await bcrypt.hash(userData.password, 12);
  const now = new Date();

  const user = {
    role: userData.role || "user",
    occupation: userData.occupation,
    first_name: userData.firstName,
    last_name: userData.lastName,
    email: userData.email,
    password: hashedPassword,
    student_employee_number: userData.studentOrEmployeeNumber,
    year_level: userData.yearLevel,
    faculty: userData.faculty,
    account_status: userData.accountStatus || "active",
    is_verified: Boolean(userData.isVerified),
    verification_token: userData.verificationToken,
    verification_token_expires_at: userData.verificationToken ? getVerificationExpiresAt() : undefined,
    created_by: userData.createdBy || "Registration",
    created_at: now,
  };

  if (!user.verification_token) {
    delete user.verification_token;
    delete user.verification_token_expires_at;
  }

  const result = await users.insertOne(user);
  return { ...user, _id: result.insertedId };
}

async function createAdminManagedUser(userData) {
  return createUser({
    ...userData,
    isVerified: true,
    verificationToken: null,
    createdBy: userData.createdBy || "Admin",
  });
}

async function ensureSeedAdmin() {
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD;

  if (!email || !password) return null;

  if (!email.endsWith("@ust.edu.ph")) {
    throw new Error("ADMIN_EMAIL must use an @ust.edu.ph address.");
  }

  if (password.length < 8) {
    throw new Error("ADMIN_PASSWORD must be at least 8 characters long.");
  }

  const existingAdmin = await findUserByEmail(email);

  if (existingAdmin) return existingAdmin;

  return createAdminManagedUser({
    role: "admin",
    occupation: "",
    firstName: process.env.ADMIN_FIRST_NAME || "System",
    lastName: process.env.ADMIN_LAST_NAME || "Administrator",
    email,
    password,
    studentOrEmployeeNumber: process.env.ADMIN_ID_NUMBER || "",
    yearLevel: "",
    faculty: process.env.ADMIN_DEPARTMENT || "Administration",
    accountStatus: "active",
    createdBy: "System Seed",
  });
}

async function updateVerificationToken(userId, verificationToken) {
  const users = await usersCollection();
  const verificationExpiresAt = getVerificationExpiresAt();

  await users.updateOne(
    { _id: userId, is_verified: { $ne: true } },
    {
      $set: {
        verification_token: verificationToken,
        verification_token_expires_at: verificationExpiresAt,
      },
    }
  );

  return users.findOne({ _id: userId });
}

async function deleteUnverifiedUser(userId) {
  const users = await usersCollection();
  return users.deleteOne({ _id: userId, is_verified: { $ne: true } });
}

async function verifyUserByToken(token) {
  const users = await usersCollection();
  const user = await users.findOne({
    verification_token: token,
    verification_token_expires_at: { $gt: new Date() },
  });

  if (!user) return null;

  await users.updateOne(
    { _id: user._id },
    {
      $set: { is_verified: true },
      $unset: {
        verification_token: "",
        verification_token_expires_at: "",
      },
    }
  );

  return users.findOne({ _id: user._id });
}

async function comparePassword(password, hashedPassword) {
  return bcrypt.compare(password, hashedPassword);
}

async function updatePasswordResetToken(userId, resetToken) {
  const users = await usersCollection();

  await users.updateOne(
    { _id: userId },
    {
      $set: {
        password_reset_token: resetToken,
        password_reset_token_expires_at: getPasswordResetExpiresAt(),
      },
    }
  );

  return users.findOne({ _id: userId });
}

async function resetPasswordByToken(token, password) {
  const users = await usersCollection();
  const user = await users.findOne({
    password_reset_token: token,
    password_reset_token_expires_at: { $gt: new Date() },
  });

  if (!user) return null;

  const hashedPassword = await bcrypt.hash(password, 12);

  await users.updateOne(
    { _id: user._id },
    {
      $set: {
        password: hashedPassword,
        updated_by: "Password Reset",
        updated_at: new Date(),
      },
      $unset: {
        password_reset_token: "",
        password_reset_token_expires_at: "",
      },
    }
  );

  return users.findOne({ _id: user._id });
}

module.exports = {
  comparePassword,
  createAdminManagedUser,
  createUser,
  deleteUnverifiedUser,
  ensureSeedAdmin,
  findUserByEmail,
  resetPasswordByToken,
  updatePasswordResetToken,
  updateVerificationToken,
  verifyUserByToken,
};
