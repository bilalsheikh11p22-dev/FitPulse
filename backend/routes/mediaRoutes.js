const express = require('express');
const router = express.Router();
const { getPublicMedia, serveFile } = require('../controllers/mediaController');

// Public: the website reads the admin-managed pictures / hero video from here
router.get('/', getPublicMedia);
// Public: streams an uploaded picture / video stored in MongoDB
router.get('/file/:id', serveFile);

module.exports = router;
