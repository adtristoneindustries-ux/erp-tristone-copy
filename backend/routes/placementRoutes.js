const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');

// Admin Stats
router.get('/stats/admin', protect, async (req, res) => {
  res.json({ data: { totalCompanies: 0, totalApplications: 0, selected: 0, ongoing: 0, totalDrives: 0, shortlisted: 0, rejected: 0 } });
});

// Student Stats
router.get('/stats/student', protect, async (req, res) => {
  res.json({ 
    data: { 
      totalApplications: 0, 
      shortlisted: 0, 
      selected: 0, 
      rejected: 0,
      pending: 0,
      upcomingDrives: 0
    } 
  });
});

// Student Profile
router.get('/profile/student', protect, async (req, res) => {
  const profile = {
    cgpa: req.user.cgpa || 0,
    arrears_count: req.user.arrears_count || 0,
    resume_url: req.user.resume_url || '',
    skills: req.user.skills || [],
    portfolio_link: req.user.portfolio_link || '',
    year: req.user.year || '',
    department: req.user.department || ''
  };
  res.json({ data: profile });
});

router.put('/profile/student', protect, async (req, res) => {
  try {
    const User = require('../models/User');
    const { cgpa, arrears_count, resume_url, skills, portfolio_link, year, department } = req.body;
    
    const updatedUser = await User.findByIdAndUpdate(
      req.user._id, 
      {
        cgpa: parseFloat(cgpa) || 0,
        arrears_count: parseInt(arrears_count) || 0,
        resume_url,
        skills: Array.isArray(skills) ? skills : [],
        portfolio_link,
        year: parseInt(year) || 0,
        department
      },
      { new: true }
    ).select('-password');
    
    res.json({ 
      message: 'Profile updated successfully',
      data: {
        cgpa: updatedUser.cgpa,
        arrears_count: updatedUser.arrears_count,
        resume_url: updatedUser.resume_url,
        skills: updatedUser.skills,
        portfolio_link: updatedUser.portfolio_link,
        year: updatedUser.year,
        department: updatedUser.department
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Applications
router.get('/applications', protect, async (req, res) => {
  res.json({ data: [] });
});

router.post('/applications', protect, async (req, res) => {
  res.json({ data: req.body, message: 'Application submitted successfully' });
});

// Companies
router.get('/companies', protect, async (req, res) => {
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

// Drives
router.get('/drives', protect, async (req, res) => {
  res.json({ data: [] });
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
