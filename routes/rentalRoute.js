

const express = require("express");
const router = express.Router();
const RentalController = require("../controllers/RentalController");
const authMiddleware = require("../middlewares/authMiddleware");

router.post("/create", authMiddleware, RentalController.createRental);
router.post("/pay", authMiddleware, RentalController.payRental);
router.get("/my", authMiddleware, RentalController.getMyRentals);
router.get("/incoming", authMiddleware, RentalController.getIncomingRequests);
router.post("/update-status", authMiddleware, RentalController.updateRentalStatus);
module.exports = router;