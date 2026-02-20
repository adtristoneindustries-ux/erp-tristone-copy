import { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import { leaveRequestAPI } from '../services/api';

const AdminLeaves = () => {
  const [leaves, setLeaves] = useState([]);
  const [selectedLeave, setSelectedLeave] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [response, setResponse] = useState('');
  const [filter, setFilter] = useState('all'); // all, student, staff

  useEffect(() => {
    fetchLeaves();
  }, [filter]);

  const fetchLeaves = async () => {
    try {
      // Admin only sees staff leave requests
      const response = await leaveRequestAPI.getLeaveRequests({ userRole: 'staff' });
      setLeaves(response.data);
    } catch (error) {
      console.error('Error fetching leaves:', error);
    }
  };

  const handleStatusUpdate = async (leaveId, status) => {
    try {
      await leaveRequestAPI.updateLeaveRequestStatus(leaveId, { 
        status, 
        adminReason: response 
      });
      setShowModal(false);
      setResponse('');
      setSelectedLeave(null);
      fetchLeaves();
    } catch (error) {
      console.error('Error updating leave status:', error);
    }
  };

  const openModal = (leave) => {
    setSelectedLeave(leave);
    setShowModal(true);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved': return 'text-green-600 bg-green-100';
      case 'rejected': return 'text-red-600 bg-red-100';
      default: return 'text-yellow-600 bg-yellow-100';
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 lg:ml-64 transition-all duration-300">
        <Navbar />
        <div className="p-4 lg:p-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
            <h1 className="text-xl lg:text-2xl font-bold">Staff Leave Requests</h1>
          </div>

          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            {/* Desktop Table View */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Dates</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Reason</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {leaves.map((leave) => (
                    <tr key={leave._id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="font-medium">{leave.user?.name}</div>
                          <div className="text-sm text-gray-500">{leave.user?.email}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          leave.user?.role === 'staff' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                        }`}>
                          {leave.user?.role?.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap capitalize">{leave.leaveType}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {new Date(leave.startDate).toLocaleDateString()} - {new Date(leave.endDate).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 max-w-xs truncate">{leave.reason}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(leave.status)}`}>
                          {leave.status.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {leave.status === 'pending' && (
                          <button
                            onClick={() => openModal(leave)}
                            className="text-blue-600 hover:text-blue-900 p-2 min-w-[44px] min-h-[44px] rounded hover:bg-blue-50 transition-colors"
                          >
                            Review
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View */}
            <div className="lg:hidden divide-y divide-gray-200">
              {leaves.map((leave) => (
                <div key={leave._id} className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3 flex-1">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-blue-600 font-semibold text-sm">
                          {leave.user?.name?.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="flex-1">
                        <div className="font-medium">{leave.user?.name}</div>
                        <div className="text-sm text-gray-500">{leave.user?.email}</div>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(leave.status)}`}>
                        {leave.status.toUpperCase()}
                      </span>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        leave.user?.role === 'staff' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                      }`}>
                        {leave.user?.role?.toUpperCase()}
                      </span>
                    </div>
                  </div>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Leave Type:</span>
                      <span className="text-sm font-medium capitalize">{leave.leaveType}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Duration:</span>
                      <span className="text-sm font-medium">
                        {new Date(leave.startDate).toLocaleDateString()} - {new Date(leave.endDate).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-sm text-gray-500">Reason:</span>
                      <span className="text-sm font-medium">{leave.reason}</span>
                    </div>
                  </div>
                  
                  {leave.status === 'pending' && (
                    <div className="flex justify-end">
                      <button
                        onClick={() => openModal(leave)}
                        className="bg-blue-500 text-white px-4 py-2 min-h-[44px] rounded-lg hover:bg-blue-600 transition-colors text-sm"
                      >
                        Review
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
            
            {leaves.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No leave requests found
              </div>
            )}
          </div>

          {showModal && selectedLeave && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-lg p-4 lg:p-6 w-full max-w-md">
                <h2 className="text-lg lg:text-xl font-bold mb-4">Review Leave Request</h2>
                <div className="mb-4 space-y-2">
                  <p><strong>User:</strong> {selectedLeave.user?.name} ({selectedLeave.user?.role})</p>
                  <p><strong>Email:</strong> {selectedLeave.user?.email}</p>
                  <p><strong>Type:</strong> {selectedLeave.leaveType}</p>
                  <p><strong>Dates:</strong> {new Date(selectedLeave.startDate).toLocaleDateString()} - {new Date(selectedLeave.endDate).toLocaleDateString()}</p>
                  <p><strong>Reason:</strong> {selectedLeave.reason}</p>
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2">Admin Response</label>
                  <textarea
                    value={response}
                    onChange={(e) => setResponse(e.target.value)}
                    className="w-full px-4 py-3 min-h-[100px] text-base border rounded-lg focus:ring-2 focus:ring-blue-500"
                    rows="3"
                    placeholder="Optional response message..."
                  />
                </div>
                <div className="flex flex-col sm:flex-row gap-2">
                  <button
                    onClick={() => handleStatusUpdate(selectedLeave._id, 'approved')}
                    className="flex-1 bg-green-600 text-white py-3 min-h-[48px] text-base font-medium rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => handleStatusUpdate(selectedLeave._id, 'rejected')}
                    className="flex-1 bg-red-600 text-white py-3 min-h-[48px] text-base font-medium rounded-lg hover:bg-red-700 transition-colors"
                  >
                    Reject
                  </button>
                  <button
                    onClick={() => setShowModal(false)}
                    className="flex-1 bg-gray-300 text-gray-700 py-3 min-h-[48px] text-base font-medium rounded-lg hover:bg-gray-400 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminLeaves;
  
