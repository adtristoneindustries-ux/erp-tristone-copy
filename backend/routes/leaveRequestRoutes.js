const express = require('express');
const router = express.Router();
const { createLeaveRequest, getLeaveRequests, getMyLeaveRequests, updateLeaveRequestStatus, getUnreadCount, markAsRead } = require('../controllers/leaveRequestController');
const { auth } = require('../middleware/auth');

// Create leave request
router.post('/', auth, createLeaveRequest);

// Get leave requests
router.get('/', auth, getLeaveRequests);

// Get my leave requests
router.get('/my-requests', auth, getMyLeaveRequests);

// Get unread count
router.get('/unread-count', auth, getUnreadCount);

// Mark as read
router.put('/mark-read', auth, markAsRead);

// Update leave request status (Staff/Admin only)
router.put('/:id/status', auth, updateLeaveRequestStatus);

module.exports = router;