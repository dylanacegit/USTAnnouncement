const crypto = require("crypto");

function generateVerificationToken() {
  return crypto.randomBytes(32).toString("hex");
}

function getEffectiveRole(user) {
  if (user?.role === "admin") return "admin";
  return "user";
}

function getOccupation(user) {
  if (user?.occupation) return user.occupation;
  if (["student", "teacher"].includes(user?.role)) return user.role;
  return user?.occupation || "";
}

function sanitizeUser(user) {
  if (!user) return null;

  return {
    id: user._id?.toString(),
    role: getEffectiveRole(user),
    occupation: getOccupation(user),
    firstName: user.first_name,
    lastName: user.last_name,
    email: user.email,
    studentOrEmployeeNumber: user.student_employee_number,
    yearLevel: user.year_level,
    faculty: user.faculty,
    isVerified: Boolean(user.is_verified),
    status: user.account_status || "active",
    bookmarkedEventIds: Array.isArray(user.bookmarked_event_ids)
      ? user.bookmarked_event_ids.map((id) => id.toString())
      : [],
    createdAt: user.created_at,
  };
}

module.exports = {
  generateVerificationToken,
  getEffectiveRole,
  getOccupation,
  sanitizeUser,
};
