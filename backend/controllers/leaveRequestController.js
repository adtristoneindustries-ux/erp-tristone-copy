const LeaveRequest = require('../models/LeaveRequest');
const User = require('../models/User');

// Create leave request (Student and Staff)
const createLeaveRequest = async (req, res) => {
  try {
    const { leaveType, startDate, endDate, reason } = req.body;
    
    const leaveRequest = new LeaveRequest({
      user: req.user.id,
      student: req.user.role === 'student' ? req.user.id : undefined,
      leaveType,
      startDate,
      endDate,
      reason
    });

    await leaveRequest.save();
    await leaveRequest.populate('user', 'name class section role');
    if (leaveRequest.student) {
      await leaveRequest.populate('student', 'name class section');
    }
    
    res.status(201).json(leaveRequest);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Get leave requests
const getLeaveRequests = async (req, res) => {
  try {
    console.log('Getting leave requests for user:', req.user.id, 'role:', req.user.role);
    let query = {};
    
    if (req.user.role === 'student') {
      // Students can only see their own requests
      query.user = req.user.id;
    } else if (req.user.role === 'staff') {
      // Staff can see:
      // 1. Their own leave requests
      // 2. Student leave requests (for approval)
      if (req.query.type === 'my-requests') {
        query.user = req.user.id;
      } else {
        // Show student leave requests for staff to manage
        const students = await User.find({ role: 'student' }).select('_id');
        const studentIds = students.map(user => user._id);
        query.user = { $in: studentIds };
      }
    } else if (req.user.role === 'admin') {
      // Admin can only see staff leave requests
      if (req.query.userRole) {
        const users = await User.find({ role: req.query.userRole }).select('_id');
        const userIds = users.map(user => user._id);
        query.user = { $in: userIds };
      } else {
        // Default: show only staff leave requests
        const staff = await User.find({ role: 'staff' }).select('_id');
        const staffIds = staff.map(user => user._id);
        query.user = { $in: staffIds };
      }
    }
    
    console.log('Query:', query);
    const leaveRequests = await LeaveRequest.find(query)
      .populate('user', 'name class section role email')
      .populate('student', 'name class section')
      .populate('reviewedBy', 'name')
      .sort({ createdAt: -1 });
    
    console.log('Found leave requests:', leaveRequests.length);
    res.json(leaveRequests);
  } catch (error) {
    console.error('Error in getLeaveRequests:', error);
    res.status(500).json({ message: error.message });
  }
};

// Get my leave requests
const getMyLeaveRequests = async (req, res) => {
  try {
    const leaveRequests = await LeaveRequest.find({ user: req.user.id })
      .populate('user', 'name class section role email')
      .populate('reviewedBy', 'name')
      .sort({ createdAt: -1 });
    
    res.json(leaveRequests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get unread count
const getUnreadCount = async (req, res) => {
  try {
    let query = {};
    
    if (req.user.role === 'admin') {
      // Count pending staff leave requests
      const staff = await User.find({ role: 'staff' }).select('_id');
      const staffIds = staff.map(user => user._id);
      query = { user: { $in: staffIds }, status: 'pending' };
    } else if (req.user.role === 'staff') {
      // Count pending student leave requests + own status updates
      const students = await User.find({ role: 'student' }).select('_id');
      const studentIds = students.map(user => user._id);
      query = {
        $or: [
          { user: { $in: studentIds }, status: 'pending' },
          { user: req.user.id, status: { $in: ['approved', 'rejected'] }, isRead: { $ne: true } }
        ]
      };
    } else {
      // Students - count their own status updates
      query = { user: req.user.id, status: { $in: ['approved', 'rejected'] }, isRead: { $ne: true } };
    }
    
    const count = await LeaveRequest.countDocuments(query);
    res.json({ count });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Mark as read
const markAsRead = async (req, res) => {
  try {
    let query = {};
    
    if (req.user.role === 'admin') {
      const staff = await User.find({ role: 'staff' }).select('_id');
      const staffIds = staff.map(user => user._id);
      query = { user: { $in: staffIds }, status: 'pending' };
    } else if (req.user.role === 'staff') {
      query = { user: req.user.id, status: { $in: ['approved', 'rejected'] } };
    } else {
      query = { user: req.user.id, status: { $in: ['approved', 'rejected'] } };
    }
    
    await LeaveRequest.updateMany(query, { isRead: true });
    res.json({ message: 'Marked as read' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update leave request status (Staff/Admin only)
const updateLeaveRequestStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, adminResponse } = req.body;
    
    // Get the leave request to check user role
    const leaveRequest = await LeaveRequest.findById(id).populate('user', 'role');
    if (!leaveRequest) {
      return res.status(404).json({ message: 'Leave request not found' });
    }
    
    // Authorization check
    if (req.user.role === 'staff' && leaveRequest.user.role !== 'student') {
      return res.status(403).json({ message: 'Staff can only approve student leave requests' });
    }
    
    if (req.user.role === 'admin' && leaveRequest.user.role !== 'staff') {
      return res.status(403).json({ message: 'Admin can only approve staff leave requests' });
    }
    
    const updateData = {
      status,
      reviewedBy: req.user.id,
      reviewedAt: new Date(),
      isRead: false // Mark as unread for the user
    };
    
    if (adminResponse) updateData.adminResponse = adminResponse;
    
    const updatedLeaveRequest = await LeaveRequest.findByIdAndUpdate(id, updateData, { new: true })
      .populate('user', 'name class section role email')
      .populate('student', 'name class section')
      .populate('reviewedBy', 'name');
    
    res.json(updatedLeaveRequest);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

module.exports = {
  createLeaveRequest,
  getLeaveRequests,
  getMyLeaveRequests,
  getUnreadCount,
  markAsRead,
  updateLeaveRequestStatus
};