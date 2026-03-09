const { createNotification } = require('../controllers/notificationController');

// Library notifications
exports.notifyLibraryDue = async (userId, bookTitle, dueDate, fine, io) => {
  const notification = await createNotification(
    userId,
    'library',
    'Library Book Overdue',
    `"${bookTitle}" is overdue. Due date: ${new Date(dueDate).toLocaleDateString()}. Fine: ₹${fine}`,
    '/student/library'
  );
  if (io && notification) io.emit('newNotification', notification);
};

exports.notifyLibraryIssue = async (userId, bookTitle, dueDate, io) => {
  const notification = await createNotification(
    userId,
    'library',
    'Book Issued Successfully',
    `"${bookTitle}" has been issued. Please return by ${new Date(dueDate).toLocaleDateString()}`,
    '/student/library'
  );
  if (io && notification) io.emit('newNotification', notification);
};

// Cafeteria notifications
exports.notifyCafeteriaPurchase = async (userId, amount, items, io) => {
  const notification = await createNotification(
    userId,
    'cafeteria',
    'Cafeteria Purchase',
    `Purchase of ₹${amount} completed. Items: ${items}`,
    '/cafeteria'
  );
  if (io && notification) io.emit('newNotification', notification);
};

exports.notifyCafeteriaBalance = async (userId, balance, io) => {
  const notification = await createNotification(
    userId,
    'cafeteria',
    'Low Cafeteria Balance',
    `Your cafeteria balance is low: ₹${balance}. Please recharge.`,
    '/cafeteria'
  );
  if (io && notification) io.emit('newNotification', notification);
};

// Fee notifications
exports.notifyFeeDue = async (userId, amount, dueDate, io) => {
  const notification = await createNotification(
    userId,
    'fee',
    'Fee Payment Due',
    `Fee payment of ₹${amount} is due by ${new Date(dueDate).toLocaleDateString()}`,
    '/student/finance'
  );
  if (io && notification) io.emit('newNotification', notification);
};

exports.notifyFeePayment = async (userId, amount, io) => {
  const notification = await createNotification(
    userId,
    'fee',
    'Fee Payment Received',
    `Payment of ₹${amount} has been received successfully`,
    '/student/finance'
  );
  if (io && notification) io.emit('newNotification', notification);
};

// Scholarship notifications
exports.notifyScholarshipApproved = async (userId, scholarshipName, amount, io) => {
  const notification = await createNotification(
    userId,
    'scholarship',
    'Scholarship Approved',
    `Congratulations! Your application for "${scholarshipName}" (₹${amount}) has been approved`,
    '/student/scholarships'
  );
  if (io && notification) io.emit('newNotification', notification);
};

exports.notifyScholarshipRejected = async (userId, scholarshipName, io) => {
  const notification = await createNotification(
    userId,
    'scholarship',
    'Scholarship Application Update',
    `Your application for "${scholarshipName}" has been reviewed`,
    '/student/scholarships'
  );
  if (io && notification) io.emit('newNotification', notification);
};

// Marks notifications
exports.notifyMarksUpdated = async (userId, subject, marks, examType, io) => {
  const notification = await createNotification(
    userId,
    'marks',
    'Marks Updated',
    `${subject} - ${examType}: ${marks} marks`,
    '/student/marks'
  );
  if (io && notification) io.emit('newNotification', notification);
};

// Attendance notifications
exports.notifyLowAttendance = async (userId, subject, percentage, io) => {
  const notification = await createNotification(
    userId,
    'attendance',
    'Low Attendance Alert',
    `Your attendance in ${subject} is ${percentage}%. Minimum required: 75%`,
    '/student/attendance'
  );
  if (io && notification) io.emit('newNotification', notification);
};

// Exam notifications
exports.notifyExamSchedule = async (userId, examName, date, io) => {
  const notification = await createNotification(
    userId,
    'exam',
    'Exam Scheduled',
    `${examName} scheduled on ${new Date(date).toLocaleDateString()}`,
    '/student/exam-schedule'
  );
  if (io && notification) io.emit('newNotification', notification);
};

// Leave notifications
exports.notifyLeaveApproved = async (userId, leaveType, startDate, endDate, io) => {
  const notification = await createNotification(
    userId,
    'leave',
    'Leave Request Approved',
    `Your ${leaveType} leave from ${new Date(startDate).toLocaleDateString()} to ${new Date(endDate).toLocaleDateString()} has been approved`,
    '/staff/leaves'
  );
  if (io && notification) io.emit('newNotification', notification);
};

exports.notifyLeaveRejected = async (userId, leaveType, reason, io) => {
  const notification = await createNotification(
    userId,
    'leave',
    'Leave Request Rejected',
    `Your ${leaveType} leave request has been rejected. Reason: ${reason}`,
    '/staff/leaves'
  );
  if (io && notification) io.emit('newNotification', notification);
};

// Announcement notifications
exports.notifyAnnouncement = async (userId, title, content, io) => {
  const notification = await createNotification(
    userId,
    'announcement',
    title,
    content,
    '/student/announcements'
  );
  if (io && notification) io.emit('newNotification', notification);
};

// Placement notifications
exports.notifyPlacementDrive = async (userId, company, date, io) => {
  const notification = await createNotification(
    userId,
    'placement',
    'New Placement Drive',
    `${company} placement drive scheduled on ${new Date(date).toLocaleDateString()}`,
    '/student/placement'
  );
  if (io && notification) io.emit('newNotification', notification);
};

// Transport notifications
exports.notifyTransportUpdate = async (userId, message, io) => {
  const notification = await createNotification(
    userId,
    'transport',
    'Transport Update',
    message,
    '/student/transport'
  );
  if (io && notification) io.emit('newNotification', notification);
};

// Hostel notifications
exports.notifyHostelUpdate = async (userId, message, io) => {
  const notification = await createNotification(
    userId,
    'hostel',
    'Hostel Update',
    message,
    '/student/hostel'
  );
  if (io && notification) io.emit('newNotification', notification);
};
