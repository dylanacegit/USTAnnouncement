const express = require("express");
const { requireAuth } = require("../middleware/auth.middleware");
const {
  clearNotificationsForUser,
  getNotificationsForUser,
  markAllNotificationsRead,
  markNotificationRead,
} = require("../services/notifications.service");

const router = express.Router();

router.use(requireAuth);

function serializeNotification(notification) {
  return {
    _id: notification._id,
    type: notification.type,
    title: notification.title,
    message: notification.message,
    metadata: notification.metadata || {},
    readAt: notification.read_at,
    createdAt: notification.created_at,
  };
}

router.get("/", async (req, res) => {
  try {
    const notifications = await getNotificationsForUser(req.user.id);

    res.json({
      notifications: notifications.map(serializeNotification),
      unreadCount: notifications.filter((item) => !item.read_at).length,
    });
  } catch (error) {
    console.error("GET /api/notifications error:", error);
    res.status(500).json({ message: "Failed to load notifications." });
  }
});

router.patch("/read-all", async (req, res) => {
  try {
    await markAllNotificationsRead(req.user.id);
    const notifications = await getNotificationsForUser(req.user.id);

    res.json({
      notifications: notifications.map(serializeNotification),
      unreadCount: 0,
    });
  } catch (error) {
    console.error("PATCH /api/notifications/read-all error:", error);
    res.status(500).json({ message: "Failed to update notifications." });
  }
});

router.patch("/:id/read", async (req, res) => {
  try {
    const notification = await markNotificationRead(req.params.id, req.user.id);

    if (!notification) {
      return res.status(404).json({ message: "Notification not found." });
    }

    res.json(serializeNotification(notification));
  } catch (error) {
    console.error("PATCH /api/notifications/:id/read error:", error);
    res.status(500).json({ message: "Failed to update notification." });
  }
});

async function clearNotifications(req, res) {
  try {
    await clearNotificationsForUser(req.user.id);

    res.json({
      notifications: [],
      unreadCount: 0,
    });
  } catch (error) {
    console.error("CLEAR /api/notifications error:", error);
    res.status(500).json({ message: "Failed to clear notifications." });
  }
}

router.post("/clear", clearNotifications);
router.delete("/", clearNotifications);

module.exports = router;
