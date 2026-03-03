const Activity = require('../models/Activity');
const User = require('../models/User');

exports.getActivities = async (req, res) => {
  try {
    const { type } = req.query;
    const query = type ? { type, status: 'active' } : { status: 'active' };
    const activities = await Activity.find(query).sort({ createdAt: -1 });
    res.json(activities);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getActivity = async (req, res) => {
  try {
    const activity = await Activity.findById(req.params.id);
    if (!activity) return res.status(404).json({ message: 'Activity not found' });
    res.json(activity);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createActivity = async (req, res) => {
  try {
    const activity = new Activity(req.body);
    await activity.save();
    res.status(201).json(activity);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.updateActivity = async (req, res) => {
  try {
    const activity = await Activity.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!activity) return res.status(404).json({ message: 'Activity not found' });
    res.json(activity);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.deleteActivity = async (req, res) => {
  try {
    const activity = await Activity.findByIdAndDelete(req.params.id);
    if (!activity) return res.status(404).json({ message: 'Activity not found' });
    res.json({ message: 'Activity deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.enrollActivity = async (req, res) => {
  try {
    const { activityId } = req.body;
    const userId = req.user.id;

    const activity = await Activity.findById(activityId);
    if (!activity) return res.status(404).json({ message: 'Activity not found' });

    const user = await User.findById(userId);
    if (user.enrolledActivities.includes(activityId)) {
      return res.status(400).json({ message: 'Already enrolled' });
    }

    if (activity.maxMembers && activity.memberCount >= activity.maxMembers) {
      return res.status(400).json({ message: 'Activity is full' });
    }

    user.enrolledActivities.push(activityId);
    activity.memberCount += 1;

    await user.save();
    await activity.save();

    res.json({ message: 'Enrolled successfully', activity });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getMyEnrollments = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate('enrolledActivities');
    res.json(user.enrolledActivities || []);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
