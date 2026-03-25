const express = require('express');
const router = express.Router();
const { getFees, getStudentFees, createFee, updateFee, addPayment, deleteFee } = require('../controllers/feeController');
const { protect } = require('../middleware/auth');

router.get('/', protect, getFees);
router.get('/my-fees', protect, getStudentFees);
router.post('/', protect, createFee);
router.put('/:id', protect, updateFee);
router.post('/:id/payment', protect, addPayment);
router.delete('/:id', protect, deleteFee);

module.exports = router;
