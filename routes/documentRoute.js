const express = require("express");
const Router = express.Router;
const router = new Router();
const controller = require("../controllers/documentController");
const authMiddleware = require("../middlewares/authMiddleware");

router.get("/documents", authMiddleware, controller.getDocumentsForModeration); 
router.post("/approve/:id", authMiddleware, controller.approveDocument); 
router.post("/reject/:id", authMiddleware, controller.rejectDocument);

module.exports = router;