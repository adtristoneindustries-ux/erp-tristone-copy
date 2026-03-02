const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  createHomework,
  getAllHomework,
  getHomeworkById,
  updateHomework,
  submitHomework,
  getHomeworkSubmissions,
  deleteHomework
} = require('../controllers/homeworkController');

router.post('/', protect, authorize('admin', 'staff'), createHomework);
router.get('/test-student/:studentId', async (req, res) => {
  try {
    const User = require('../models/User');
    const Homework = require('../models/Homework');
    const student = await User.findById(req.params.studentId);
    const allHomework = await Homework.find().populate('class');
    res.json({
      student: { class: student.class, section: student.section },
      homework: allHomework.map(h => ({ topic: h.topic, class: h.class?.className, section: h.class?.section }))
    });
  } catch (e) { res.status(500).json({ error: e.message }); }
});
router.get('/', protect, getAllHomework);
router.get('/submissions', protect, authorize('admin', 'staff'), getHomeworkSubmissions);
router.get('/:id', protect, getHomeworkById);
router.put('/:id', protect, authorize('admin', 'staff'), updateHomework);
router.post('/:homeworkId/submit', protect, authorize('student'), submitHomework);
router.delete('/:id', protect, authorize('admin', 'staff'), deleteHomework);

module.exports = router;
