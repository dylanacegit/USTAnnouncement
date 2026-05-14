const jwt = require("jsonwebtoken");
const {
  comparePassword,
  createUser,
  deleteUnverifiedUser,
  findUserByEmail,
  updateVerificationToken,
  verifyUserByToken,
} = require("../services/auth.service");
const { sendTestEmail, sendVerificationEmail } = require("../services/email.service");
const { generateVerificationToken, sanitizeUser } = require("../utils/auth");

function ensureJwtSecret() {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is missing in .env");
  }
}

async function register(req, res) {
  let createdUser = null;

  try {
    const email = req.body.email.trim().toLowerCase();
    const existingUser = await findUserByEmail(email);

    if (existingUser) {
      if (existingUser.is_verified) {
        return res.status(409).json({ message: "An account with this UST email already exists." });
      }

      const verificationToken = generateVerificationToken();
      const userWithNewToken = await updateVerificationToken(existingUser._id, verificationToken);

      console.info("[auth] Existing unverified account found. Resending verification email.", {
        email,
        userId: existingUser._id.toString(),
      });

      try {
        await sendVerificationEmail({
          to: userWithNewToken.email,
          firstName: userWithNewToken.first_name,
          token: verificationToken,
        });
      } catch (emailError) {
        console.error("[auth] Failed to resend verification email for existing user:", emailError);
        return res.status(502).json({
          message: "Verification email could not be sent. Please try again later.",
        });
      }

      return res.json({
        message: "A new verification email has been sent.",
        user: sanitizeUser(userWithNewToken),
      });
    }

    const verificationToken = generateVerificationToken();
    createdUser = await createUser({
      role: req.body.role.trim().toLowerCase(),
      firstName: req.body.firstName.trim(),
      lastName: req.body.lastName.trim(),
      email,
      password: req.body.password,
      studentOrEmployeeNumber: req.body.studentOrEmployeeNumber.trim(),
      yearLevel: req.body.yearLevel.trim(),
      faculty: req.body.faculty.trim(),
      verificationToken,
    });

    await sendVerificationEmail({
      to: createdUser.email,
      firstName: createdUser.first_name,
      token: verificationToken,
    });

    return res.status(201).json({
      message: "Registration successful. Please check your UST email to verify your account.",
      user: sanitizeUser(createdUser),
    });
  } catch (error) {
    if (error.code === 11000) {
      console.error("POST /api/auth/register duplicate key error:", error);
      return res.status(409).json({ message: "An account with this UST email already exists." });
    }

    if (createdUser) {
      try {
        await deleteUnverifiedUser(createdUser._id);
        console.info("[auth] Rolled back unverified user after verification email failure.", {
          email: createdUser.email,
          userId: createdUser._id.toString(),
        });
      } catch (rollbackError) {
        console.error("[auth] Failed to roll back unverified user:", rollbackError);
      }

      console.error("POST /api/auth/register email error:", error);
      return res.status(502).json({
        message: "Registration could not be completed because the verification email failed to send. Please try again later.",
      });
    }

    console.error("POST /api/auth/register error:", error);
    return res.status(500).json({ message: "Failed to register account." });
  }
}

async function resendVerification(req, res) {
  try {
    const email = req.body.email.trim().toLowerCase();
    const user = await findUserByEmail(email);

    if (!user) {
      return res.status(404).json({ message: "No account was found for that UST email." });
    }

    if (user.is_verified) {
      return res.json({ message: "This account is already verified. You can sign in." });
    }

    const verificationToken = generateVerificationToken();
    const userWithNewToken = await updateVerificationToken(user._id, verificationToken);

    console.info("[auth] Resending verification email.", {
      email,
      userId: user._id.toString(),
    });

    await sendVerificationEmail({
      to: userWithNewToken.email,
      firstName: userWithNewToken.first_name,
      token: verificationToken,
    });

    return res.json({
      message: "A new verification email has been sent.",
      user: sanitizeUser(userWithNewToken),
    });
  } catch (error) {
    console.error("POST /api/auth/resend-verification error:", error);
    return res.status(502).json({
      message: "Verification email could not be sent. Please try again later.",
    });
  }
}

async function testEmail(req, res) {
  try {
    const sender = process.env.EMAIL_USER || "";
    const fallbackRecipient = sender.toLowerCase().endsWith("@ust.edu.ph") ? sender : "";
    const to = process.env.TEST_EMAIL_TO || process.env.EMAIL_TEST_TO || fallbackRecipient;

    if (!to) {
      return res.status(500).json({
        message: "TEST_EMAIL_TO must be set to your UST email before sending a test email.",
      });
    }

    const info = await sendTestEmail({ to });

    return res.json({
      message: "Test email sent successfully.",
      to,
      messageId: info.messageId,
      accepted: info.accepted,
      rejected: info.rejected,
    });
  } catch (error) {
    console.error("GET /api/test-email error:", error);
    return res.status(502).json({
      message: "Test email failed to send.",
      error: error.message,
    });
  }
}

async function verifyEmail(req, res) {
  try {
    const user = await verifyUserByToken(req.params.token);

    if (!user) {
      return res.status(400).json({ message: "Verification link is invalid or expired." });
    }

    return res.json({
      message: "Email verified successfully. You can now sign in.",
      user: sanitizeUser(user),
    });
  } catch (error) {
    console.error("GET /api/auth/verify-email/:token error:", error);
    return res.status(500).json({ message: "Failed to verify email." });
  }
}

async function login(req, res) {
  try {
    ensureJwtSecret();

    const email = req.body.email.trim().toLowerCase();
    const user = await findUserByEmail(email);

    if (!user) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    const passwordMatches = await comparePassword(req.body.password, user.password);

    if (!passwordMatches) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    if (!user.is_verified) {
      return res.status(403).json({ message: "Please verify your UST email before signing in." });
    }

    const token = jwt.sign(
      {
        id: user._id.toString(),
        email: user.email,
        role: user.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.json({
      message: "Login successful.",
      token,
      user: sanitizeUser(user),
    });
  } catch (error) {
    console.error("POST /api/auth/login error:", error);
    return res.status(500).json({ message: "Failed to sign in." });
  }
}

module.exports = {
  login,
  register,
  resendVerification,
  testEmail,
  verifyEmail,
};
