const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  getStudentTransport,
  getAllRoutes,
  trackBusLocation,
  assignTransport,
  createRoute,
  updateRoute
} = require('../controllers/transportController');

router.get('/my-transport', protect, getStudentTransport);
router.get('/routes', protect, getAllRoutes);
router.get('/track', protect, trackBusLocation);
router.post('/assign', protect, assignTransport);
router.post('/routes', protect, createRoute);
router.put('/routes/:id', protect, updateRoute);

module.exports = router;
