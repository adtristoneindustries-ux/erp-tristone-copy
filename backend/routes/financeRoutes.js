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
  updateFeeStructure,
  deleteFeeStructure,
  createOrder,
  verifyPayment,
  recordOfflinePayment,
  downloadReceipt
} = require('../controllers/financeController');

router.get('/', protect, getFinance);
router.post('/', protect, authorize('admin'), updateFinance);
router.post('/record-payment', protect, recordPayment);
router.post('/payment', protect, authorize('admin', 'staff'), recordPayment);
router.post('/offline-payment', protect, authorize('admin', 'staff'), recordOfflinePayment);
router.post('/create-order', protect, createOrder);
router.post('/verify-payment', protect, verifyPayment);
router.get('/analytics', protect, authorize('admin'), getFinanceAnalytics);
router.post('/fee-structure', protect, authorize('admin'), createFeeStructure);
router.get('/fee-structure', protect, getFeeStructures);
router.put('/fee-structure/:id', protect, authorize('admin'), updateFeeStructure);
router.delete('/fee-structure/:id', protect, authorize('admin'), deleteFeeStructure);
router.get('/receipt/:id', protect, downloadReceipt);

module.exports = router;
