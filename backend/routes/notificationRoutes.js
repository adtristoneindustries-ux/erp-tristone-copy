const express = require('express');
const router = express.Router();
const { getNotifications, markAsRead, markAllAsRead } = require('../controllers/notificationController');
const { protect } = require('../middleware/auth');

router.get('/', protect, getNotifications);
router.put('/:id/read', protect, markAsRead);
router.put('/read-all', protect, markAllAsRead);

// Test endpoint to create sample notifications
router.post('/test', protect, async (req, res) => {
  const { createNotification } = require('../controllers/notificationController');
  try {
    await createNotification(req.user._id, 'announcement', 'Welcome!', 'This is a test notification', '/student/announcements');
    await createNotification(req.user._id, 'marks', 'Marks Updated', 'Math - Mid Term: 85/100', '/student/marks');
    await createNotification(req.user._id, 'library', 'Book Due', 'Return "Physics Book" by tomorrow', '/student/library');
    await createNotification(req.user._id, 'cafeteria', 'Low Balance', 'Your balance is ₹50', '/cafeteria');
    await createNotification(req.user._id, 'fee', 'Fee Due', 'Payment of ₹5000 due by 30th', '/student/finance');
    res.json({ message: 'Test notifications created' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
