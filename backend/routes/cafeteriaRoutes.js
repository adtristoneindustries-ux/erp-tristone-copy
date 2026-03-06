const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  // Admin
  createCanteen,
  getCanteens,
  updateCanteen,
  deleteCanteen,
  getStaffUsers,
  getCanteenWithStaff,
  createCanteenStaff,
  getCanteenStaff,
  updateCanteenStaff,
  getAdminDashboard,
  getDailySalesReport,
  getMonthlySalesReport,
  getItemWiseSalesReport,
  getPaymentMethodReport,
  // Staff
  createFoodItem,
  getFoodItems,
  updateFoodItem,
  deleteFoodItem,
  getOrders,
  updateOrderStatus,
  getRatings,
  respondToRating,
  // User
  getAvailableFoodItems,
  placeOrder,
  getUserOrders,
  submitRating,
  getUserRatings,
  deleteRating,
  checkCanteenStaff
} = require('../controllers/cafeteriaController');

// Admin Routes
router.post('/canteens', protect, authorize('admin'), createCanteen);
router.get('/canteens', protect, getCanteens);
router.get('/canteens/:id', protect, authorize('admin'), getCanteenWithStaff);
router.put('/canteens/:id', protect, authorize('admin'), updateCanteen);
router.delete('/canteens/:id', protect, authorize('admin'), deleteCanteen);

router.get('/staff-users', protect, authorize('admin'), getStaffUsers);
router.post('/staff', protect, authorize('admin'), createCanteenStaff);
router.get('/staff', protect, authorize('admin'), getCanteenStaff);
router.put('/staff/:id', protect, authorize('admin'), updateCanteenStaff);

router.get('/admin/dashboard', protect, authorize('admin'), getAdminDashboard);
router.get('/admin/reports/daily', protect, authorize('admin'), getDailySalesReport);
router.get('/admin/reports/monthly', protect, authorize('admin'), getMonthlySalesReport);
router.get('/admin/reports/items', protect, authorize('admin'), getItemWiseSalesReport);
router.get('/admin/reports/payment', protect, authorize('admin'), getPaymentMethodReport);

// Staff Routes
router.post('/food-items', protect, authorize('admin', 'staff'), createFoodItem);
router.get('/food-items', protect, getFoodItems);
router.put('/food-items/:id', protect, authorize('admin', 'staff'), updateFoodItem);
router.delete('/food-items/:id', protect, authorize('admin', 'staff'), deleteFoodItem);

router.get('/orders', protect, getOrders);
router.put('/orders/:id/status', protect, authorize('admin', 'staff'), updateOrderStatus);

router.get('/ratings', protect, getRatings);
router.put('/ratings/:id/respond', protect, authorize('admin', 'staff'), respondToRating);

// User Routes
router.get('/menu', protect, getAvailableFoodItems);
router.post('/order', protect, placeOrder);
router.get('/my-orders', protect, getUserOrders);
router.post('/rate', protect, submitRating);
router.get('/my-ratings', protect, getUserRatings);
router.delete('/ratings/:id', protect, deleteRating);
router.get('/check-staff', protect, checkCanteenStaff);

module.exports = router;
