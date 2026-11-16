const express = require('express');
const router = express.Router();
const { getDashboardSummary, getAnalyticsCharts } = require('../controllers/analyticsController');
const { protect } = require('../middleware/authMiddleware');

router.get('/dashboard', protect, getDashboardSummary);
router.get('/charts', protect, getAnalyticsCharts);

module.exports = router;
