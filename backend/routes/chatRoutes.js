const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/history/:userId', chatController.getChatHistory);
router.post('/send', chatController.sendMessage);
router.get('/teachers', chatController.getTeachers);
router.get('/students', chatController.getStudentsByClass);
router.get('/parents', chatController.getParents);
router.get('/unread-count', chatController.getUnreadCount);
router.get('/recent', chatController.getRecentChats);

module.exports = router;
