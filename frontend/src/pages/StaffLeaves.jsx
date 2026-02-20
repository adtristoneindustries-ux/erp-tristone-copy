import { useState, useEffect, useContext } from 'react';
import { leaveRequestAPI } from '../services/api';
import { SocketContext } from '../context/SocketContext';
import { AuthContext } from '../context/AuthContext';
import Layout from '../components/Layout';
import { Plus, FileText } from 'lucide-react';

const StaffLeaves = () => {
  const { user } = useContext(AuthContext);
  const socket = useContext(SocketContext);
  const [leaves, setLeaves] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    startDate: '',
    endDate: '',
    leaveType: 'casual',
    reason: ''
  });

  useEffect(() => {
    fetchLeaves();
  }, []);

  // Listen for leave status updates
  useEffect(() => {
    if (socket && user) {
      socket.on('leaveStatusUpdate', (data) => {
        if (data.staff === user._id) {
          fetchLeaves(); // Refresh the leave requests
        }
      });

      return () => {
        socket.off('leaveStatusUpdate');
      };
    }
  }, [socket, user]);

  const fetchLeaves = async () => {
    try {
      const response = await leaveRequestAPI.getMyLeaveRequests();
      setLeaves(response.data);
    } catch (error) {
      console.error('Error fetching leaves:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await leaveRequestAPI.createLeaveRequest(formData);
      setShowModal(false);
      setFormData({ startDate: '', endDate: '', leaveType: 'casual', reason: '' });
      fetchLeaves();
    } catch (error) {
      console.error('Error creating leave request:', error);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved': return 'text-green-600 bg-green-100';
      case 'rejected': return 'text-red-600 bg-red-100';
      default: return 'text-yellow-600 bg-yellow-100';
    }
  };

  return (
    <Layout>
      <div className="p-4 lg:p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <div>
            <h1 className="text-xl lg:text-2xl font-bold flex items-center gap-2">
              <FileText className="text-blue-600" />
              My Leave Requests
            </h1>
            <p className="text-gray-600 text-sm lg:text-base">View and manage your leave applications</p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
          >
            <Plus size={16} />
            Request Leave
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {leaves.length === 0 ? (
            <div className="p-6 lg:p-8 text-center text-gray-500">
              <FileText size={32} lg:size={48} className="mx-auto mb-4 text-gray-300" />
              <p className="text-sm lg:text-base">No leave requests found</p>
              <p className="text-xs lg:text-sm mt-2">Click "Request Leave" to submit your first leave application</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                    <th className="px-3 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Dates</th>
                    <th className="px-3 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase hidden sm:table-cell">Reason</th>
                    <th className="px-3 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-3 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase hidden lg:table-cell">Admin Response</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {leaves.map((leave) => (
                    <tr key={leave._id} className="hover:bg-gray-50">
                      <td className="px-3 lg:px-6 py-4 whitespace-nowrap capitalize font-medium text-xs lg:text-sm">{leave.leaveType}</td>
                      <td className="px-3 lg:px-6 py-4 whitespace-nowrap text-xs lg:text-sm">
                        <div className="lg:hidden">
                          <div>{new Date(leave.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</div>
                          <div className="text-xs text-gray-500">to {new Date(leave.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</div>
                        </div>
                        <div className="hidden lg:block">
                          {new Date(leave.startDate).toLocaleDateString()} - {new Date(leave.endDate).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-3 lg:px-6 py-4 text-xs lg:text-sm hidden sm:table-cell">
                        <div className="max-w-[150px] lg:max-w-none truncate" title={leave.reason}>
                          {leave.reason}
                        </div>
                      </td>
                      <td className="px-3 lg:px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs rounded-full font-medium ${getStatusColor(leave.status)}`}>
                          <span className="lg:hidden">{leave.status.charAt(0).toUpperCase()}</span>
                          <span className="hidden lg:inline">{leave.status.charAt(0).toUpperCase() + leave.status.slice(1)}</span>
                        </span>
                        <div className="sm:hidden mt-1 text-xs text-gray-500 truncate max-w-[100px]" title={leave.reason}>
                          {leave.reason}
                        </div>
                      </td>
                      <td className="px-3 lg:px-6 py-4 text-xs lg:text-sm hidden lg:table-cell">
                        {leave.adminResponse ? (
                          <div className={`p-2 rounded-lg ${
                            leave.status === 'approved' ? 'bg-green-50 text-green-800' :
                            leave.status === 'rejected' ? 'bg-red-50 text-red-800' :
                            'bg-gray-50 text-gray-800'
                          }`}>
                            {leave.adminResponse}
                          </div>
                        ) : (
                          <span className="text-gray-400 italic">No response yet</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-4 lg:p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
              <h2 className="text-lg lg:text-xl font-bold mb-4">Request Leave</h2>
              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2">Leave Type</label>
                  <select
                    value={formData.leaveType}
                    onChange={(e) => setFormData({...formData, leaveType: e.target.value})}
                    className="w-full p-2 lg:p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 text-sm lg:text-base"
                  >
                    <option value="casual">Casual</option>
                    <option value="sick">Sick</option>
                    <option value="emergency">Emergency</option>
                    <option value="personal">Personal</option>
                    <option value="maternity">Maternity</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Start Date</label>
                    <input
                      type="date"
                      value={formData.startDate}
                      onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                      className="w-full p-2 lg:p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 text-sm lg:text-base"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">End Date</label>
                    <input
                      type="date"
                      value={formData.endDate}
                      onChange={(e) => setFormData({...formData, endDate: e.target.value})}
                      className="w-full p-2 lg:p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 text-sm lg:text-base"
                      required
                    />
                  </div>
                </div>
                <div className="mb-6">
                  <label className="block text-sm font-medium mb-2">Reason</label>
                  <textarea
                    value={formData.reason}
                    onChange={(e) => setFormData({...formData, reason: e.target.value})}
                    className="w-full p-2 lg:p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 text-sm lg:text-base"
                    rows="3"
                    placeholder="Please provide a reason for your leave request..."
                    required
                  />
                </div>
                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    type="submit"
                    className="flex-1 bg-blue-600 text-white py-2 lg:py-3 rounded-lg hover:bg-blue-700 font-medium text-sm lg:text-base"
                  >
                    Submit Request
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="flex-1 bg-gray-300 text-gray-700 py-2 lg:py-3 rounded-lg hover:bg-gray-400 font-medium text-sm lg:text-base"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default StaffLeaves;