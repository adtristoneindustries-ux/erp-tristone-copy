const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  createCourse,
  getCourses,
  getCourse,
  updateCourse,
  deleteCourse,
  requestEnrollment,
  getEnrollments,
  updateEnrollmentStatus,
  getMyEnrollments
} = require('../controllers/courseController');

router.route('/')
  .get(protect, getCourses)
  .post(protect, authorize('admin', 'staff'), createCourse);

router.route('/:id')
  .get(protect, getCourse)
  .put(protect, authorize('admin', 'staff'), updateCourse)
  .delete(protect, authorize('admin', 'staff'), deleteCourse);

router.post('/:id/enroll', protect, authorize('student'), requestEnrollment);

router.get('/enrollments/my', protect, authorize('student'), getMyEnrollments);

router.route('/enrollments/all')
  .get(protect, authorize('admin', 'staff'), getEnrollments);

router.put('/enrollments/:id', protect, authorize('admin', 'staff'), updateEnrollmentStatus);

module.exports = router;
