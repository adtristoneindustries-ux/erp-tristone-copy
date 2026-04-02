const express = require('express');
const router = express.Router();
const { getPayrolls, createPayroll, updatePayroll, deletePayroll, generateMonthlyPayroll } = require('../controllers/payrollController');
const { protect, authorize } = require('../middleware/auth');

router.get('/', protect, authorize('admin'), getPayrolls);
router.post('/', protect, authorize('admin'), createPayroll);
router.post('/generate', protect, authorize('admin'), generateMonthlyPayroll);
router.put('/:id', protect, authorize('admin'), updatePayroll);
router.delete('/:id', protect, authorize('admin'), deletePayroll);

module.exports = router;
