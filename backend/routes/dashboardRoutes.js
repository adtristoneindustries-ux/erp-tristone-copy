const express = require('express');
const { getAdminStats, getStudentStats, getStaffStats, getLibraryStats, getCanteenStats } = require('../controllers/dashboardController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.get('/admin', authorize('admin'), getAdminStats);
router.get('/student', authorize('student'), getStudentStats);
router.get('/staff', authorize('staff', 'librarian', 'canteen'), getStaffStats);
router.get('/library', authorize('librarian'), getLibraryStats);
router.get('/canteen', authorize('canteen'), getCanteenStats);

module.exports = router;
