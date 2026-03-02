const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  getMyHostel,
  raiseIssue,
  getMyIssues,
  getAllHostels,
  createHostel,
  updateHostel,
  getAllIssues,
  updateIssueStatus
} = require('../controllers/hostelController');

// Student routes
router.get('/my-hostel', protect, authorize('student'), getMyHostel);
router.post('/issues', protect, authorize('student'), raiseIssue);
router.get('/my-issues', protect, authorize('student'), getMyIssues);

// Admin routes
router.get('/', protect, authorize('admin'), getAllHostels);
router.post('/', protect, authorize('admin'), createHostel);
router.put('/:id', protect, authorize('admin'), updateHostel);
router.get('/issues/all', protect, authorize('admin'), getAllIssues);
router.put('/issues/:id', protect, authorize('admin'), updateIssueStatus);

module.exports = router;
