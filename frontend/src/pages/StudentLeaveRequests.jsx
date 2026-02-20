import { useState, useEffect, useContext } from 'react';
import { Calendar, FileText, Clock, CheckCircle, XCircle, Plus, User, MessageSquare } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import { leaveRequestAPI } from '../services/api';
import Layout from '../components/Layout';

const StudentLeaveRequests = () => {
  const { user } = useContext(AuthContext);
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    leaveType: '',
    startDate: '',
    endDate: '',
    reason: ''
  });

  useEffect(() => {
    fetchLeaveRequests();
  }, []);

  const fetchLeaveRequests = async () => {
    try {
      console.log('Student fetching leave requests...');
      const response = await leaveRequestAPI.getLeaveRequests();
      console.log('Student leave requests response:', response.data);
      setLeaveRequests(response.data || []);
    } catch (error) {
      console.error('Failed to fetch leave requests:', error);
      console.error('Error details:', error.response?.data);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await leaveRequestAPI.createLeaveRequest(formData);
      setFormData({ leaveType: '', startDate: '', endDate: '', reason: '' });
      setShowForm(false);
      fetchLeaveRequests();
    } catch (error) {
      console.error('Failed to create leave request:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'approved': return <CheckCircle className="text-green-500" size={20} />;
      case 'rejected': return <XCircle className="text-red-500" size={20} />;
      default: return <Clock className="text-yellow-500" size={20} />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800 border-green-200';
      case 'rejected': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    }
  };

  return (
    <Layout>
      <div className="px-4 lg:px-0 py-4 lg:py-0">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Leave Requests</h1>
            <p className="text-gray-600 mt-1">Manage your leave applications and track their status</p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center gap-2 font-medium"
          >
            <Plus size={20} />
            New Request
          </button>
        </div>
        
        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-500 rounded-lg">
                <CheckCircle className="text-white" size={20} />
              </div>
              <div>
                <p className="text-green-800 font-semibold">{leaveRequests.filter(r => r.status === 'approved').length}</p>
                <p className="text-green-600 text-sm">Approved</p>
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 border border-yellow-200 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-500 rounded-lg">
                <Clock className="text-white" size={20} />
              </div>
              <div>
                <p className="text-yellow-800 font-semibold">{leaveRequests.filter(r => r.status === 'pending').length}</p>
                <p className="text-yellow-600 text-sm">Pending</p>
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-red-50 to-red-100 border border-red-200 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-500 rounded-lg">
                <XCircle className="text-white" size={20} />
              </div>
              <div>
                <p className="text-red-800 font-semibold">{leaveRequests.filter(r => r.status === 'rejected').length}</p>
                <p className="text-red-600 text-sm">Rejected</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-blue-100 rounded-lg">
                <FileText className="text-blue-600" size={24} />
              </div>
              <h2 className="text-xl font-bold text-gray-900">Submit Leave Request</h2>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Leave Type</label>
                <select
                  value={formData.leaveType}
                  onChange={(e) => setFormData({...formData, leaveType: e.target.value})}
                  className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  required
                >
                  <option value="">Select Type</option>
                  <option value="sick">🤒 Sick Leave</option>
                  <option value="personal">👤 Personal</option>
                  <option value="family">👨👩👧👦 Family</option>
                  <option value="emergency">🚨 Emergency</option>
                  <option value="maternity">🤱 Maternity</option>
                  <option value="paternity">👨👶 Paternity</option>
                  <option value="vacation">🏖️ Vacation</option>
                  <option value="medical">🏥 Medical</option>
                  <option value="other">📝 Other</option>
                </select>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Start Date</label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                    className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">End Date</label>
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({...formData, endDate: e.target.value})}
                    className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    required
                  />
                </div>
              </div>
              
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Reason</label>
                <textarea
                  value={formData.reason}
                  onChange={(e) => setFormData({...formData, reason: e.target.value})}
                  className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all h-24 resize-none"
                  placeholder="Please provide a detailed reason for your leave request..."
                  required
                />
              </div>
              
              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 rounded-xl hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium shadow-lg"
                >
                  {loading ? 'Submitting...' : 'Submit Request'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-xl hover:bg-gray-200 transition-all duration-200 font-medium"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="grid gap-6">
        {leaveRequests.map((request) => {
          const startDate = new Date(request.startDate);
          const endDate = new Date(request.endDate);
          const duration = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1;
          
          return (
            <div key={request._id} className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 overflow-hidden">
              <div className="p-6">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className={`p-2 rounded-lg ${
                        request.status === 'approved' ? 'bg-green-100' :
                        request.status === 'rejected' ? 'bg-red-100' : 'bg-yellow-100'
                      }`}>
                        {getStatusIcon(request.status)}
                      </div>
                      <div>
                        <h3 className="font-bold text-lg capitalize text-gray-900">{request.leaveType} Leave</h3>
                        <p className="text-gray-500 text-sm">
                          {duration} day{duration > 1 ? 's' : ''} • Submitted {new Date(request.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 text-gray-600 mb-3">
                      <Calendar size={16} />
                      <span className="text-sm font-medium">
                        {startDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })} - {endDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <span className={`px-4 py-2 rounded-full text-sm font-semibold ${getStatusColor(request.status)} border`}>
                      {request.status.toUpperCase()}
                    </span>
                  </div>
                </div>
                
                <div className="bg-gray-50 rounded-xl p-4 mb-4">
                  <div className="flex items-start gap-2">
                    <MessageSquare size={16} className="text-gray-400 mt-1 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-gray-600 mb-1">Reason:</p>
                      <p className="text-gray-800">{request.reason}</p>
                    </div>
                  </div>
                </div>
                
                {request.staffReason && (
                  <div className={`rounded-xl p-4 border-l-4 ${
                    request.status === 'approved' ? 'bg-green-50 border-green-400' :
                    request.status === 'rejected' ? 'bg-red-50 border-red-400' : 'bg-blue-50 border-blue-400'
                  }`}>
                    <div className="flex items-start gap-2">
                      <User size={16} className="text-gray-500 mt-1 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-semibold text-gray-700 mb-1">Staff Response:</p>
                        <p className="text-gray-800 mb-2">{request.staffReason}</p>
                        {request.reviewedBy && (
                          <p className="text-xs text-gray-500">
                            Reviewed by: <span className="font-medium">{request.reviewedBy.name}</span>
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
        
        {leaveRequests.length === 0 && (
          <div className="bg-white rounded-2xl shadow-lg p-8 lg:p-12 text-center border border-gray-100">
            <div className="bg-gray-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
              <Calendar size={40} className="text-gray-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">No leave requests yet</h3>
            <p className="text-gray-500 mb-6 max-w-md mx-auto">You haven't submitted any leave requests. Click the button above to create your first request.</p>
            <button
              onClick={() => setShowForm(true)}
              className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-lg hover:shadow-xl font-medium"
            >
              Create First Request
            </button>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default StudentLeaveRequests;