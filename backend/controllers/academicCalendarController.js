const AcademicCalendar = require('../models/AcademicCalendar');

exports.getEvents = async (req, res) => {
  try {
    const { academicYear, type } = req.query;
    const query = {};
    if (academicYear) query.academicYear = academicYear;
    if (type) query.type = type;
    const events = await AcademicCalendar.find(query).sort({ startDate: 1 });
    res.json(events);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createEvent = async (req, res) => {
  try {
    const event = new AcademicCalendar(req.body);
    await event.save();
    res.status(201).json(event);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.updateEvent = async (req, res) => {
  try {
    const event = await AcademicCalendar.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(event);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.deleteEvent = async (req, res) => {
  try {
    await AcademicCalendar.findByIdAndDelete(req.params.id);
    res.json({ message: 'Event deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
