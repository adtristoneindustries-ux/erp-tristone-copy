const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');

// Get materials
router.get('/', protect, async (req, res) => {
  try {
    res.json([]);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
