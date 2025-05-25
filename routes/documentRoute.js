
const express = require("express");
const router = express.Router();

const controller = require("../controllers/documentController");
const authMiddleware = require("../middlewares/authMiddleware");

router.get("/documents", authMiddleware, controller.getDocumentsForModeration);
router.patch("/documents/:id", authMiddleware, controller.updateDocumentStatus);

module.exports = router;
