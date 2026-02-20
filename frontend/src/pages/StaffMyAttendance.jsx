import { useState, useEffect, useContext } from 'react';
import { Clock, Calendar, Send, CheckCircle, XCircle } from 'lucide-react';
import Layout from '../components/Layout';
import Modal from '../components/Modal';
import { staffAttendanceAPI, leaveRequestAPI } from '../services/api';
import { SocketContext } from '../context/SocketContext';
import { AuthContext } from '../context/AuthContext';
import { useAlert } from '../hooks/useAlert';

const StaffMyAttendance = () => {
  const { showSuccess, showError } = useAlert();
  const { user } = useContext(AuthContext);
  const socket = useContext(SocketContext);
  const [activeTab, setActiveTab] = useState('attendance');
  const [todayAttendance, setTodayAttendance] = useState(null);
  const [onLeave, setOnLeave] = useState(false);
  const [loading, setLoading] = useState(false);
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [leaveForm, setLeaveForm] = useState({
    leaveType: 'casual',
    fromDate: '',
    toDate: '',
    reason: ''
  });

  useEffect(() => {
    fetchTodayAttendance();
    fetchLeaveRequests();
  }, []);

  // Listen for leave status updates
  useEffect(() => {
    if (socket && user) {
      socket.on('leaveStatusUpdate', (data) => {
        if (data.staff === user._id) {
          fetchLeaveRequests(); // Refresh leave requests
        }
      });

      return () => {
        socket.off('leaveStatusUpdate');
      };
    }
  }, [socket, user]);

  const fetchTodayAttendance = async () => {
    try {
      const response = await staffAttendanceAPI.getTodayAttendance();
      setTodayAttendance(response.data.attendance);
      setOnLeave(response.data.onLeave);
    } catch (error) {
      console.error('Failed to fetch today attendance:', error);
    }
  };

  const fetchLeaveRequests = async () => {
    try {
      const response = await leaveRequestAPI.getMyLeaveRequests();
      setLeaveRequests(response.data);
    } catch (error) {
      console.error('Failed to fetch leave requests:', error);
    }
  };

  const handleCheckIn = async () => {
    setLoading(true);
    try {
      const response = await staffAttendanceAPI.checkIn();
      setTodayAttendance(response.data);
      showSuccess('Checked in successfully!');
    } catch (error) {
      showError(error.response?.data?.message || 'Failed to check in');
    } finally {
      setLoading(false);
    }
  };

  const handleCheckOut = async () => {
    setLoading(true);
    try {
      const response = await staffAttendanceAPI.checkOut();
      setTodayAttendance(response.data);
      showSuccess('Checked out successfully!');
    } catch (error) {
      showError(error.response?.data?.message || 'Failed to check out');
    } finally {
      setLoading(false);
    }
  };

  const handleLeaveSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const requestData = {
        leaveType: leaveForm.leaveType,
        startDate: leaveForm.fromDate,
        endDate: leaveForm.toDate,
        reason: leaveForm.reason
      };
      await leaveRequestAPI.createLeaveRequest(requestData);
      setShowLeaveModal(false);
      setLeaveForm({ leaveType: 'casual', fromDate: '', toDate: '', reason: '' });
      fetchLeaveRequests();
      showSuccess('Leave request submitted successfully!');
    } catch (error) {
      showError(error.response?.data?.message || 'Failed to submit leave request');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Layout>
      <div className="p-4 lg:p-6">
        <div className="mb-6">
          <h1 className="text-xl lg:text-2xl font-bold flex items-center gap-2">
            <Clock className="text-blue-600" />
            My Attendance
          </h1>
          <p className="text-gray-600">Manage your attendance and leave requests</p>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-md mb-6">
          <div className="border-b">
            <nav className="flex">
              <button
                onClick={() => setActiveTab('attendance')}
                className={`px-6 py-3 text-sm font-medium ${
                  activeTab === 'attendance'
                    ? 'border-b-2 border-blue-500 text-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Attendance
              </button>
              <button
                onClick={() => setActiveTab('leave')}
                className={`px-6 py-3 text-sm font-medium ${
                  activeTab === 'leave'
                    ? 'border-b-2 border-blue-500 text-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Leave Requests
              </button>
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'attendance' && (
              <div className="space-y-6">
                {/* Today's Status */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h3 className="font-semibold text-blue-800 mb-3">Today's Attendance</h3>
                  <div className="text-sm text-blue-700">
                    {new Date().toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </div>
                </div>

                {onLeave ? (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
                    <div className="text-yellow-800 font-medium">You are on approved leave today</div>
                  </div>
                ) : !todayAttendance ? (
                  <div className="text-center space-y-4">
                    <div className="text-gray-600">You have not checked-in yet.</div>
                    <button
                      onClick={handleCheckIn}
                      disabled={loading}
                      className="bg-green-500 text-white px-8 py-3 rounded-lg hover:bg-green-600 disabled:opacity-50 font-medium"
                    >
                      {loading ? 'Checking In...' : "I'm In"}
                    </button>
                  </div>
                ) : !todayAttendance.outTime ? (
                  <div className="text-center space-y-4">
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <div className="text-green-800 font-medium">Checked In at {todayAttendance.inTime}</div>
                    </div>
                    <button
                      onClick={handleCheckOut}
                      disabled={loading}
                      className="bg-red-500 text-white px-8 py-3 rounded-lg hover:bg-red-600 disabled:opacity-50 font-medium"
                    >
                      {loading ? 'Checking Out...' : "I'm Out"}
                    </button>
                  </div>
                ) : (
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-center">
                    <div className="text-gray-800 font-medium mb-2">You have completed attendance for today.</div>
                    <div className="text-sm text-gray-600">
                      In: {todayAttendance.inTime} | Out: {todayAttendance.outTime}
                    </div>
                    {todayAttendance.totalHours && (
                      <div className="text-sm text-gray-600 mt-1">
                        Total Hours: {todayAttendance.totalHours}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'leave' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="font-semibold">Leave Requests</h3>
                  <button
                    onClick={() => setShowLeaveModal(true)}
                    className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 flex items-center gap-2"
                  >
                    <Send size={16} />
                    New Request
                  </button>
                </div>

                {leaveRequests.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    No leave requests found
                  </div>
                ) : (
                  <div className="space-y-4">
                    {leaveRequests.map((request) => (
                      <div key={request._id} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <div className="font-medium capitalize">{request.leaveType} Leave</div>
                            <div className="text-sm text-gray-600">
                              {new Date(request.startDate).toLocaleDateString()} - {new Date(request.endDate).toLocaleDateString()}
                            </div>
                          </div>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}>
                            {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                          </span>
                        </div>
                        <div className="text-sm text-gray-700 mb-2">
                          <strong>Reason:</strong> {request.reason}
                        </div>
                        {request.adminReason && (
                          <div className="text-sm text-gray-600">
                            <strong>Admin Response:</strong> {request.adminReason}
                          </div>
                        )}
                        <div className="text-xs text-gray-400 mt-2">
                          Submitted: {new Date(request.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Leave Request Modal */}
        <Modal isOpen={showLeaveModal} onClose={() => setShowLeaveModal(false)} title="New Leave Request">
          <form onSubmit={handleLeaveSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Leave Type</label>
              <select
                value={leaveForm.leaveType}
                onChange={(e) => setLeaveForm({ ...leaveForm, leaveType: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
                required
              >
                <option value="casual">Casual Leave</option>
                <option value="sick">Sick Leave</option>
                <option value="emergency">Emergency Leave</option>
                <option value="personal">Personal Leave</option>
                <option value="maternity">Maternity Leave</option>
                <option value="paternity">Paternity Leave</option>
                <option value="medical">Medical Leave</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">From Date</label>
                <input
                  type="date"
                  value={leaveForm.fromDate}
                  onChange={(e) => setLeaveForm({ ...leaveForm, fromDate: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">To Date</label>
                <input
                  type="date"
                  value={leaveForm.toDate}
                  onChange={(e) => setLeaveForm({ ...leaveForm, toDate: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Reason</label>
              <textarea
                value={leaveForm.reason}
                onChange={(e) => setLeaveForm({ ...leaveForm, reason: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
                rows="3"
                required
              />
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 disabled:opacity-50"
              >
                {loading ? 'Submitting...' : 'Submit Request'}
              </button>
              <button
                type="button"
                onClick={() => setShowLeaveModal(false)}
                className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </form>
        </Modal>
      </div>
    </Layout>
  );
};

export default StaffMyAttendance;