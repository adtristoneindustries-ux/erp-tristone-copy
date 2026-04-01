const express = require('express');
const router = express.Router();
const { getAdmissions, createAdmission, updateAdmission, deleteAdmission } = require('../controllers/admissionController');
const { protect, authorize } = require('../middleware/auth');

router.get('/', protect, authorize('admin'), getAdmissions);
router.post('/', createAdmission); // public — applicants submit without login
router.put('/:id', protect, authorize('admin'), updateAdmission);
router.delete('/:id', protect, authorize('admin'), deleteAdmission);

module.exports = router;
