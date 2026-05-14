const bcrypt = require("bcrypt");
const connectDB = require("../db");

const USERS_COLLECTION = "users";
const VERIFICATION_TOKEN_TTL_HOURS = 1;

function getVerificationExpiresAt() {
  return new Date(Date.now() + VERIFICATION_TOKEN_TTL_HOURS * 60 * 60 * 1000);
}

async function usersCollection() {
  const db = await connectDB();
  const users = db.collection(USERS_COLLECTION);

  await users.createIndex({ email: 1 }, { unique: true });
  await users.createIndex({ verification_token: 1 }, { sparse: true });

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
    role: userData.role,
    first_name: userData.firstName,
    last_name: userData.lastName,
    email: userData.email,
    password: hashedPassword,
    student_employee_number: userData.studentOrEmployeeNumber,
    year_level: userData.yearLevel,
    faculty: userData.faculty,
    is_verified: false,
    verification_token: userData.verificationToken,
    verification_token_expires_at: getVerificationExpiresAt(),
    created_at: now,
  };

  const result = await users.insertOne(user);
  return { ...user, _id: result.insertedId };
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

module.exports = {
  comparePassword,
  createUser,
  deleteUnverifiedUser,
  findUserByEmail,
  updateVerificationToken,
  verifyUserByToken,
};
