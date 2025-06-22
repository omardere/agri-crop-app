const express = require("express");
const router = express.Router();
const cropController = require("../controllers/cropController");

router.get("/", cropController.getAllCrops);
router.get("/:id", cropController.getCropById);

module.exports = router;
