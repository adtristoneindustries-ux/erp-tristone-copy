const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  createStaffAttendance,
  getStaffAttendance,
  updateStaffAttendance,
  deleteStaffAttendance,
  checkIn,
  checkOut,
  getTodayAttendance
} = require('../controllers/staffAttendanceController');

router.post('/', protect, createStaffAttendance);
router.get('/', protect, getStaffAttendance);
router.put('/:id', protect, updateStaffAttendance);
router.delete('/:id', protect, deleteStaffAttendance);

// New routes for check-in/check-out
router.post('/check-in', protect, checkIn);
router.post('/check-out', protect, checkOut);
router.get('/today', protect, getTodayAttendance);

module.exports = router;