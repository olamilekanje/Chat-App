// backend/routes/multimediaRoutes.js
const express = require('express');
const { uploadFile } = require('../controllers/multimediaController');
const router = express.Router();

router.post('/upload', uploadFile);

module.exports = router;
