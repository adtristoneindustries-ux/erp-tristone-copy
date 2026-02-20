const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  createStudentAttendance,
  getStudentAttendance,
  updateStudentAttendance,
  deleteStudentAttendance
} = require('../controllers/studentAttendanceController');

router.post('/', protect, authorize(['admin', 'staff']), createStudentAttendance);
router.get('/', protect, getStudentAttendance);
router.put('/:id', protect, authorize(['admin', 'staff']), updateStudentAttendance);
router.delete('/:id', protect, authorize(['admin', 'staff']), deleteStudentAttendance);

module.exports = router;