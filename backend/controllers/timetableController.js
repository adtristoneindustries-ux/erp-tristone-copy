const Timetable = require('../models/Timetable');
const Period = require('../models/Period');
const User = require('../models/User');

exports.savePeriod = async (req, res) => {
  try {
    const { className, section, day, periodNumber, time, subject, teacher } = req.body;
    
    if (!teacher || teacher === '') {
      return res.status(400).json({ message: 'Teacher is required' });
    }
    
    await Period.findOneAndUpdate(
      { className, section, day, periodNumber },
      { className, section, day, periodNumber, time, subject, teacher },
      { upsert: true, new: true }
    );
    
    req.io.emit('timetableUpdate', { type: 'periodUpdate', className, section });
    
    res.json({ message: 'Period saved successfully' });
  } catch (error) {
    console.error('Save period error:', error);
    res.status(400).json({ message: error.message });
  }
};

exports.getTimetableByClass = async (req, res) => {
  try {
    const { className, section } = req.query;
    
    const periods = await Period.find({ className, section }).populate('teacher').sort({ day: 1, periodNumber: 1 });
    
    const schedule = {
      Monday: [],
      Tuesday: [],
      Wednesday: [],
      Thursday: [],
      Friday: []
    };
    
    const timeSlots = ['9:00-9:45', '9:45-10:30', '10:45-11:30', '11:30-12:15', '1:00-1:45', '1:45-2:30', '2:30-3:15', '3:15-4:00'];
    
    ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].forEach(day => {
      for (let i = 1; i <= 8; i++) {
        const period = periods.find(p => p.day === day && p.periodNumber === i);
        schedule[day].push({
          period: i,
          time: timeSlots[i - 1],
          subject: period?.subject || '',
          teacher: period?.teacher?._id || ''
        });
      }
    });
    
    res.json({ className, section, schedule });
  } catch (error) {
    console.error('Get timetable error:', error);
    res.status(500).json({ message: error.message });
  }
};

exports.createTimetable = async (req, res) => {
  try {
    console.log('Creating timetable with data:', JSON.stringify(req.body, null, 2));
    
    const existing = await Timetable.findOne({ class: req.body.class, section: req.body.section });
    if (existing) {
      return res.status(400).json({ message: 'Timetable already exists for this class' });
    }
    
    // Process schedule to ensure teacher field is properly set
    const processedSchedule = {};
    Object.keys(req.body.schedule).forEach(day => {
      processedSchedule[day] = req.body.schedule[day].map(period => {
        const processedPeriod = {
          period: period.period,
          time: period.time,
          subject: period.subject || '',
          teacher: null
        };
        
        // Handle teacher field - accept any valid ObjectId format
        if (period.teacher && period.teacher !== '') {
          processedPeriod.teacher = period.teacher;
        }
        
        return processedPeriod;
      });
    });
    
    const timetableData = {
      class: req.body.class,
      section: req.body.section,
      schedule: processedSchedule
    };
    
    console.log('Processed timetable data:', JSON.stringify(timetableData, null, 2));
    
    const timetable = await Timetable.create(timetableData);
    const populated = await Timetable.findById(timetable._id).populate({
      path: 'schedule.Monday.teacher schedule.Tuesday.teacher schedule.Wednesday.teacher schedule.Thursday.teacher schedule.Friday.teacher',
      select: 'name subject'
    });
    
    console.log('Created and populated timetable:', JSON.stringify(populated, null, 2));
    
    req.io.emit('timetableUpdate', { type: 'create', timetable: populated });
    
    res.status(201).json(populated);
  } catch (error) {
    console.error('Create timetable error:', error);
    res.status(400).json({ message: error.message });
  }
};

