const User = require('../models/User');
const Attendance = require('../models/Attendance');
const Mark = require('../models/Mark');
const StaffAttendance = require('../models/StaffAttendance');
const Material = require('../models/Material');
const LeaveRequest = require('../models/LeaveRequest');
const Timetable = require('../models/Timetable');

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

    res.json({
      totalStudents,
      totalStaff,
      totalClasses: totalClasses.length,
      presentToday
    });
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
    
    // Get materials uploaded by this staff
    const materialsUploaded = await Material.countDocuments({ 
      uploadedBy: staffId 
    });
    
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
