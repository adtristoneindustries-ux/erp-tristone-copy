const express = require('express');
const router = express.Router();
const { getFeeStructures, createFeeStructure, updateFeeStructure, deleteFeeStructure } = require('../controllers/feeStructureController');
const { protect, authorize } = require('../middleware/auth');

router.get('/', protect, getFeeStructures);
router.post('/', protect, authorize('admin'), createFeeStructure);
router.put('/:id', protect, authorize('admin'), updateFeeStructure);
router.delete('/:id', protect, authorize('admin'), deleteFeeStructure);

module.exports = router;
