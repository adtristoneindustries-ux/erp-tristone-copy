const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');

router.get('/stats/admin', protect, async (req, res) => {
  res.json({ data: { totalCompanies: 0, totalApplications: 0, selected: 0, ongoing: 0, totalDrives: 0, shortlisted: 0, rejected: 0 } });
});

router.get('/companies', protect, async (req, res) => {
  res.json({ data: [] });
});

router.get('/drives', protect, async (req, res) => {
  res.json({ data: [] });
});

router.post('/companies', protect, async (req, res) => {
  res.json({ data: req.body });
});

router.put('/companies/:id', protect, async (req, res) => {
  res.json({ data: req.body });
});

router.delete('/companies/:id', protect, async (req, res) => {
  res.json({ message: 'Deleted' });
});

router.post('/drives', protect, async (req, res) => {
  res.json({ data: req.body });
});

router.put('/drives/:id', protect, async (req, res) => {
  res.json({ data: req.body });
});

router.delete('/drives/:id', protect, async (req, res) => {
  res.json({ message: 'Deleted' });
});

module.exports = router;
