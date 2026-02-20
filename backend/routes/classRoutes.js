const express = require('express');
const { getClasses, createClass, updateClass, deleteClass } = require('../controllers/classController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.get('/', protect, getClasses);
router.post('/', protect, createClass);
router.put('/:id', protect, updateClass);
router.delete('/:id', protect, deleteClass);

module.exports = router;