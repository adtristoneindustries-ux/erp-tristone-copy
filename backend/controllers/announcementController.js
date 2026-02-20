const Announcement = require('../models/Announcement');
const AnnouncementRead = require('../models/AnnouncementRead');

exports.createAnnouncement = async (req, res) => {
  try {
    const announcement = await Announcement.create({ ...req.body, createdBy: req.user._id });
    const populatedAnnouncement = await Announcement.findById(announcement._id)
      .populate('createdBy', 'name role');
    
    // Emit socket event for real-time notifications
    if (req.io) {
      req.io.emit('newAnnouncement', populatedAnnouncement);
    }
    
    res.status(201).json(populatedAnnouncement);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.getAnnouncements = async (req, res) => {
  try {
    const { targetRole } = req.query;
    let query = {};
    
    if (targetRole) {
      query.$or = [{ targetRole }, { targetRole: 'all' }];
    }

    const announcements = await Announcement.find(query)
      .populate('createdBy', 'name role')
      .sort('-createdAt');
    res.json(announcements);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getUnreadCount = async (req, res) => {
  try {
    const userId = req.user._id;
    const userRole = req.user.role;
    
    // Get announcements for user's role
    const announcements = await Announcement.find({
      $or: [{ targetRole: userRole }, { targetRole: 'all' }]
    });
    
    // Get read announcements for this user
    const readAnnouncements = await AnnouncementRead.find({
      user: userId,
      announcement: { $in: announcements.map(a => a._id) }
    });
    
    const unreadCount = announcements.length - readAnnouncements.length;
    res.json({ count: Math.max(0, unreadCount) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.markAsRead = async (req, res) => {
  try {
    const userId = req.user._id;
    const userRole = req.user.role;
    
    // Get all announcements for user's role
    const announcements = await Announcement.find({
      $or: [{ targetRole: userRole }, { targetRole: 'all' }]
    });
    
    // Mark all as read (upsert to avoid duplicates)
    const readPromises = announcements.map(announcement => 
      AnnouncementRead.findOneAndUpdate(
        { user: userId, announcement: announcement._id },
        { user: userId, announcement: announcement._id },
        { upsert: true, new: true }
      )
    );
    
    await Promise.all(readPromises);
    res.json({ message: 'Announcements marked as read' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateAnnouncement = async (req, res) => {
  try {
    const announcement = await Announcement.findById(req.params.id);
    if (!announcement) {
      return res.status(404).json({ message: 'Announcement not found' });
    }
    
    // Only allow creator or admin to update
    if (announcement.createdBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to update this announcement' });
    }
    
    const updatedAnnouncement = await Announcement.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    ).populate('createdBy', 'name role');
    
    if (req.io) {
      req.io.emit('announcementUpdated', updatedAnnouncement);
    }
    
    res.json(updatedAnnouncement);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.deleteAnnouncement = async (req, res) => {
  try {
    const announcement = await Announcement.findById(req.params.id);
    if (!announcement) {
      return res.status(404).json({ message: 'Announcement not found' });
    }
    
    // Only allow creator or admin to delete
    if (announcement.createdBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to delete this announcement' });
    }
    
    await Announcement.findByIdAndDelete(req.params.id);
    
    if (req.io) {
      req.io.emit('announcementDeleted', req.params.id);
    }
    
    res.json({ message: 'Announcement deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
