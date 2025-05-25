const express = require("express");
const router = express.Router();
const controller = require("../controllers/authController");
const { check } = require("express-validator");
const authMiddleware = require("../middlewares/authMiddleware");
const upload = require("../middlewares/upload");

router.post("/registration", [
  check("email", "Email не может быть пустым").normalizeEmail().isEmail()
], controller.registration);

router.post("/login", controller.login);

router.post("/verify-email", [
  check("email", "Некорректный email").normalizeEmail().isEmail(),
  check("code", "Код должен быть 4 цифры").isLength({ min: 4, max: 4 }).isNumeric()
], controller.verifyEmail);

router.get("/profile", authMiddleware, controller.getProfile);

router.post("/profile/update", authMiddleware, upload.fields([
  { name: 'passport', maxCount: 2 }
]), controller.updateProfile);

router.delete("/users/me", authMiddleware, controller.deleteMyAccount);

router.get("/users", authMiddleware, controller.getAllUsers);
router.delete("/users/:id", authMiddleware, controller.deleteUser);

module.exports = router;
