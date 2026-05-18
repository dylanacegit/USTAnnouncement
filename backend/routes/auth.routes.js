const express = require("express");
const { ObjectId } = require("mongodb");
const { body, param } = require("express-validator");
const connectDB = require("../db");
const {
  forgotPassword,
  login,
  register,
  resendVerification,
  resetPassword,
  verifyEmail,
} = require("../controllers/auth.controller");
const validateRequest = require("../middleware/validate");
const { requireAuth } = require("../middleware/auth.middleware");
const { sanitizeUser } = require("../utils/auth");
const { normalizeRequiredText } = require("../utils/validators");

const router = express.Router();

const ustEmailValidator = body("email")
  .trim()
  .isEmail()
  .withMessage("A valid UST email address is required.")
  .bail()
  .normalizeEmail()
  .custom((email) => email.endsWith("@ust.edu.ph"))
  .withMessage("Only @ust.edu.ph email addresses are allowed.");

router.post(
  "/register",
  [
    body("occupation").trim().isIn(["student", "teacher"]).withMessage("Occupation must be student or teacher."),
    body("firstName").trim().notEmpty().withMessage("First name is required.").escape(),
    body("lastName").trim().notEmpty().withMessage("Last name is required.").escape(),
    ustEmailValidator,
    body("password")
      .isLength({ min: 8 })
      .withMessage("Password must be at least 8 characters long."),
    body("studentOrEmployeeNumber")
      .trim()
      .notEmpty()
      .withMessage("Student or employee number is required.")
      .escape(),
    body("yearLevel").trim().notEmpty().withMessage("Year level is required.").escape(),
    body("faculty").trim().notEmpty().withMessage("College or faculty is required.").escape(),
  ],
  validateRequest,
  register
);

router.get(
  "/verify-email/:token",
  [param("token").trim().isLength({ min: 32 }).withMessage("Verification token is invalid.")],
  validateRequest,
  verifyEmail
);

router.post(
  "/login",
  [
    ustEmailValidator,
    body("password").notEmpty().withMessage("Password is required."),
  ],
  validateRequest,
  login
);

router.post(
  "/forgot-password",
  [ustEmailValidator],
  validateRequest,
  forgotPassword
);

router.post(
  "/reset-password/:token",
  [
    param("token").trim().isLength({ min: 32 }).withMessage("Password reset token is invalid."),
    body("password")
      .isLength({ min: 8 })
      .withMessage("Password must be at least 8 characters long."),
  ],
  validateRequest,
  resetPassword
);

router.post(
  "/resend-verification",
  [ustEmailValidator],
  validateRequest,
  resendVerification
);

router.patch("/preferences", requireAuth, async (req, res) => {
  try {
    const notificationsEnabled = Boolean(req.body.notificationsEnabled);
    const db = await connectDB();

    await db.collection("users").updateOne(
      { _id: new ObjectId(req.user.id) },
      {
        $set: {
          notifications_enabled: notificationsEnabled,
          updated_at: new Date(),
        },
      }
    );

    const user = await db.collection("users").findOne({ _id: new ObjectId(req.user.id) });

    res.json({ user: sanitizeUser(user) });
  } catch (error) {
    console.error("PATCH /api/auth/preferences error:", error);
    res.status(500).json({ message: "Failed to update preferences." });
  }
});

router.patch("/profile", requireAuth, async (req, res) => {
  try {
    const firstName = normalizeRequiredText(req.body.firstName);
    const lastName = normalizeRequiredText(req.body.lastName);
    const faculty = normalizeRequiredText(req.body.faculty);
    const yearLevel = normalizeRequiredText(req.body.yearLevel);

    if (!firstName) return res.status(400).json({ message: "First name is required." });
    if (!lastName) return res.status(400).json({ message: "Last name is required." });
    if (!faculty) return res.status(400).json({ message: "College is required." });
    if (req.user.role !== "admin" && !yearLevel) {
      return res.status(400).json({ message: "Year level is required." });
    }

    const db = await connectDB();

    await db.collection("users").updateOne(
      { _id: new ObjectId(req.user.id) },
      {
        $set: {
          first_name: firstName,
          last_name: lastName,
          faculty,
          year_level: yearLevel || "",
          updated_by: `${req.user.firstName || ""} ${req.user.lastName || ""}`.trim() || req.user.email,
          updated_by_email: req.user.email,
          updated_at: new Date(),
        },
      }
    );

    const user = await db.collection("users").findOne({ _id: new ObjectId(req.user.id) });

    res.json({ user: sanitizeUser(user) });
  } catch (error) {
    console.error("PATCH /api/auth/profile error:", error);
    res.status(500).json({ message: "Failed to update profile." });
  }
});

module.exports = router;
