const Router = require("express");
const router = new Router();
const controller = require("../controllers/authController");
const { check } = require("express-validator"); 
const authMiddleware = require("../middlewares/authMiddleware");
const upload = require("../middlewares/upload");

router.post("/registration", [
  check("email", "Email не может быть пустым").normalizeEmail().isEmail(),
], controller.reqistration);

router.post("/login", controller.login);
router.delete("/users/me", authMiddleware, controller.deleteMyAccount);

router.post("/profile/update", authMiddleware, upload.fields([
  { name: 'passport', maxCount: 2 },
  { name: 'driverLicense', maxCount: 2 }
]), controller.updateProfile);


router.post("/verify-email", [
  check("email", "Некорректный email").normalizeEmail().isEmail(),
  check("code", "Код должен быть 4 цифры").isLength({ min: 4, max: 4 }).isNumeric(),
], controller.verifyEmail);

router.post("/set-role", authMiddleware, [
  check("id").notEmpty().withMessage("ID пользователя не может быть пустым"),
  check("role").notEmpty().withMessage("Роль не может быть пустой"),
], controller.setRole);

router.get("/users", authMiddleware, controller.getAllUsers);
router.delete("/users/:id", authMiddleware, controller.deleteUser);
router.get("/profile", authMiddleware, controller.getProfile);

module.exports = router;