const Feedback = require('../models/Feedback');

exports.sendFeedback = async (req, res) => {
  try {
    const { to, message, isAnonymous } = req.body;
    
    const feedback = await Feedback.create({
      from: req.user.id,
      to,
      message,
      isAnonymous: isAnonymous || false
    });

    await feedback.populate('from to', 'name role');
    
    req.io.emit('newFeedback', { recipientId: to });
    
    res.status(201).json(feedback);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.getMyFeedback = async (req, res) => {
  try {
    const feedback = await Feedback.find({ to: req.user.id })
      .populate('from', 'name role subject')
      .sort({ createdAt: -1 });
    
    res.json(feedback);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getSentFeedback = async (req, res) => {
  try {
    const feedback = await Feedback.find({ from: req.user.id })
      .populate('to', 'name role class section rollNumber')
      .sort({ createdAt: -1 });
    
    res.json(feedback);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.markAsRead = async (req, res) => {
  try {
    await Feedback.updateMany(
      { to: req.user.id, isRead: false },
      { isRead: true }
    );
    res.json({ message: 'Marked as read' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
