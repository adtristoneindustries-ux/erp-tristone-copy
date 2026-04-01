const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { checkPlacementAccess } = require('../middleware/placementAccess');
const placementController = require('../controllers/placementControllerNew');

// Stats - Protected with placement access check
router.get('/stats/admin', protect, checkPlacementAccess, placementController.getAdminStats);
router.get('/stats/student', protect, checkPlacementAccess, placementController.getStudentStats);

// Student Profile - Protected with placement access check
router.get('/profile/student', protect, checkPlacementAccess, async (req, res) => {
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

router.put('/profile/student', protect, checkPlacementAccess, async (req, res) => {
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

// Companies - Admin only, no need for placement access check
router.get('/companies', protect, placementController.getCompanies);
router.post('/companies', protect, placementController.createCompany);
router.put('/companies/:id', protect, placementController.updateCompany);
router.delete('/companies/:id', protect, placementController.deleteCompany);

// Drives - Protected with placement access check for staff
router.get('/drives', protect, checkPlacementAccess, placementController.getDrives);
router.post('/drives', protect, checkPlacementAccess, placementController.createDrive);
router.put('/drives/:id', protect, checkPlacementAccess, placementController.updateDrive);
router.delete('/drives/:id', protect, checkPlacementAccess, placementController.deleteDrive);

// Applications - Protected with placement access check
router.get('/applications', protect, checkPlacementAccess, placementController.getApplications);
router.post('/applications', protect, checkPlacementAccess, placementController.createApplication);
router.put('/applications/:id/status', protect, checkPlacementAccess, placementController.updateApplicationStatus);

module.exports = router;
