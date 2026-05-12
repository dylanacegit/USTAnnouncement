const express = require("express");
const {
  deleteAccount,
  getAllAccounts,
  updateAccount,
} = require("../services/accounts.service");
const {
  isAllowedValue,
  isValidObjectId,
  normalizeEmail,
  normalizeRequiredText,
  toObjectId,
} = require("../utils/validators");

const router = express.Router();

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

router.patch("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { status, department, firstName, lastName, email } = req.body;

    if (!isValidObjectId(id)) {
      return res.status(400).json({ message: "Invalid account ID." });
    }

    const updates = {
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

      if (!normalizedEmail) {
        return res.status(400).json({ message: "Valid email is required." });
      }

      updates.email = normalizedEmail;
    }

    if (Object.keys(updates).length === 1) {
      return res.status(400).json({ message: "No account updates provided." });
    }

    const updatedAccount = await updateAccount(toObjectId(id), updates);

    if (!updatedAccount) {
      return res.status(404).json({ message: "Account not found." });
    }

    res.json(updatedAccount);
  } catch (error) {
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
