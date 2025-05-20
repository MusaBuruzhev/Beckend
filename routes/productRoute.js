const express = require("express");
const productController = require("../controllers/productController");
const authMiddleware = require("../middlewares/authMiddleware");
const upload = require("../middlewares/upload");

const router = express.Router();

router.get("/products", productController.getProducts);
router.get("/product/:id", productController.getOneProduct);
router.post("/addProduct", authMiddleware, upload.array('image[]', 10), productController.addProduct);
router.delete("/delproduct/:id", authMiddleware, productController.deleteOneProduct);
router.patch("/update/:id", authMiddleware, productController.updateProduct);
router.get("/my", authMiddleware, productController.getMyProducts);

module.exports = router;