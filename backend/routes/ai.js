const express = require("express");
const verifyToken = require("../middleware/verifyToken");
const {
  analyzePerformance,
} = require("../controllers/aiController");

const router = express.Router();

router.post("/analyze", verifyToken, analyzePerformance);

module.exports = router;