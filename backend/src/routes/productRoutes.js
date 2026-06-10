const express = require("express");
const router = express.Router();
const productController = require("../controllers/productController");

// Public routes (no authentication required)
router.get("/", productController.getAllProducts);
router.get("/categories/all", productController.getAllCategories);
router.get("/featured", productController.getFeaturedProducts);
router.get("/trending", productController.getTrendingProducts);
router.get("/:id", productController.getProductById);

module.exports = router;
