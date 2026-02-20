const express = require('express');
const { createMark, getMarks, updateMark, deleteMark, getUnreadCount, markAsRead, getRecentUpdates } = require('../controllers/markController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.route('/')
  .get(getMarks)
  .post(authorize('admin', 'staff'), createMark);

router.get('/unread-count', getUnreadCount);
router.put('/mark-read', markAsRead);
router.get('/recent-updates', getRecentUpdates);

router.route('/:id')
  .put(authorize('admin', 'staff'), updateMark)
  .delete(authorize('admin', 'staff'), deleteMark);

module.exports = router;
