const User = require("../models/User");

class DocumentController {
  async getDocumentsForModeration(req, res) {
    try {
      if (req.user.roles[0] !== "ADMIN") {
        return res.status(403).json({ message: "Нет доступа" });
      }

      const users = await User.find({
        documentsVerified: false,
        passportFiles: { $exists: true, $not: { $size: 0 } }
      }).select("name surname email passportFiles");

      return res.json(users);
    } catch (e) {
      console.log(e);
      return res.status(500).json({ message: "Ошибка получения заявок на проверку" });
    }
  }

  async updateDocumentStatus(req, res) {
    try {
      if (req.user.roles[0] !== "ADMIN") {
        return res.status(403).json({ message: "Нет доступа" });
      }

      const { id } = req.params;
      const { action } = req.body;

      const user = await User.findById(id);
      if (!user) return res.status(404).json({ message: "Пользователь не найден" });

      if (action === "approve") {
        if (!user.passportFiles || user.passportFiles.length === 0) {
          return res.status(400).json({ message: "Нет загруженных документов" });
        }
        user.documentsVerified = true;
        await user.save();
        return res.status(200).json({ message: "Документы одобрены" });
      }

      if (action === "reject") {
        user.passportFiles = [];
        user.documentsVerified = false;
        await user.save();
        return res.status(200).json({ message: "Документы отклонены" });
      }

      return res.status(400).json({ message: "Некорректное действие" });
    } catch (e) {
      console.log(e);
      return res.status(500).json({ message: "Ошибка обновления статуса документа" });
    }
  }
}

module.exports = new DocumentController();
