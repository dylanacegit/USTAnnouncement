const express = require("express");
const {
  createAccount,
  deleteAccount,
  getAllAccounts,
  updateAccount,
} = require("../services/accounts.service");
const { requireAdmin, requireAuth } = require("../middleware/auth.middleware");
const {
  isAllowedValue,
  isValidObjectId,
  normalizeEmail,
  normalizeRequiredText,
  toObjectId,
} = require("../utils/validators");

const router = express.Router();

router.use(requireAuth, requireAdmin);

router.get("/", async (req, res) => {
  try {
    const accounts = await getAllAccounts();

    res.json(accounts);
  } catch (error) {
    console.error("GET /api/accounts FULL ERROR:", error);
    res.status(500).json({
      message: "Failed to fetch accounts",
      error: error.message,
    });
  }
});

router.post("/", async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      password,
      role = "user",
      occupation = "",
      department,
      studentOrEmployeeNumber = "",
      yearLevel = "",
    } = req.body;
    const normalizedFirstName = normalizeRequiredText(firstName);
    const normalizedLastName = normalizeRequiredText(lastName);
    const normalizedEmail = normalizeEmail(email);
    const normalizedDepartment = normalizeRequiredText(department);
    const normalizedRole = String(role).trim().toLowerCase();
    const normalizedOccupation = String(occupation || "").trim().toLowerCase();

    if (!normalizedFirstName) return res.status(400).json({ message: "First name is required." });
    if (!normalizedLastName) return res.status(400).json({ message: "Last name is required." });
    if (!normalizedEmail || !normalizedEmail.endsWith("@ust.edu.ph")) {
      return res.status(400).json({ message: "A valid UST email is required." });
    }
    if (!password || password.length < 8) {
      return res.status(400).json({ message: "Password must be at least 8 characters long." });
    }
    if (!isAllowedValue(normalizedRole, ["admin", "user"])) {
      return res.status(400).json({ message: "Role must be admin or user." });
    }
    if (normalizedRole === "user" && !isAllowedValue(normalizedOccupation, ["student", "teacher"])) {
      return res.status(400).json({ message: "User occupation must be student or teacher." });
    }
    if (!normalizedDepartment) return res.status(400).json({ message: "Department is required." });

    const account = await createAccount({
      role: normalizedRole,
      occupation: normalizedRole === "admin" ? "" : normalizedOccupation,
      firstName: normalizedFirstName,
      lastName: normalizedLastName,
      email: normalizedEmail,
      password,
      studentOrEmployeeNumber: String(studentOrEmployeeNumber || "").trim(),
      yearLevel: String(yearLevel || "").trim(),
      faculty: normalizedDepartment,
      accountStatus: "active",
      createdBy: req.user?.email || "Admin",
    });

    res.status(201).json(account);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ message: "An account with this UST email already exists." });
    }

    console.error("POST /api/accounts error:", error);
    res.status(500).json({ message: "Failed to create account" });
  }
});

router.patch("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { status, department, firstName, lastName, email } = req.body;

    if (!isValidObjectId(id)) {
      return res.status(400).json({ message: "Invalid account ID." });
    }

    const updates = {
      updatedBy: "Admin",
      updatedAt: new Date(),
    };

    if (status !== undefined) {
      if (!isAllowedValue(status, ["active", "archived"])) {
        return res.status(400).json({ message: "Invalid account status." });
      }

      updates.status = status;
    }

    if (department !== undefined) {
      const normalizedDepartment = normalizeRequiredText(department);

      if (!normalizedDepartment) {
        return res.status(400).json({ message: "Department is required." });
      }

      updates.department = normalizedDepartment;
    }

    if (firstName !== undefined) {
      const normalizedFirstName = normalizeRequiredText(firstName);

      if (!normalizedFirstName) {
        return res.status(400).json({ message: "First name is required." });
      }

      updates.firstName = normalizedFirstName;
    }

    if (lastName !== undefined) {
      const normalizedLastName = normalizeRequiredText(lastName);

      if (!normalizedLastName) {
        return res.status(400).json({ message: "Last name is required." });
      }

      updates.lastName = normalizedLastName;
    }

    if (email !== undefined) {
      const normalizedEmail = normalizeEmail(email);

      if (!normalizedEmail || !normalizedEmail.endsWith("@ust.edu.ph")) {
        return res.status(400).json({ message: "A valid UST email is required." });
      }

      updates.email = normalizedEmail;
    }

    if (Object.keys(updates).length === 2) {
      return res.status(400).json({ message: "No account updates provided." });
    }

    const updatedAccount = await updateAccount(toObjectId(id), updates);

    if (!updatedAccount) {
      return res.status(404).json({ message: "Account not found." });
    }

    res.json(updatedAccount);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ message: "An account with this UST email already exists." });
    }

    console.error("PATCH /api/accounts/:id error:", error);
    res.status(500).json({ message: "Failed to update account" });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({ message: "Invalid account ID." });
    }

    const wasDeleted = await deleteAccount(toObjectId(id));

    if (!wasDeleted) {
      return res.status(404).json({ message: "Account not found." });
    }

    res.json({ message: "Account deleted successfully." });
  } catch (error) {
    console.error("DELETE /api/accounts/:id error:", error);
    res.status(500).json({ message: "Failed to delete account" });
  }
});

module.exports = router;
