const express = require("express");
const Router = express.Router;
const router = new Router();
const controller = require("../controllers/documentController");
const authMiddleware = require("../middlewares/authMiddleware");

// Только для админа
router.get("/documents", authMiddleware, controller.getDocumentsForModeration); // получить список непроверенных
router.post("/approve/:id", authMiddleware, controller.approveDocument); // одобрить документы
router.post("/reject/:id", authMiddleware, controller.rejectDocument); // отклонить

module.exports = router;