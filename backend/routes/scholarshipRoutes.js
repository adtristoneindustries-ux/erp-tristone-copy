const express = require('express');
const router = express.Router();
const { getScholarships, createScholarship, updateScholarship, applyScholarship, updateApplication, deleteScholarship } = require('../controllers/scholarshipController');
const { protect } = require('../middleware/auth');

router.get('/', protect, getScholarships);
router.post('/', protect, createScholarship);
router.put('/:id', protect, updateScholarship);
router.post('/:id/apply', protect, applyScholarship);
router.put('/:id/application/:appId', protect, updateApplication);
router.delete('/:id', protect, deleteScholarship);

module.exports = router;
