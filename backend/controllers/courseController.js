const Course = require('../models/Course');
const Enrollment = require('../models/Enrollment');
const User = require('../models/User');

exports.createCourse = async (req, res) => {
  try {
    const course = await Course.create({ ...req.body, instructor: req.user.id });
    res.status(201).json({ success: true, data: await course.populate('instructor', 'name email') });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.getCourses = async (req, res) => {
  try {
    const { type, status, eligibleClass } = req.query;
    const filter = {};
    if (type) filter.type = type;
    if (status) filter.status = status;
    if (eligibleClass) filter.eligibleClasses = eligibleClass;
    
    const courses = await Course.find(filter).populate('instructor', 'name email').sort('-createdAt');
    res.json({ success: true, data: courses });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.getCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id).populate('instructor', 'name email');
    if (!course) return res.status(404).json({ success: false, message: 'Course not found' });
    res.json({ success: true, data: course });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.updateCourse = async (req, res) => {
  try {
    const course = await Course.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true }).populate('instructor', 'name email');
    if (!course) return res.status(404).json({ success: false, message: 'Course not found' });
    res.json({ success: true, data: course });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.deleteCourse = async (req, res) => {
  try {
    const course = await Course.findByIdAndDelete(req.params.id);
    if (!course) return res.status(404).json({ success: false, message: 'Course not found' });
    await Enrollment.deleteMany({ course: req.params.id });
    res.json({ success: true, message: 'Course deleted' });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.requestEnrollment = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ success: false, message: 'Course not found' });
    
    const student = await User.findById(req.user.id);
    if (!course.eligibleClasses.includes(student.class)) {
      return res.status(403).json({ success: false, message: 'Not eligible for this course' });
    }
    
    const existing = await Enrollment.findOne({ course: req.params.id, student: req.user.id });
    if (existing) return res.status(400).json({ success: false, message: 'Already enrolled or pending' });
    
    const enrollment = await Enrollment.create({ course: req.params.id, student: req.user.id, requestMessage: req.body.requestMessage });
    res.status(201).json({ success: true, data: enrollment });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.getEnrollments = async (req, res) => {
  try {
    const { courseId, studentId, status } = req.query;
    const filter = {};
    if (courseId) filter.course = courseId;
    if (studentId) filter.student = studentId;
    if (status) filter.status = status;
    
    const enrollments = await Enrollment.find(filter)
      .populate('course')
      .populate('student', 'name email class section rollNumber')
      .sort('-createdAt');
    res.json({ success: true, data: enrollments });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.updateEnrollmentStatus = async (req, res) => {
  try {
    const { status, responseMessage } = req.body;
    const update = { status, responseMessage };
    if (status === 'approved') update.enrolledAt = new Date();
    
    const enrollment = await Enrollment.findByIdAndUpdate(req.params.id, update, { new: true })
      .populate('course')
      .populate('student', 'name email class section');
    
    if (!enrollment) return res.status(404).json({ success: false, message: 'Enrollment not found' });
    res.json({ success: true, data: enrollment });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.getMyEnrollments = async (req, res) => {
  try {
    const enrollments = await Enrollment.find({ student: req.user.id, status: 'approved' })
      .populate('course')
      .populate({ path: 'course', populate: { path: 'instructor', select: 'name email' } });
    res.json({ success: true, data: enrollments });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};
