const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const ctrl = require('../controllers/stemController');

router.get('/stats', protect, ctrl.getStats);
router.get('/my-projects', protect, ctrl.getMyProjects);
router.get('/mentor-projects', protect, ctrl.getMentorProjects);
router.get('/', protect, ctrl.getProjects);
router.get('/:id', protect, ctrl.getProject);
router.post('/', protect, ctrl.createProject);
router.put('/:id', protect, ctrl.updateProject);
router.delete('/:id', protect, ctrl.deleteProject);
router.post('/:id/enroll', protect, ctrl.enrollStudent);
router.post('/:id/unenroll', protect, ctrl.unenrollStudent);
router.post('/:id/submit', protect, ctrl.submitWork);
router.put('/:id/grade/:submissionId', protect, ctrl.gradeSubmission);
router.put('/:id/milestone/:milestoneId', protect, ctrl.updateMilestone);

module.exports = router;