exports.getTimetable = async (req, res) => {
  try {
    const { class: className, section } = req.query;
    let query = {};
    
    if (className) query.class = className;
    if (section) query.section = section;

    const timetable = await Timetable.find(query).populate({
      path: 'schedule.Monday.teacher schedule.Tuesday.teacher schedule.Wednesday.teacher schedule.Thursday.teacher schedule.Friday.teacher',
      select: 'name subject'
    });
    res.json(timetable);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getStaffTimetable = async (req, res) => {
  try {
    const staffId = req.params.staffId;
    const periods = await Period.find({ teacher: staffId }).populate('teacher');
    
    const timeSlots = ['9:00-9:45', '9:45-10:30', '10:45-11:30', '11:30-12:15', '1:00-1:45', '1:45-2:30', '2:30-3:15', '3:15-4:00'];
    
    const staffSchedule = {
      Monday: [],
      Tuesday: [],
      Wednesday: [],
      Thursday: [],
      Friday: []
    };
    
    ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].forEach(day => {
      for (let i = 1; i <= 8; i++) {
        const period = periods.find(p => p.day === day && p.periodNumber === i);
        staffSchedule[day].push({
          period: i,
          time: timeSlots[i - 1],
          subject: period ? period.subject : 'Free Hour',
          class: period ? period.className : '',
          section: period ? period.section : '',
          type: period ? 'assigned' : 'free'
        });
      }
    });
    
    res.json(staffSchedule);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateTimetable = async (req, res) => {
  try {
    console.log('Updating timetable with data:', JSON.stringify(req.body, null, 2));
    
    // Process schedule to ensure teacher field is properly set and validate ObjectIds
    const processedSchedule = {};
    Object.keys(req.body.schedule).forEach(day => {
      processedSchedule[day] = req.body.schedule[day].map(period => {
        const processedPeriod = {
          period: period.period,
          time: period.time,
          subject: period.subject || '',
          teacher: null
        };
        
        // Handle teacher field - accept any valid ObjectId format
        if (period.teacher && period.teacher !== '') {
          processedPeriod.teacher = period.teacher;
        }
        
        return processedPeriod;
      });
    });
    
    const timetableData = {
      class: req.body.class,
      section: req.body.section,
      schedule: processedSchedule
    };
    
    console.log('Processed update data:', JSON.stringify(timetableData, null, 2));
    
    const timetable = await Timetable.findByIdAndUpdate(
      req.params.id, 
      timetableData, 
      { new: true, runValidators: true }
    ).populate({
      path: 'schedule.Monday.teacher schedule.Tuesday.teacher schedule.Wednesday.teacher schedule.Thursday.teacher schedule.Friday.teacher',
      select: 'name subject'
    });
    
    if (!timetable) {
      return res.status(404).json({ message: 'Timetable not found' });
    }
    
    console.log('Updated timetable:', JSON.stringify(timetable, null, 2));
    
    req.io.emit('timetableUpdate', { type: 'update', timetable });
    
    res.json(timetable);
  } catch (error) {
    console.error('Update timetable error:', error);
    res.status(400).json({ message: error.message });
  }
};

exports.getClasses = async (req, res) => {
  try {
    const classes = await User.distinct('class', { role: 'student' });
    res.json(classes.filter(c => c).sort());
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getStaffList = async (req, res) => {
  try {
    const staff = await User.find({ role: 'staff' }).select('name subject');
    res.json(staff);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.assignStaffToPeriod = async (req, res) => {
  try {
    const { timetableId, day, period, staffId, subject } = req.body;
    
    // Validate required fields
    if (!timetableId || !day || !period || !staffId || !subject) {
      return res.status(400).json({ message: 'All fields are required' });
    }
    
    const timetable = await Timetable.findById(timetableId);
    if (!timetable) {
      return res.status(404).json({ message: 'Timetable not found' });
    }
    
    // Validate staff exists
    const staff = await User.findById(staffId);
    if (!staff || staff.role !== 'staff') {
      return res.status(400).json({ message: 'Invalid staff member' });
    }
    
    const periodIndex = timetable.schedule[day].findIndex(p => p.period === period);
    if (periodIndex !== -1) {
      timetable.schedule[day][periodIndex].teacher = staffId;
      timetable.schedule[day][periodIndex].subject = subject;
    } else {
      timetable.schedule[day].push({ 
        period, 
        time: getTimeSlot(period),
        teacher: staffId, 
        subject 
      });
    }
    
    await timetable.save();
    const populated = await Timetable.findById(timetableId).populate({
      path: 'schedule.Monday.teacher schedule.Tuesday.teacher schedule.Wednesday.teacher schedule.Thursday.teacher schedule.Friday.teacher',
      select: 'name subject'
    });
    
    req.io.emit('timetableUpdate', { type: 'assign', timetable: populated, staffId });
    
    res.json(populated);
  } catch (error) {
    console.error('Assign staff error:', error);
    res.status(400).json({ message: error.message });
  }
};

// Helper function to get time slot
function getTimeSlot(period) {
  const timeSlots = {
    1: '9:00-9:45',
    2: '9:45-10:30',
    3: '10:45-11:30',
    4: '11:30-12:15',
    5: '1:00-1:45',
    6: '1:45-2:30',
    7: '2:30-3:15',
    8: '3:15-4:00'
  };
  return timeSlots[period] || '';
}
