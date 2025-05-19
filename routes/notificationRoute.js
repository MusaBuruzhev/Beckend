
const express = require("express");
const router = express.Router();
const NotificationController = require("../controllers/NotificationController");
const authMiddleware = require("../middlewares/authMiddleware");

router.get("/me", authMiddleware, NotificationController.getMyNotifications);
router.post("/read/:id", authMiddleware, NotificationController.markAsRead);
router.post("/read-all", authMiddleware, NotificationController.markAllAsRead);

module.exports = router;