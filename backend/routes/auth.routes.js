const express = require("express");
const { body, param } = require("express-validator");
const {
  login,
  register,
  resendVerification,
  verifyEmail,
} = require("../controllers/auth.controller");
const validateRequest = require("../middleware/validate");

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
    body("role").trim().isIn(["student", "teacher"]).withMessage("Role must be student or teacher."),
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
  "/resend-verification",
  [ustEmailValidator],
  validateRequest,
  resendVerification
);

module.exports = router;
