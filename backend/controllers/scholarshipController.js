const Scholarship = require('../models/Scholarship');

exports.getScholarships = async (req, res) => {
  try {
    const scholarships = await Scholarship.find().populate('applications.student', 'name email');
    res.json(scholarships);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createScholarship = async (req, res) => {
  try {
    const scholarship = new Scholarship(req.body);
    await scholarship.save();
    res.status(201).json(scholarship);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.updateScholarship = async (req, res) => {
  try {
    const scholarship = await Scholarship.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(scholarship);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.applyScholarship = async (req, res) => {
  try {
    const scholarship = await Scholarship.findById(req.params.id);
    scholarship.applications.push({ student: req.body.student, appliedDate: new Date() });
    await scholarship.save();
    req.io.emit('scholarshipUpdate', scholarship);
    res.json(scholarship);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.updateApplication = async (req, res) => {
  try {
    const scholarship = await Scholarship.findById(req.params.id);
    const app = scholarship.applications.id(req.params.appId);
    app.status = req.body.status;
    await scholarship.save();
    req.io.emit('scholarshipUpdate', scholarship);
    res.json(scholarship);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.deleteScholarship = async (req, res) => {
  try {
    await Scholarship.findByIdAndDelete(req.params.id);
    res.json({ message: 'Scholarship deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
