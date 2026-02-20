const express = require('express');
const { createAnnouncement, getAnnouncements, updateAnnouncement, deleteAnnouncement, getUnreadCount, markAsRead } = require('../controllers/announcementController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.route('/')
  .get(getAnnouncements)
  .post(authorize('admin', 'staff'), createAnnouncement);

router.get('/unread-count', getUnreadCount);
router.put('/mark-read', markAsRead);

router.route('/:id')
  .put(authorize('admin', 'staff'), updateAnnouncement)
  .delete(authorize('admin', 'staff'), deleteAnnouncement);

module.exports = router;
