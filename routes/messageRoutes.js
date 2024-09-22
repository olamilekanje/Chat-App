const express = require('express');
const { getMessages, sendMessage, getConversationByUsers } = require('../controllers/messageController');
const { protect } = require('../middleware/authMiddleware');
const router = express.Router();


router.post('/send', protect, sendMessage); // Accept single file upload
router.post('/conversations/by-users', protect, getConversationByUsers);
router.get('/conversation/:conversationId', protect, getMessages);

module.exports = router;
