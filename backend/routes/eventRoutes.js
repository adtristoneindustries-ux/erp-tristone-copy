const express = require('express');
const { getEvents, createEvent, updateEvent, deleteEvent } = require('../controllers/eventController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.get('/', getEvents);
router.post('/', authorize('admin'), createEvent);
router.put('/:id', authorize('admin'), updateEvent);
router.delete('/:id', authorize('admin'), deleteEvent);


module.exports = router;
