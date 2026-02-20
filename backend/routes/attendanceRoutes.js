const express = require('express');
const { 
  getAttendance, 
  createAttendance, 
  updateAttendance, 
  deleteAttendance,
  markBulkAttendance,
  downloadAttendance
} = require('../controllers/attendanceController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.get('/', protect, getAttendance);
router.get('/download', protect, downloadAttendance);
router.post('/', protect, createAttendance);
router.post('/bulk', protect, markBulkAttendance);
router.put('/:id', protect, updateAttendance);
router.delete('/:id', protect, deleteAttendance);

module.exports = router;