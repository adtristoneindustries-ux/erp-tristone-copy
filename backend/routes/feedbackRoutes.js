const express = require('express');
const { sendFeedback, getMyFeedback, getSentFeedback, markAsRead } = require('../controllers/feedbackController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.post('/', sendFeedback);
router.get('/received', getMyFeedback);
router.get('/sent', getSentFeedback);
router.put('/mark-read', markAsRead);

module.exports = router;
