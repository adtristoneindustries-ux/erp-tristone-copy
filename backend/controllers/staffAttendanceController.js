const StaffAttendance = require('../models/StaffAttendance');
const LeaveRequest = require('../models/LeaveRequest');

exports.createStaffAttendance = async (req, res) => {
  try {
    // If user details not provided, fetch from User collection
    if (!req.body.staffName && req.body.staff) {
      const User = require('../models/User');
      const user = await User.findById(req.body.staff);
      if (user) {
        req.body.staffName = user.name;
        req.body.staffEmail = user.email;
        req.body.staffSubject = user.subject;
      }
    }
    
    const attendance = await StaffAttendance.create(req.body);
    const populated = await attendance.populate('staff');
    
    req.io.emit('staffAttendanceUpdate', populated);
    res.status(201).json(populated);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.checkIn = async (req, res) => {
  try {
    const staffId = req.user.id;
    const today = new Date().toISOString().split('T')[0];
    const now = new Date();
    const inTime = now.toLocaleTimeString('en-US', { hour12: true });
    
    // Check if already checked in today
    const existing = await StaffAttendance.findOne({
      staff: staffId,
      date: {
        $gte: new Date(today),
        $lt: new Date(new Date(today).getTime() + 24 * 60 * 60 * 1000)
      }
    });
    
    if (existing) {
      return res.status(400).json({ message: 'Already checked in today' });
    }
    
    const User = require('../models/User');
    const user = await User.findById(staffId);
    
    const attendance = await StaffAttendance.create({
      staff: staffId,
      staffName: user.name,
      staffEmail: user.email,
      staffSubject: user.subject,
      date: new Date(),
      inTime,
      status: 'present'
    });
    
    const populated = await attendance.populate('staff');
    req.io.emit('staffAttendanceUpdate', populated);
    res.status(201).json(populated);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.checkOut = async (req, res) => {
  try {
    const staffId = req.user.id;
    const today = new Date().toISOString().split('T')[0];
    const now = new Date();
    const outTime = now.toLocaleTimeString('en-US', { hour12: true });
    
    const attendance = await StaffAttendance.findOne({
      staff: staffId,
      date: {
        $gte: new Date(today),
        $lt: new Date(new Date(today).getTime() + 24 * 60 * 60 * 1000)
      }
    });
    
    if (!attendance) {
      return res.status(400).json({ message: 'No check-in record found for today' });
    }
    
    if (attendance.outTime) {
      return res.status(400).json({ message: 'Already checked out today' });
    }
    
    // Calculate total hours
    const inTimeDate = new Date(`${today} ${attendance.inTime}`);
    const outTimeDate = new Date(`${today} ${outTime}`);
    const diffMs = outTimeDate - inTimeDate;
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    const totalHours = `${hours}h ${minutes}m`;
    
    attendance.outTime = outTime;
    attendance.totalHours = totalHours;
    await attendance.save();
    
    const populated = await attendance.populate('staff');
    req.io.emit('staffAttendanceUpdate', populated);
    res.json(populated);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.getTodayAttendance = async (req, res) => {
  try {
    const staffId = req.user.id;
    const today = new Date().toISOString().split('T')[0];
    
    const attendance = await StaffAttendance.findOne({
      staff: staffId,
      date: {
        $gte: new Date(today),
        $lt: new Date(new Date(today).getTime() + 24 * 60 * 60 * 1000)
      }
    }).populate('staff');
    
    // Check if on leave today
    const leaveToday = await LeaveRequest.findOne({
      staff: staffId,
      status: 'Approved',
      fromDate: { $lte: new Date() },
      toDate: { $gte: new Date() }
    });
    
    res.json({ attendance, onLeave: !!leaveToday, leaveDetails: leaveToday });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getStaffAttendance = async (req, res) => {
  try {
    const { staff, date, startDate, endDate } = req.query;
    let query = {};
    
    if (staff) query.staff = staff;
    if (date) {
      const queryDate = new Date(date);
      const startOfDay = new Date(queryDate.setHours(0, 0, 0, 0));
      const endOfDay = new Date(queryDate.setHours(23, 59, 59, 999));
      query.date = { $gte: startOfDay, $lte: endOfDay };
    }
    if (startDate && endDate && !date) {
      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0);
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      query.date = { $gte: start, $lte: end };
    }

    const attendance = await StaffAttendance.find(query).populate('staff').sort('-date');
    
    // Get leave requests for the date range
    const leaveQuery = { status: 'Approved' };
    if (date) {
      const queryDate = new Date(date);
      leaveQuery.fromDate = { $lte: queryDate };
      leaveQuery.toDate = { $gte: queryDate };
    }
    
    const leaveRequests = await LeaveRequest.find(leaveQuery).populate('staff');
    
    res.json({ attendance, leaveRequests });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateStaffAttendance = async (req, res) => {
  try {
    // If user details not provided, fetch from User collection
    if (!req.body.staffName && req.body.staff) {
      const User = require('../models/User');
      const user = await User.findById(req.body.staff);
      if (user) {
        req.body.staffName = user.name;
        req.body.staffEmail = user.email;
        req.body.staffSubject = user.subject;
      }
    }
    
    const attendance = await StaffAttendance.findByIdAndUpdate(req.params.id, req.body, { new: true })
      .populate('staff');
    
    req.io.emit('staffAttendanceUpdate', attendance);
    res.json(attendance);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.deleteStaffAttendance = async (req, res) => {
  try {
    await StaffAttendance.findByIdAndDelete(req.params.id);
    res.json({ message: 'Staff attendance deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};