const Mark = require('../models/Mark');
const MarkRead = require('../models/MarkRead');

exports.createMark = async (req, res) => {
  try {
    const mark = await Mark.create(req.body);
    const populated = await mark.populate(['student', 'subject']);
    
    req.io.emit('markUpdate', populated);
    res.status(201).json(populated);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.getMarks = async (req, res) => {
  try {
    const { student, subject, class: className, section, search } = req.query;
    let query = {};
    
    if (student) query.student = student;
    if (subject) query.subject = subject;

    const marks = await Mark.find(query)
      .populate([
        { path: 'student', select: 'name class section rollNumber' },
        { path: 'subject', select: 'name code' }
      ])
      .sort('-createdAt');

    let filteredMarks = marks;

    // Filter by class
    if (className) {
      filteredMarks = filteredMarks.filter(mark => 
        mark.student && mark.student.class === className
      );
    }

    // Filter by section
    if (section) {
      filteredMarks = filteredMarks.filter(mark => 
        mark.student && mark.student.section === section
      );
    }

    // Search functionality
    if (search) {
      const searchTerm = search.toLowerCase();
      filteredMarks = filteredMarks.filter(mark => 
        (mark.student?.name?.toLowerCase().includes(searchTerm)) ||
        (mark.subject?.name?.toLowerCase().includes(searchTerm)) ||
        (mark.examType?.toLowerCase().includes(searchTerm)) ||
        (mark.student?.rollNumber?.toLowerCase().includes(searchTerm))
      );
    }

    res.json(filteredMarks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateMark = async (req, res) => {
  try {
    const mark = await Mark.findByIdAndUpdate(req.params.id, req.body, { new: true })
      .populate(['student', 'subject']);
    
    req.io.emit('markUpdate', mark);
    res.json(mark);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.deleteMark = async (req, res) => {
  try {
    await Mark.findByIdAndDelete(req.params.id);
    res.json({ message: 'Mark deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getUnreadCount = async (req, res) => {
  try {
    const userId = req.user._id;
    const userRole = req.user.role;
    
    let marks = [];
    if (userRole === 'student') {
      marks = await Mark.find({ student: userId });
    } else if (userRole === 'staff') {
      const subjects = await require('../models/Subject').find({ teacher: userId });
      marks = await Mark.find({ subject: { $in: subjects.map(s => s._id) } });
    }
    
    const readMarks = await MarkRead.find({
      user: userId,
      mark: { $in: marks.map(m => m._id) }
    });
    
    const unreadCount = marks.length - readMarks.length;
    res.json({ count: Math.max(0, unreadCount) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.markAsRead = async (req, res) => {
  try {
    const userId = req.user._id;
    const userRole = req.user.role;
    
    let marks = [];
    if (userRole === 'student') {
      marks = await Mark.find({ student: userId });
    } else if (userRole === 'staff') {
      const subjects = await require('../models/Subject').find({ teacher: userId });
      marks = await Mark.find({ subject: { $in: subjects.map(s => s._id) } });
    }
    
    const readPromises = marks.map(mark => 
      MarkRead.findOneAndUpdate(
        { user: userId, mark: mark._id },
        { user: userId, mark: mark._id },
        { upsert: true, new: true }
      )
    );
    
    await Promise.all(readPromises);
    res.json({ message: 'Marks marked as read' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getRecentUpdates = async (req, res) => {
  try {
    const userId = req.user._id;
    const userRole = req.user.role;
    
    let marks = [];
    if (userRole === 'student') {
      marks = await Mark.find({ student: userId })
        .populate(['student', 'subject'])
        .sort('-updatedAt')
        .limit(10);
    } else if (userRole === 'staff') {
      const subjects = await require('../models/Subject').find({ teacher: userId });
      marks = await Mark.find({ subject: { $in: subjects.map(s => s._id) } })
        .populate(['student', 'subject'])
        .sort('-updatedAt')
        .limit(10);
    }
    
    res.json(marks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
