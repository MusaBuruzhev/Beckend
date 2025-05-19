
const Notification = require("../models/Notification");
const User = require("../models/User");

class NotificationController {

  async getMyNotifications(req, res) {
    try {
      const notifications = await Notification.find({ user: req.user.id }).sort({ createdAt: -1 });
      return res.json(notifications);
    } catch (e) {
      console.error(e);
      return res.status(500).json({ message: "Ошибка получения уведомлений" });
    }
  }

  async markAsRead(req, res) {
    try {
      const { id } = req.params;
      const notification = await Notification.findById(id);
      if (!notification) return res.status(404).json({ message: "Уведомление не найдено" });

      if (notification.user.toString() !== req.user.id) {
        return res.status(403).json({ message: "Нет доступа" });
      }

      notification.isRead = true;
      await notification.save();

      return res.json({ message: "Уведомление отмечено как прочитанное" });
    } catch (e) {
      console.error(e);
      return res.status(500).json({ message: "Ошибка изменения статуса" });
    }
  }

  async markAllAsRead(req, res) {
    try {
      await Notification.updateMany(
        { user: req.user.id, isRead: false },
        { isRead: true }
      );

      return res.json({ message: "Все уведомления отмечены как прочитанные" });
    } catch (e) {
      console.error(e);
      return res.status(500).json({ message: "Ошибка изменения статуса" });
    }
  }

}

module.exports = new NotificationController();