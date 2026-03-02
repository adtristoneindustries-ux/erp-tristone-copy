const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  getExams,
  getExam,
  createExam,
  updateExam,
  deleteExam,
  getUpcomingExams,
  getExamStats
} = require('../controllers/examController');

// Public routes (protected)
router.get('/', protect, getExams);
router.get('/upcoming', protect, getUpcomingExams);
router.get('/stats', protect, getExamStats);
router.get('/:id', protect, getExam);

// Admin and Staff routes
router.post('/', protect, authorize('admin', 'staff'), createExam);
router.put('/:id', protect, authorize('admin', 'staff'), updateExam);
router.delete('/:id', protect, authorize('admin', 'staff'), deleteExam);

module.exports = router;
