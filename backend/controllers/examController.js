const Exam = require('../models/Exam');
const User = require('../models/User');
const Subject = require('../models/Subject');
const Class = require('../models/Class');

// Get all exams (with filters)
exports.getExams = async (req, res) => {
  try {
    const { classId, status, startDate, endDate } = req.query;
    const filter = {};

    if (req.user.role === 'student') {
      const student = await User.findById(req.user.id);
      filter.class = student.class;
    } else if (classId) {
      filter.class = classId;
    }

    if (status) filter.status = status;
    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate);
      if (endDate) filter.date.$lte = new Date(endDate);
    }

    const exams = await Exam.find(filter)
      .populate('subject', 'name code')
      .populate('class', 'name section')
      .populate('invigilators', 'name email')
      .populate('createdBy', 'name')
      .sort({ date: -1, createdAt: -1 });

    res.json(exams);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get single exam
exports.getExam = async (req, res) => {
  try {
    const exam = await Exam.findById(req.params.id)
      .populate('subject', 'name code')
      .populate('class', 'name section')
      .populate('invigilators', 'name email phone')
      .populate('createdBy', 'name');

    if (!exam) {
      return res.status(404).json({ message: 'Exam not found' });
    }

    res.json(exam);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create exam (Admin/Staff)
exports.createExam = async (req, res) => {
  try {
    const {
      examName,
      examType,
      subject,
      class: classId,
      date,
      startTime,
      endTime,
      duration,
      hall,
      invigilators,
      totalMarks,
      instructions
    } = req.body;

    // Validate subject and class
    const subjectExists = await Subject.findById(subject);
    const classExists = await Class.findById(classId);

    if (!subjectExists) {
      return res.status(404).json({ message: 'Subject not found' });
    }
    if (!classExists) {
      return res.status(404).json({ message: 'Class not found' });
    }

    // Check for conflicts
    const conflict = await Exam.findOne({
      class: classId,
      date: new Date(date),
      $or: [
        { startTime: { $lte: startTime }, endTime: { $gt: startTime } },
        { startTime: { $lt: endTime }, endTime: { $gte: endTime } }
      ],
      status: { $ne: 'Cancelled' }
    });

    if (conflict) {
      return res.status(400).json({ message: 'Time slot conflict with another exam' });
    }

    const exam = new Exam({
      examName,
      examType,
      subject,
      class: classId,
      date,
      startTime,
      endTime,
      duration,
      hall,
      invigilators: invigilators || [],
      totalMarks: totalMarks || 100,
      instructions: instructions || '',
      createdBy: req.user.id
    });

    await exam.save();
    
    const populatedExam = await Exam.findById(exam._id)
      .populate('subject', 'name code')
      .populate('class', 'name section')
      .populate('invigilators', 'name email')
      .populate('createdBy', 'name');

    // Emit socket event
    if (req.app.get('io')) {
      req.app.get('io').emit('examCreated', populatedExam);
    }

    res.status(201).json(populatedExam);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Update exam
exports.updateExam = async (req, res) => {
  try {
    const exam = await Exam.findById(req.params.id);

    if (!exam) {
      return res.status(404).json({ message: 'Exam not found' });
    }

    // Staff can only update their own created exams
    if (req.user.role === 'staff' && exam.createdBy.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to update this exam' });
    }

    const updates = req.body;
    
    // Check for conflicts if time/date changed
    if (updates.date || updates.startTime || updates.endTime) {
      const conflict = await Exam.findOne({
        _id: { $ne: exam._id },
        class: updates.class || exam.class,
        date: new Date(updates.date || exam.date),
        $or: [
          { startTime: { $lte: updates.startTime || exam.startTime }, endTime: { $gt: updates.startTime || exam.startTime } },
          { startTime: { $lt: updates.endTime || exam.endTime }, endTime: { $gte: updates.endTime || exam.endTime } }
        ],
        status: { $ne: 'Cancelled' }
      });

      if (conflict) {
        return res.status(400).json({ message: 'Time slot conflict with another exam' });
      }
    }

    Object.keys(updates).forEach(key => {
      exam[key] = updates[key];
    });

    await exam.save();

    const updatedExam = await Exam.findById(exam._id)
      .populate('subject', 'name code')
      .populate('class', 'name section')
      .populate('invigilators', 'name email')
      .populate('createdBy', 'name');

    // Emit socket event
    if (req.app.get('io')) {
      req.app.get('io').emit('examUpdated', updatedExam);
    }

    res.json(updatedExam);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete exam
exports.deleteExam = async (req, res) => {
  try {
    const exam = await Exam.findById(req.params.id);

    if (!exam) {
      return res.status(404).json({ message: 'Exam not found' });
    }

    // Staff can only delete their own created exams
    if (req.user.role === 'staff' && exam.createdBy.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to delete this exam' });
    }

    await exam.deleteOne();

    // Emit socket event
    if (req.app.get('io')) {
      req.app.get('io').emit('examDeleted', { id: req.params.id });
    }

    res.json({ message: 'Exam deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get upcoming exams
exports.getUpcomingExams = async (req, res) => {
  try {
    const filter = {
      date: { $gte: new Date() },
      status: 'Scheduled'
    };

    if (req.user.role === 'student') {
      const student = await User.findById(req.user.id);
      filter.class = student.class;
    }

    const exams = await Exam.find(filter)
      .populate('subject', 'name code')
      .populate('class', 'name section')
      .populate('invigilators', 'name')
      .sort({ date: 1, startTime: 1 })
      .limit(10);

    res.json(exams);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get exam statistics
exports.getExamStats = async (req, res) => {
  try {
    const filter = {};
    
    if (req.user.role === 'student') {
      const student = await User.findById(req.user.id);
      filter.class = student.class;
    }

    const total = await Exam.countDocuments(filter);
    const scheduled = await Exam.countDocuments({ ...filter, status: 'Scheduled' });
    const completed = await Exam.countDocuments({ ...filter, status: 'Completed' });
    const upcoming = await Exam.countDocuments({
      ...filter,
      date: { $gte: new Date() },
      status: 'Scheduled'
    });

    res.json({ total, scheduled, completed, upcoming });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
