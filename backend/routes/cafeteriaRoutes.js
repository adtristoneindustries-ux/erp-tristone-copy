const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  getWeeklyMenu,
  getWallet,
  addMoney,
  getTransactionHistory,
  getTodaySpecials,
  placeOrder,
  getOrderHistory
} = require('../controllers/cafeteriaController');

router.get('/menu', protect, getWeeklyMenu);
router.get('/wallet', protect, getWallet);
router.post('/wallet/add', protect, addMoney);
router.get('/wallet/history', protect, getTransactionHistory);
router.get('/specials', protect, getTodaySpecials);
router.post('/order', protect, placeOrder);
router.get('/orders', protect, getOrderHistory);

module.exports = router;
