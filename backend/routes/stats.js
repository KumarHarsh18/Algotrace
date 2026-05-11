// routes/stats.js
const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/verifyToken');
const { getOverview, getContests, getTopics, getHeatmap } = require('../controllers/statsController');

// All stats routes are protected — user must be logged in
router.use(verifyToken);

router.get('/overview', getOverview);
router.get('/contests', getContests);   // ?platform=CODEFORCES (optional)
router.get('/topics', getTopics);
router.get('/heatmap', getHeatmap);

module.exports = router;
