const express = require('express');
const { getAdminStats, getStudentStats, getStaffStats, getSystemHealth, getCanteenStats, getLibraryStats, getAdminReports, bulkImportUsers } = require('../controllers/dashboardController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.get('/admin', authorize('admin'), getAdminStats);
router.get('/student', authorize('student'), getStudentStats);
router.get('/staff', authorize('staff'), getStaffStats);
router.get('/system-health', authorize('admin'), getSystemHealth);
router.get('/canteen', authorize('staff', 'canteen'), getCanteenStats);
router.get('/library', authorize('staff', 'librarian'), getLibraryStats);
router.get('/reports', authorize('admin'), getAdminReports);
router.post('/bulk-import', authorize('admin'), bulkImportUsers);

module.exports = router;
