const LeaveRequest = require('../models/LeaveRequest');
const User = require('../models/User');

// Get all leave requests (Admin view)
exports.getAllLeaveRequests = async (req, res) => {
  try {
    const leaves = await LeaveRequest.find()
      .populate('staff', 'name email')
      .populate('approvedBy', 'name')
      .sort({ createdAt: -1 });
    res.json(leaves);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get leave requests by staff (Staff view)
exports.getMyLeaveRequests = async (req, res) => {
  try {
    const leaves = await LeaveRequest.find({ staff: req.user.id })
      .populate('approvedBy', 'name')
      .sort({ createdAt: -1 });
    res.json(leaves);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create leave request
exports.createLeaveRequest = async (req, res) => {
  try {
    const { startDate, endDate, leaveType, reason } = req.body;
    
    const leaveRequest = new LeaveRequest({
      staff: req.user.id,
      startDate,
      endDate,
      leaveType,
      reason
    });

    await leaveRequest.save();
    await leaveRequest.populate('staff', 'name email');
    
    res.status(201).json(leaveRequest);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Update leave request status (Admin only)
exports.updateLeaveStatus = async (req, res) => {
  try {
    const { status, adminResponse } = req.body;
    
    const leaveRequest = await LeaveRequest.findByIdAndUpdate(
      req.params.id,
      { 
        status, 
        adminResponse,
        approvedBy: req.user.id,
        isRead: false
      },
      { new: true }
    ).populate('staff', 'name email').populate('approvedBy', 'name');

    if (!leaveRequest) {
      return res.status(404).json({ message: 'Leave request not found' });
    }

    res.json(leaveRequest);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Mark as read
exports.markAsRead = async (req, res) => {
  try {
    await LeaveRequest.findByIdAndUpdate(req.params.id, { isRead: true });
    res.json({ message: 'Marked as read' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete leave request
exports.deleteLeaveRequest = async (req, res) => {
  try {
    const leaveRequest = await LeaveRequest.findById(req.params.id);
    
    if (!leaveRequest) {
      return res.status(404).json({ message: 'Leave request not found' });
    }

    // Only allow deletion if pending or by admin
    if (leaveRequest.status !== 'pending' && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Cannot delete processed leave request' });
    }

    await LeaveRequest.findByIdAndDelete(req.params.id);
    res.json({ message: 'Leave request deleted' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};