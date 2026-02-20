const express = require('express');
const { createTimetable, getTimetable, updateTimetable, getStaffTimetable, getClasses, getStaffList, assignStaffToPeriod, savePeriod, getTimetableByClass } = require('../controllers/timetableController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.post('/period', authorize('admin'), savePeriod);
router.get('/class', getTimetableByClass);

router.route('/')
  .get(getTimetable)
  .post(authorize('admin'), createTimetable);

router.route('/:id')
  .put(authorize('admin'), updateTimetable);

router.post('/assign', authorize('admin'), assignStaffToPeriod);
router.get('/staff/:staffId', getStaffTimetable);
router.get('/classes/list', getClasses);
router.get('/staff/list', getStaffList);

module.exports = router;
