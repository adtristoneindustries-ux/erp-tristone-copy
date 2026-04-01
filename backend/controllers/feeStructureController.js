const FeeStructure = require('../models/FeeStructure');

exports.getFeeStructures = async (req, res) => {
  try {
    const structures = await FeeStructure.find().sort({ createdAt: -1 });
    res.json(structures);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createFeeStructure = async (req, res) => {
  try {
    const structure = new FeeStructure(req.body);
    await structure.save();
    res.status(201).json(structure);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.updateFeeStructure = async (req, res) => {
  try {
    const structure = await FeeStructure.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(structure);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.deleteFeeStructure = async (req, res) => {
  try {
    await FeeStructure.findByIdAndDelete(req.params.id);
    res.json({ message: 'Fee structure deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
