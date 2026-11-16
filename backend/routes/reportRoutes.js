const express = require('express');
const router = express.Router();
const { getExportReportData } = require('../controllers/reportController');
const { protect } = require('../middleware/authMiddleware');

router.get('/export', protect, getExportReportData);

module.exports = router;
