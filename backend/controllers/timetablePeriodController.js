const TimetablePeriod = require('../models/TimetablePeriod');
const User = require('../models/User');

// Save/Update individual period
exports.savePeriod = async (req, res) => {
  try {
    const { className, section, day, period, time, subject, teacher } = req.body;
    
    // Validate required fields
    if (!className || !section || !day || !period || !subject || !teacher) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Validate teacher exists
    const staffMember = await User.findById(teacher);
    if (!staffMember || staffMember.role !== 'staff') {
      return res.status(400).json({ message: 'Invalid staff member' });
    }

    // Update or create period
    const periodData = await TimetablePeriod.findOneAndUpdate(
      { className, section, day, period },
      { className, section, day, period, time, subject, teacher },
      { upsert: true, new: true, runValidators: true }
    ).populate('teacher', 'name subject');

    req.io?.emit('timetableUpdate', { type: 'periodUpdate', period: periodData });
    
    res.json(periodData);
  } catch (error) {
    console.error('Save period error:', error);
    res.status(400).json({ message: error.message });
  }
};

// Get timetable for a class
exports.getClassTimetable = async (req, res) => {
  try {
    const { className, section } = req.query;
    
    if (!className || !section) {
      return res.status(400).json({ message: 'Class name and section are required' });
    }

    const periods = await TimetablePeriod.find({ className, section })
      .populate('teacher', 'name subject')
      .sort({ day: 1, period: 1 });

    // Format data for frontend
    const schedule = {
      Monday: [],
      Tuesday: [],
      Wednesday: [],
      Thursday: [],
      Friday: []
    };

    // Initialize all periods (1-8) for each day
    const timeSlots = [
      '9:00-9:45', '9:45-10:30', '10:45-11:30', '11:30-12:15',
      '1:00-1:45', '1:45-2:30', '2:30-3:15', '3:15-4:00'
    ];

    ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].forEach(day => {
      for (let p = 1; p <= 8; p++) {
        const existingPeriod = periods.find(period => period.day === day && period.period === p);
        schedule[day].push({
          period: p,
          time: timeSlots[p - 1],
          subject: existingPeriod?.subject || '',
          teacher: existingPeriod?.teacher || null
        });
      }
    });

    res.json({
      _id: `${className}-${section}`,
      class: className,
      section,
      schedule
    });
  } catch (error) {
    console.error('Get timetable error:', error);
    res.status(500).json({ message: error.message });
  }
};

// Get all timetables
exports.getAllTimetables = async (req, res) => {
  try {
    const distinctClasses = await TimetablePeriod.distinct('className');
    const distinctSections = await TimetablePeriod.distinct('section');
    
    const timetables = [];
    
    for (const className of distinctClasses) {
      for (const section of distinctSections) {
        const periods = await TimetablePeriod.find({ className, section });
        if (periods.length > 0) {
          const schedule = {
            Monday: [],
            Tuesday: [],
            Wednesday: [],
            Thursday: [],
            Friday: []
          };

          const timeSlots = [
            '9:00-9:45', '9:45-10:30', '10:45-11:30', '11:30-12:15',
            '1:00-1:45', '1:45-2:30', '2:30-3:15', '3:15-4:00'
          ];

          ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].forEach(day => {
            for (let p = 1; p <= 8; p++) {
              const existingPeriod = periods.find(period => period.day === day && period.period === p);
              schedule[day].push({
                period: p,
                time: timeSlots[p - 1],
                subject: existingPeriod?.subject || '',
                teacher: existingPeriod?.teacher || null
              });
            }
          });

          timetables.push({
            _id: `${className}-${section}`,
            class: className,
            section,
            schedule
          });
        }
      }
    }

    res.json(timetables);
  } catch (error) {
    console.error('Get all timetables error:', error);
    res.status(500).json({ message: error.message });
  }
};