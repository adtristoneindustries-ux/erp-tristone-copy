const Admission = require('../models/Admission');

exports.getAdmissions = async (req, res) => {
  try {
    const { status, academicYear } = req.query;
    const query = {};
    if (status) query.status = status;
    if (academicYear) query.academicYear = academicYear;
    const admissions = await Admission.find(query).sort({ createdAt: -1 });
    res.json(admissions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createAdmission = async (req, res) => {
  try {
    const admission = new Admission(req.body);
    await admission.save();
    res.status(201).json(admission);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.updateAdmission = async (req, res) => {
  try {
    const admission = await Admission.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(admission);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.deleteAdmission = async (req, res) => {
  try {
    await Admission.findByIdAndDelete(req.params.id);
    res.json({ message: 'Admission deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
