const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  getAllLeaveRequests,
  getMyLeaveRequests,
  createLeaveRequest,
  updateLeaveStatus,
  markAsRead,
  deleteLeaveRequest
} = require('../controllers/leaveController');

// Staff routes
router.get('/my-requests', protect, authorize('staff'), getMyLeaveRequests);
router.post('/', protect, authorize('staff'), createLeaveRequest);
router.put('/:id/read', protect, markAsRead);
router.delete('/:id', protect, deleteLeaveRequest);

// Admin routes
router.get('/', protect, authorize('admin'), getAllLeaveRequests);
router.put('/:id/status', protect, authorize('admin'), updateLeaveStatus);

module.exports = router;