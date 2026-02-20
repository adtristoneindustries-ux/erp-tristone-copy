const Class = require('../models/Class');

exports.getClasses = async (req, res) => {
  try {
    const classes = await Class.find({ isActive: true })
      .populate('classTeacher', 'name email')
      .sort({ className: 1, section: 1 });
    
    res.json(classes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createClass = async (req, res) => {
  try {
    const classData = {
      ...req.body,
      className: req.body.className?.trim(),
      classCode: req.body.classCode?.trim().toUpperCase(),
      section: req.body.section?.trim()
    };

    const existingClass = await Class.findOne({
      className: classData.className,
      section: classData.section
    });

    if (existingClass) {
      return res.status(400).json({ message: 'Class with this name and section already exists' });
    }

    const newClass = await Class.create(classData);
    const populatedClass = await Class.findById(newClass._id).populate('classTeacher', 'name email');
    
    res.status(201).json(populatedClass);
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ message: messages.join(', ') });
    }
    res.status(400).json({ message: error.message });
  }
};

exports.updateClass = async (req, res) => {
  try {
    const updateData = {
      ...req.body,
      className: req.body.className?.trim(),
      classCode: req.body.classCode?.trim().toUpperCase(),
      section: req.body.section?.trim()
    };

    const updatedClass = await Class.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate('classTeacher', 'name email');

    if (!updatedClass) {
      return res.status(404).json({ message: 'Class not found' });
    }

    res.json(updatedClass);
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ message: messages.join(', ') });
    }
    res.status(400).json({ message: error.message });
  }
};

exports.deleteClass = async (req, res) => {
  try {
    const deletedClass = await Class.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );

    if (!deletedClass) {
      return res.status(404).json({ message: 'Class not found' });
    }

    res.json({ message: 'Class deactivated successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};