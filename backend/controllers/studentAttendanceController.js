const StudentAttendance = require('../models/StudentAttendance');

exports.createStudentAttendance = async (req, res) => {
  try {
    // If user details not provided, fetch from User collection
    if (!req.body.studentName && req.body.student) {
      const User = require('../models/User');
      const user = await User.findById(req.body.student);
      if (user) {
        req.body.studentName = user.name;
        req.body.studentEmail = user.email;
        req.body.studentClass = user.class;
      }
    }
    
    const attendance = await StudentAttendance.create(req.body);
    const populated = await attendance.populate(['student', 'subject']);
    
    req.io.emit('studentAttendanceUpdate', populated);
    res.status(201).json(populated);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.getStudentAttendance = async (req, res) => {
  try {
    const { student, date, startDate, endDate } = req.query;
    let query = {};
    
    if (student) query.student = student;
    if (date) query.date = new Date(date);
    if (startDate && endDate) {
      query.date = { $gte: new Date(startDate), $lte: new Date(endDate) };
    }

    const attendance = await StudentAttendance.find(query).populate(['student', 'subject']).sort('-date');
    res.json(attendance);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateStudentAttendance = async (req, res) => {
  try {
    const attendance = await StudentAttendance.findByIdAndUpdate(req.params.id, req.body, { new: true })
      .populate(['student', 'subject']);
    
    req.io.emit('studentAttendanceUpdate', attendance);
    res.json(attendance);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.deleteStudentAttendance = async (req, res) => {
  try {
    await StudentAttendance.findByIdAndDelete(req.params.id);
    res.json({ message: 'Student attendance deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};