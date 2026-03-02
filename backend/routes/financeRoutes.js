const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  getFinance,
  updateFinance,
  recordPayment,
  getFinanceAnalytics,
  createFeeStructure,
  getFeeStructures,
  updateFeeStructure
} = require('../controllers/financeController');

router.get('/', protect, getFinance);
router.post('/', protect, authorize('admin'), updateFinance);
router.post('/payment', protect, authorize('admin', 'staff'), recordPayment);
router.get('/analytics', protect, authorize('admin'), getFinanceAnalytics);
router.post('/fee-structure', protect, authorize('admin'), createFeeStructure);
router.get('/fee-structure', protect, authorize('admin'), getFeeStructures);
router.put('/fee-structure/:id', protect, authorize('admin'), updateFeeStructure);

module.exports = router;
