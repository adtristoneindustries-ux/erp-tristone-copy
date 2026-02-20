const Attendance = require('../models/Attendance');
const User = require('../models/User');

exports.getAttendance = async (req, res) => {
  try {
    const { student, user, date, class: className, section, startDate, endDate } = req.query;
    let query = {};

    // Handle both 'student' and 'user' query parameters for backward compatibility
    if (student || user) query.user = student || user;
    if (date) {
      const targetDate = new Date(date);
      query.date = {
        $gte: new Date(targetDate.setHours(0, 0, 0, 0)),
        $lt: new Date(targetDate.setHours(23, 59, 59, 999))
      };
    }
    if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    let students = [];
    // Filter by class and section if provided
    if (className || section) {
      const studentQuery = {};
      if (className) studentQuery.class = className;
      if (section) studentQuery.section = section;
      
      students = await User.find({ role: 'student', ...studentQuery });
      const studentIds = students.map(s => s._id);
      query.user = { $in: studentIds };
    }

    const attendance = await Attendance.find(query)
      .populate('user', 'name email class section rollNumber')
      .populate('subject', 'name code')
      .sort({ date: -1, 'user.name': 1 });

    // If specific class/section and date range, add missing students as absent
    if ((className || section) && (startDate && endDate)) {
      const attendanceMap = new Map();
      attendance.forEach(record => {
        const key = `${record.user._id}_${record.date.toISOString().split('T')[0]}`;
        attendanceMap.set(key, record);
      });

      const dateRange = [];
      const start = new Date(startDate);
      const end = new Date(endDate);
      for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        dateRange.push(new Date(d));
      }

      const completeAttendance = [];
      students.forEach(student => {
        dateRange.forEach(date => {
          const key = `${student._id}_${date.toISOString().split('T')[0]}`;
          if (attendanceMap.has(key)) {
            completeAttendance.push(attendanceMap.get(key));
          } else {
            // Create virtual absent record
            completeAttendance.push({
              _id: `virtual_${student._id}_${date.toISOString().split('T')[0]}`,
              user: student,
              date: date,
              status: 'absent',
              remarks: 'Not marked - Default absent',
              userType: 'student',
              isVirtual: true
            });
          }
        });
      });

      completeAttendance.sort((a, b) => {
        const dateCompare = new Date(b.date) - new Date(a.date);
        if (dateCompare !== 0) return dateCompare;
        return (a.user.name || '').localeCompare(b.user.name || '');
      });

      return res.json(completeAttendance);
    }

    res.json(attendance);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createAttendance = async (req, res) => {
  try {
    const { user, userType, student, date, status, subject, remarks } = req.body;
    
    // Use 'user' field if provided, otherwise fall back to 'student' for backward compatibility
    const userId = user || student;
    const attendanceUserType = userType || 'student';

    // Validate that userId is provided
    if (!userId) {
      return res.status(400).json({ message: 'Student/User ID is required' });
    }

    // Check if attendance already exists for this user and date
    const existingAttendance = await Attendance.findOne({
      user: userId,
      date: {
        $gte: new Date(new Date(date).setHours(0, 0, 0, 0)),
        $lt: new Date(new Date(date).setHours(23, 59, 59, 999))
      }
    });

    if (existingAttendance) {
      // Update existing attendance
      existingAttendance.status = status;
      if (remarks) existingAttendance.remarks = remarks;
      await existingAttendance.save();
      
      const updatedAttendance = await Attendance.findById(existingAttendance._id)
        .populate('user', 'name email class section rollNumber')
        .populate('subject', 'name code');
      
      return res.json(updatedAttendance);
    }

    // Create new attendance record
    const attendance = await Attendance.create({
      user: userId,
      userType: attendanceUserType,
      date,
      status,
      subject,
      remarks
    });

    const populatedAttendance = await Attendance.findById(attendance._id)
      .populate('user', 'name email class section rollNumber')
      .populate('subject', 'name code');

    // Emit real-time update
    if (req.io) {
      req.io.emit('attendanceUpdate', populatedAttendance);
    }

    res.status(201).json(populatedAttendance);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.markBulkAttendance = async (req, res) => {
  try {
    const attendanceData = req.body;
    const results = [];

    for (const record of attendanceData) {
      const { user, userType, student, date, status, subject, remarks } = record;
      const userId = user || student;
      const attendanceUserType = userType || 'student';

      // Validate that userId is provided
      if (!userId) {
        continue; // Skip invalid records
      }

      // Check if attendance already exists
      const existingAttendance = await Attendance.findOne({
        user: userId,
        date: {
          $gte: new Date(new Date(date).setHours(0, 0, 0, 0)),
          $lt: new Date(new Date(date).setHours(23, 59, 59, 999))
        }
      });

      if (existingAttendance) {
        existingAttendance.status = status;
        if (remarks) existingAttendance.remarks = remarks;
        await existingAttendance.save();
        results.push(existingAttendance);
      } else {
        const attendance = await Attendance.create({
          user: userId,
          userType: attendanceUserType,
          date,
          status,
          subject,
          remarks
        });
        results.push(attendance);
      }
    }

    // Emit real-time update
    if (req.io) {
      req.io.emit('bulkAttendanceUpdate', results);
    }

    res.status(201).json({ message: 'Bulk attendance marked successfully', count: results.length });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.updateAttendance = async (req, res) => {
  try {
    const attendance = await Attendance.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('user', 'name email class section rollNumber')
     .populate('subject', 'name code');

    if (!attendance) {
      return res.status(404).json({ message: 'Attendance record not found' });
    }

    // Emit real-time update
    if (req.io) {
      req.io.emit('attendanceUpdate', attendance);
    }

    res.json(attendance);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.deleteAttendance = async (req, res) => {
  try {
    const attendance = await Attendance.findByIdAndDelete(req.params.id);
    if (!attendance) {
      return res.status(404).json({ message: 'Attendance record not found' });
    }
    res.json({ message: 'Attendance record deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.downloadAttendance = async (req, res) => {
  try {
    const { class: className, section, startDate, endDate, format = 'csv' } = req.query;
    let query = {};

    let students = [];
    // Filter by class and section if provided
    if (className || section) {
      const studentQuery = {};
      if (className) studentQuery.class = className;
      if (section) studentQuery.section = section;
      
      students = await User.find({ role: 'student', ...studentQuery });
      const studentIds = students.map(s => s._id);
      query.user = { $in: studentIds };
    }

    // Filter by date range
    if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const attendance = await Attendance.find(query)
      .populate('user', 'name email class section rollNumber')
      .populate('subject', 'name code')
      .sort({ date: -1, 'user.name': 1 });

    // Add missing students as absent for download
    if ((className || section) && (startDate && endDate)) {
      const attendanceMap = new Map();
      attendance.forEach(record => {
        const key = `${record.user._id}_${record.date.toISOString().split('T')[0]}`;
        attendanceMap.set(key, record);
      });

      const dateRange = [];
      const start = new Date(startDate);
      const end = new Date(endDate);
      for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        dateRange.push(new Date(d));
      }

      const completeAttendance = [];
      students.forEach(student => {
        dateRange.forEach(date => {
          const key = `${student._id}_${date.toISOString().split('T')[0]}`;
          if (attendanceMap.has(key)) {
            completeAttendance.push(attendanceMap.get(key));
          } else {
            completeAttendance.push({
              user: student,
              date: date,
              status: 'absent',
              remarks: 'Not marked - Default absent',
              userType: 'student',
              createdAt: new Date()
            });
          }
        });
      });

      completeAttendance.sort((a, b) => {
        const dateCompare = new Date(b.date) - new Date(a.date);
        if (dateCompare !== 0) return dateCompare;
        return (a.user.name || '').localeCompare(b.user.name || '');
      });

      attendance.splice(0, attendance.length, ...completeAttendance);
    }

    if (format === 'csv') {
      // Generate CSV
      const csvHeader = 'Student Name,Email,Roll Number,Class,Section,Date,Status,Subject,Remarks,Created At\n';
      const csvData = attendance.map(record => {
        const user = record.user || {};
        const subject = record.subject || {};
        return [
          user.name || 'N/A',
          user.email || 'N/A',
          user.rollNumber || 'N/A',
          user.class || 'N/A',
          user.section || 'N/A',
          new Date(record.date).toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' }),
          record.status.charAt(0).toUpperCase() + record.status.slice(1),
          subject.name || 'N/A',
          record.remarks || '',
          new Date(record.createdAt).toLocaleString('en-US')
        ].map(field => `"${String(field).replace(/"/g, '""')}"`).join(',');
      }).join('\n');

      const dateStr = new Date().toISOString().split('T')[0];
      const filename = `attendance_${className || 'all'}_${section || 'all'}_${dateStr}.csv`;
      
      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.send('\uFEFF' + csvHeader + csvData); // Add BOM for proper Excel encoding
    } else {
      res.json(attendance);
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};