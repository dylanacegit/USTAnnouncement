const crypto = require("crypto");

function generateVerificationToken() {
  return crypto.randomBytes(32).toString("hex");
}

function sanitizeUser(user) {
  if (!user) return null;

  return {
    id: user._id?.toString(),
    role: user.role,
    firstName: user.first_name,
    lastName: user.last_name,
    email: user.email,
    studentOrEmployeeNumber: user.student_employee_number,
    yearLevel: user.year_level,
    faculty: user.faculty,
    isVerified: Boolean(user.is_verified),
    createdAt: user.created_at,
  };
}

module.exports = {
  generateVerificationToken,
  sanitizeUser,
};
