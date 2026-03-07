const Placement = require('../models/Placement');

exports.getPlacements = async (req, res) => {
  try {
    const placements = await Placement.find().populate('applications.student', 'name email');
    res.json(placements);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createPlacement = async (req, res) => {
  try {
    const placement = new Placement(req.body);
    await placement.save();
    res.status(201).json(placement);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.updatePlacement = async (req, res) => {
  try {
    const placement = await Placement.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(placement);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.applyPlacement = async (req, res) => {
  try {
    const placement = await Placement.findById(req.params.id);
    placement.applications.push({ student: req.body.student, appliedDate: new Date() });
    await placement.save();
    req.io.emit('placementUpdate', placement);
    res.json(placement);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.updateApplication = async (req, res) => {
  try {
    const placement = await Placement.findById(req.params.id);
    const app = placement.applications.id(req.params.appId);
    app.status = req.body.status;
    await placement.save();
    req.io.emit('placementUpdate', placement);
    res.json(placement);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.deletePlacement = async (req, res) => {
  try {
    await Placement.findByIdAndDelete(req.params.id);
    res.json({ message: 'Placement deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
