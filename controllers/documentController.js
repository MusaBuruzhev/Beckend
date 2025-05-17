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

  async approveDocument(req, res) {
  try {
    if (req.user.roles[0] !== "ADMIN") {
      return res.status(403).json({ message: "Нет доступа" });
    }

    const { id } = req.params;

    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({ message: "Пользователь не найден" });
    }

    // Проверяем, что паспорт загружен
    if (!user.passportFiles || user.passportFiles.length === 0) {
      return res.status(400).json({ message: "Нет загруженных документов" });
    }

    // Одобряем документы
    user.documentsVerified = true;
    await user.save();

    return res.status(200).json({ message: "Документы одобрены" });

  } catch (e) {
    console.log(e);
    return res.status(500).json({ message: "Ошибка подтверждения документов" });
  }
}

  async rejectDocument(req, res) {
  try {
    if (req.user.roles[0] !== "ADMIN") {
      return res.status(403).json({ message: "Нет доступа" });
    }

    const { id } = req.params;
    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({ message: "Пользователь не найден" });
    }

    // Сбрасываем документы и статус
    user.passportFiles = [];
    user.driverLicenseFiles = [];
    user.documentsVerified = false;

    await user.save();

    return res.status(200).json({ message: "Документы отклонены" });

  } catch (e) {
    console.log(e);
    return res.status(500).json({ message: "Ошибка отклонения документов" });
  }
}
}

module.exports = new DocumentController();