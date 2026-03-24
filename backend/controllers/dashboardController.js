const User = require('../models/User');
const Attendance = require('../models/Attendance');
const Mark = require('../models/Mark');
const StaffAttendance = require('../models/StaffAttendance');
const LeaveRequest = require('../models/LeaveRequest');
const Timetable = require('../models/Timetable');
const Fee = require('../models/Fee');
const os = require('os');

exports.getAdminStats = async (req, res) => {
  try {
    const totalStudents = await User.countDocuments({ role: 'student' });
    const totalStaff = await User.countDocuments({ role: 'staff' });
    const totalClasses = await User.distinct('class', { role: 'student' });
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const presentToday = await Attendance.countDocuments({ 
      date: today, 
      status: 'present' 
    });

    // Fee stats
    let feeCollected = 0, feePending = 0, feeOverdue = 0;
    try {
      const feeAgg = await Fee.aggregate([
        { $group: { _id: '$status', total: { $sum: '$paidAmount' }, due: { $sum: '$dueAmount' } } }
      ]);
      feeAgg.forEach(f => {
        if (f._id === 'Paid') feeCollected = f.total;
        if (f._id === 'Pending') feePending = f.due;
        if (f._id === 'Overdue') feeOverdue = f.due;
      });
    } catch(e) {}

    // Top 5 students by average marks
    let topStudents = [];
    try {
      const markAgg = await Mark.aggregate([
        { $group: { _id: '$student', avgPct: { $avg: { $multiply: [{ $divide: ['$marks', '$totalMarks'] }, 100] } } } },
        { $sort: { avgPct: -1 } },
        { $limit: 5 }
      ]);
      const ids = markAgg.map(m => m._id);
      const users = await User.find({ _id: { $in: ids } }, 'name class');
      topStudents = markAgg.map(m => {
        const u = users.find(u => u._id.toString() === m._id?.toString());
        return { name: u?.name || 'Unknown', class: u?.class || '-', avg: Math.round(m.avgPct) };
      });
    } catch(e) {}

    // Pending leave count
    let pendingLeaves = 0;
    try { pendingLeaves = await LeaveRequest.countDocuments({ status: 'pending' }); } catch(e) {}

    res.json({
      totalStudents,
      totalStaff,
      totalClasses: totalClasses.length,
      presentToday,
      feeCollected,
      feePending,
      feeOverdue,
      topStudents,
      pendingLeaves
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getSystemHealth = async (req, res) => {
  try {
    const totalMem = os.totalmem();
    const freeMem = os.freemem();
    const usedMem = totalMem - freeMem;
    const cpuLoad = os.loadavg()[0];
    const uptimeSeconds = os.uptime();
    const uptimeHours = Math.floor(uptimeSeconds / 3600);
    const uptimeMins = Math.floor((uptimeSeconds % 3600) / 60);

    const onlineUsers = await User.countDocuments({ isOnline: true });
    const totalUsers = await User.countDocuments();

    res.json({
      memory: {
        total: Math.round(totalMem / 1024 / 1024),
        used: Math.round(usedMem / 1024 / 1024),
        free: Math.round(freeMem / 1024 / 1024),
        usedPct: Math.round((usedMem / totalMem) * 100)
      },
      cpu: { load: cpuLoad.toFixed(2), cores: os.cpus().length },
      uptime: { hours: uptimeHours, minutes: uptimeMins, raw: uptimeSeconds },
      db: { status: 'connected' },
      users: { online: onlineUsers, total: totalUsers },
      platform: os.platform(),
      nodeVersion: process.version
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getAdminReports = async (req, res) => {
  try {
    const { type, startDate, endDate, classFilter } = req.query;
    const start = startDate ? new Date(startDate) : new Date(new Date().setDate(1));
    const end = endDate ? new Date(endDate) : new Date();
    end.setHours(23, 59, 59, 999);

    if (type === 'attendance') {
      const query = { date: { $gte: start, $lte: end } };
      const records = await Attendance.find(query)
        .populate('user', 'name class section rollNumber')
        .sort({ date: -1 })
        .limit(500);
      return res.json({ records: records.map(r => ({
        name: r.user?.name, class: r.user?.class, section: r.user?.section,
        roll: r.user?.rollNumber, date: r.date, status: r.status
      })) });
    }

    if (type === 'marks') {
      const records = await Mark.find()
        .populate('student', 'name class section rollNumber')
        .populate('subject', 'name')
        .sort({ createdAt: -1 })
        .limit(500);
      return res.json({ records: records.map(r => ({
        name: r.student?.name, class: r.student?.class, section: r.student?.section,
        roll: r.student?.rollNumber, subject: r.subject?.name,
        marks: r.marks, total: r.totalMarks, pct: r.totalMarks > 0 ? Math.round((r.marks/r.totalMarks)*100) : 0
      })) });
    }

    if (type === 'fees') {
      const records = await Fee.find({ createdAt: { $gte: start, $lte: end } })
        .populate('student', 'name class section rollNumber')
        .sort({ createdAt: -1 })
        .limit(500);
      return res.json({ records: records.map(r => ({
        name: r.student?.name, class: r.student?.class, section: r.student?.section,
        roll: r.student?.rollNumber, total: r.totalAmount, paid: r.paidAmount,
        due: r.dueAmount, status: r.status, dueDate: r.dueDate
      })) });
    }

    if (type === 'students') {
      const query = { role: 'student' };
      if (classFilter) query.class = classFilter;
      const students = await User.find(query, 'name email class section rollNumber phone status joiningDate').sort({ class: 1, name: 1 });
      return res.json({ records: students });
    }

    if (type === 'staff') {
      const staff = await User.find({ role: 'staff' }, 'name email department designation phone status joiningDate').sort({ name: 1 });
      return res.json({ records: staff });
    }

    res.status(400).json({ message: 'Invalid report type' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.bulkImportUsers = async (req, res) => {
  try {
    const { users, role } = req.body;
    if (!users || !Array.isArray(users)) return res.status(400).json({ message: 'Invalid data' });

    const results = { created: 0, failed: 0, errors: [] };
    for (const u of users) {
      try {
        const exists = await User.findOne({ email: u.email });
        if (exists) { results.failed++; results.errors.push(`${u.email} already exists`); continue; }
        await User.create({ ...u, role: role || u.role || 'student', password: u.password || 'Welcome@123' });
        results.created++;
      } catch(e) {
        results.failed++;
        results.errors.push(`${u.email}: ${e.message}`);
      }
    }
    res.json(results);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getStudentStats = async (req, res) => {
  try {
    const studentId = req.user._id;
    
    const totalAttendance = await Attendance.countDocuments({ user: studentId });
    const presentCount = await Attendance.countDocuments({ 
      user: studentId, 
      status: 'present' 
    });
    const attendancePercentage = totalAttendance > 0 
      ? ((presentCount / totalAttendance) * 100).toFixed(2) 
      : 0;

    const marks = await Mark.find({ student: studentId }).populate('subject');
    const averageMarks = marks.length > 0
      ? (marks.reduce((sum, m) => sum + (m.marks / m.totalMarks) * 100, 0) / marks.length).toFixed(2)
      : 0;

    res.json({
      attendancePercentage,
      averageMarks,
      totalSubjects: marks.length
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getStaffStats = async (req, res) => {
  try {
    const staffId = req.user._id;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Get today's classes count from timetable
    const currentDay = new Date().toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
    const todayClasses = await Timetable.countDocuments({ 
      teacher: staffId,
      day: currentDay 
    });
    
    // Get today's attendance status
    const todayAttendance = await StaffAttendance.findOne({ 
      staff: staffId,
      date: today 
    });
    
    // Get pending leave requests to approve
    const pendingLeaves = await LeaveRequest.countDocuments({ 
      approver: staffId,
      status: 'pending' 
    });
    
    // Materials feature removed
    const materialsUploaded = 0;
    
    // Calculate monthly attendance percentage
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
    const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0);
    
    const monthlyAttendance = await StaffAttendance.find({
      staff: staffId,
      date: { $gte: firstDayOfMonth, $lte: lastDayOfMonth }
    });
    
    const presentDays = monthlyAttendance.filter(att => att.status === 'present').length;
    const totalWorkingDays = monthlyAttendance.length;
    const monthlyAttendancePercentage = totalWorkingDays > 0 
      ? Math.round((presentDays / totalWorkingDays) * 100) 
      : 0;
    
    // Get recent mark updates by this staff
    const recentMarkUpdates = await Mark.find({ 
      updatedBy: staffId 
    })
    .populate('student', 'name')
    .populate('subject', 'name')
    .sort({ updatedAt: -1 })
    .limit(5);
    
    res.json({
      todayClasses,
      attendanceStatus: todayAttendance ? {
        status: todayAttendance.status,
        checkInTime: todayAttendance.checkInTime
      } : { status: 'Not Marked', checkInTime: null },
      pendingLeaves,
      materialsUploaded,
      monthlyAttendancePercentage,
      recentMarkUpdates: recentMarkUpdates.map(mark => ({
        subject: mark.subject?.name || 'Unknown',
        studentName: mark.student?.name || 'Unknown',
        updatedAt: mark.updatedAt
      }))
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
