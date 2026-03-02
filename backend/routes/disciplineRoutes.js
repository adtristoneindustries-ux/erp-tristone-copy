const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { protect, authorize } = require('../middleware/auth');

// Add discipline record to student/staff
router.post('/', protect, authorize('admin', 'staff'), async (req, res) => {
  try {
    const { userId, offenseType, actionStatus, description } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.disciplineRecords.push({
      offenseType,
      actionStatus,
      description,
      date: new Date(),
      addedBy: req.user._id
    });

    await user.save();

    res.status(201).json({ message: 'Discipline record added successfully', user });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get discipline records for a user
router.get('/user/:userId', protect, async (req, res) => {
  try {
    const user = await User.findById(req.params.userId)
      .select('disciplineRecords name email role')
      .populate('disciplineRecords.addedBy', 'name');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ disciplineRecords: user.disciplineRecords, user: { name: user.name, email: user.email, role: user.role } });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get all discipline records (for admin)
router.get('/', protect, authorize('admin'), async (req, res) => {
  try {
    const { role } = req.query;
    const query = {};
    if (role) query.role = role;

    const users = await User.find({ ...query, 'disciplineRecords.0': { $exists: true } })
      .select('name email role class section disciplineRecords')
      .populate('disciplineRecords.addedBy', 'name');

    const records = [];
    users.forEach(user => {
      user.disciplineRecords.forEach(record => {
        records.push({
          _id: record._id,
          userId: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          class: user.class,
          section: user.section,
          offenseType: record.offenseType,
          actionStatus: record.actionStatus,
          description: record.description,
          date: record.date,
          addedBy: record.addedBy
        });
      });
    });

    res.json(records.sort((a, b) => new Date(b.date) - new Date(a.date)));
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
