import { useState, useEffect } from 'react';
import { Plus, Clock, CheckCircle, XCircle, Download, FileText, Calendar, DollarSign } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import api from '../services/api';
import { useSocket } from '../context/SocketContext';

const StudentScholarship = () => {
  const [scholarships, setScholarships] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedScholarship, setSelectedScholarship] = useState(null);
  const [formData, setFormData] = useState({
    scholarshipType: 'Merit',
    academicYear: '2024-2025',
    reason: '',
    familyIncome: '',
    previousScholarship: false
  });
  const socket = useSocket();

  useEffect(() => {
    fetchScholarships();
    if (socket) socket.on('scholarshipUpdate', fetchScholarships);
  }, [socket]);

  const fetchScholarships = async () => {
    try {
      const res = await api.get('/scholarships');
      setScholarships(res.data.data);
    } catch (error) {
      console.error(error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/scholarships/apply', formData);
      alert('✅ Application submitted successfully!');
      setShowModal(false);
      fetchScholarships();
      setFormData({ scholarshipType: 'Merit', academicYear: '2024-2025', reason: '', familyIncome: '', previousScholarship: false });
    } catch (error) {
      alert('❌ Error: ' + error.response?.data?.message);
    }
  };

  const getStatusColor = (status) => {
    const colors = { Pending: 'bg-yellow-100 text-yellow-800 border-yellow-300', Verified: 'bg-blue-100 text-blue-800 border-blue-300', Approved: 'bg-green-100 text-green-800 border-green-300', Rejected: 'bg-red-100 text-red-800 border-red-300' };
    return colors[status] || 'bg-gray-100 text-gray-800 border-gray-300';
  };

  const getStatusIcon = (status) => {
    const icons = { Pending: Clock, Verified: CheckCircle, Approved: CheckCircle, Rejected: XCircle };
    const Icon = icons[status] || Clock;
    return <Icon size={16} />;
  };

  const stats = {
    total: scholarships.length,
    pending: scholarships.filter(s => s.status === 'Pending').length,
    approved: scholarships.filter(s => s.status === 'Approved').length,
    totalAmount: scholarships.filter(s => s.status === 'Approved').reduce((sum, s) => sum + (s.amount || 0), 0)
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 lg:ml-64">
        <Navbar />
        <div className="p-4 lg:p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">My Scholarships</h1>
              <p className="text-sm text-gray-600 mt-1">Apply and track your scholarship applications</p>
            </div>
            <button onClick={() => setShowModal(true)} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-md transition-all">
              <Plus size={18} /> Apply for Scholarship
            </button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-lg shadow-md p-4 border-l-4 border-blue-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Applications</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                </div>
                <FileText className="text-blue-500" size={32} />
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-md p-4 border-l-4 border-yellow-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Pending Review</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.pending}</p>
                </div>
                <Clock className="text-yellow-500" size={32} />
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-md p-4 border-l-4 border-green-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Approved</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.approved}</p>
                </div>
                <CheckCircle className="text-green-500" size={32} />
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-md p-4 border-l-4 border-purple-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Amount</p>
                  <p className="text-2xl font-bold text-gray-900">₹{stats.totalAmount.toLocaleString()}</p>
                </div>
                <DollarSign className="text-purple-500" size={32} />
              </div>
            </div>
          </div>

          {/* Scholarships Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {scholarships.map((s) => (
              <div key={s._id} className="bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow border border-gray-200">
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">{s.scholarshipType}</h3>
                      <p className="text-sm text-gray-500">{s.academicYear}</p>
                    </div>
                    <span className={`flex items-center gap-1 px-3 py-1 text-xs font-semibold rounded-full border ${getStatusColor(s.status)}`}>
                      {getStatusIcon(s.status)} {s.status}
                    </span>
                  </div>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Calendar size={14} />
                      <span>Applied: {new Date(s.applicationDate).toLocaleDateString()}</span>
                    </div>
                    {s.eligibilityScore && (
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                          <div className={`h-2 rounded-full ${s.autoEligible ? 'bg-green-500' : 'bg-yellow-500'}`} style={{ width: `${s.eligibilityScore}%` }}></div>
                        </div>
                        <span className="text-xs font-semibold">{s.eligibilityScore}%</span>
                      </div>
                    )}
                    {s.amount && (
                      <div className="bg-green-50 border border-green-200 rounded-lg p-3 mt-3">
                        <p className="text-xs text-green-700 font-medium">Approved Amount</p>
                        <p className="text-xl font-bold text-green-700">₹{s.amount.toLocaleString()}</p>
                        {s.amountType === 'Percentage' && <p className="text-xs text-green-600">({s.amount}% of total fee)</p>}
                      </div>
                    )}
                  </div>

                  {(s.staffRemarks || s.adminRemarks) && (
                    <div className="space-y-2 mb-4">
                      {s.staffRemarks && (
                        <div className="bg-blue-50 border border-blue-200 rounded p-2">
                          <p className="text-xs font-semibold text-blue-700">Staff Remarks:</p>
                          <p className="text-xs text-blue-600">{s.staffRemarks}</p>
                        </div>
                      )}
                      {s.adminRemarks && (
                        <div className="bg-purple-50 border border-purple-200 rounded p-2">
                          <p className="text-xs font-semibold text-purple-700">Admin Remarks:</p>
                          <p className="text-xs text-purple-600">{s.adminRemarks}</p>
                        </div>
                      )}
                    </div>
                  )}

                  <button onClick={() => { setSelectedScholarship(s); setShowDetailsModal(true); }} className="w-full px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors text-sm font-medium">
                    View Details
                  </button>
                </div>
              </div>
            ))}
          </div>

          {scholarships.length === 0 && (
            <div className="text-center py-16 bg-white rounded-lg shadow-md">
              <FileText size={64} className="mx-auto text-gray-300 mb-4" />
              <h3 className="text-xl font-semibold text-gray-700 mb-2">No Applications Yet</h3>
              <p className="text-gray-500 mb-4">Start by applying for your first scholarship</p>
              <button onClick={() => setShowModal(true)} className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                Apply Now
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Application Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <h2 className="text-2xl font-bold mb-6 text-gray-900">Apply for Scholarship</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">Scholarship Type *</label>
                <select value={formData.scholarshipType} onChange={(e) => setFormData({ ...formData, scholarshipType: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" required>
                  <option value="Merit">Merit Based</option>
                  <option value="Government">Government Scholarship</option>
                  <option value="Sports">Sports Scholarship</option>
                  <option value="Minority">Minority Scholarship</option>
                  <option value="Management">Management Quota</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">Academic Year *</label>
                <input type="text" value={formData.academicYear} onChange={(e) => setFormData({ ...formData, academicYear: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" required />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">Reason for Application *</label>
                <textarea value={formData.reason} onChange={(e) => setFormData({ ...formData, reason: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" rows="4" placeholder="Explain why you deserve this scholarship..." required />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">Family Annual Income (₹)</label>
                <input type="number" value={formData.familyIncome} onChange={(e) => setFormData({ ...formData, familyIncome: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="e.g., 300000" />
              </div>
              <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <input type="checkbox" checked={formData.previousScholarship} onChange={(e) => setFormData({ ...formData, previousScholarship: e.target.checked })} className="w-5 h-5 text-blue-600" />
                <label className="text-sm font-medium text-gray-700">This is a renewal application (I have received this scholarship previously)</label>
              </div>
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium transition-colors">Cancel</button>
                <button type="submit" className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium shadow-md transition-colors">Submit Application</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Details Modal */}
      {showDetailsModal && selectedScholarship && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{selectedScholarship.scholarshipType} Scholarship</h2>
                <p className="text-sm text-gray-500 mt-1">{selectedScholarship.academicYear}</p>
              </div>
              <span className={`flex items-center gap-1 px-4 py-2 text-sm font-semibold rounded-full border ${getStatusColor(selectedScholarship.status)}`}>
                {getStatusIcon(selectedScholarship.status)} {selectedScholarship.status}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-xs text-gray-600 mb-1">Application Date</p>
                <p className="font-semibold">{new Date(selectedScholarship.applicationDate).toLocaleDateString()}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-xs text-gray-600 mb-1">Eligibility Score</p>
                <p className="font-semibold">{selectedScholarship.eligibilityScore}% {selectedScholarship.autoEligible ? '✅' : '⚠️'}</p>
              </div>
              {selectedScholarship.familyIncome && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-xs text-gray-600 mb-1">Family Income</p>
                  <p className="font-semibold">₹{selectedScholarship.familyIncome.toLocaleString()}</p>
                </div>
              )}
              {selectedScholarship.amount && (
                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                  <p className="text-xs text-green-700 mb-1">Approved Amount</p>
                  <p className="font-bold text-green-700 text-lg">₹{selectedScholarship.amount.toLocaleString()}</p>
                </div>
              )}
            </div>

            <div className="mb-6">
              <p className="text-sm font-semibold text-gray-700 mb-2">Application Reason:</p>
              <p className="text-sm text-gray-600 bg-gray-50 p-4 rounded-lg">{selectedScholarship.reason}</p>
            </div>

            {selectedScholarship.staffRemarks && (
              <div className="mb-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm font-semibold text-blue-700 mb-2">Staff Verification Remarks:</p>
                <p className="text-sm text-blue-600">{selectedScholarship.staffRemarks}</p>
                {selectedScholarship.staffVerifiedDate && (
                  <p className="text-xs text-blue-500 mt-2">Verified on: {new Date(selectedScholarship.staffVerifiedDate).toLocaleDateString()}</p>
                )}
              </div>
            )}

            {selectedScholarship.adminRemarks && (
              <div className="mb-4 bg-purple-50 border border-purple-200 rounded-lg p-4">
                <p className="text-sm font-semibold text-purple-700 mb-2">Admin Decision Remarks:</p>
                <p className="text-sm text-purple-600">{selectedScholarship.adminRemarks}</p>
                {selectedScholarship.adminApprovedDate && (
                  <p className="text-xs text-purple-500 mt-2">Decided on: {new Date(selectedScholarship.adminApprovedDate).toLocaleDateString()}</p>
                )}
              </div>
            )}

            {selectedScholarship.validFrom && selectedScholarship.validTo && (
              <div className="mb-4 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-sm font-semibold text-yellow-700 mb-2">Validity Period:</p>
                <p className="text-sm text-yellow-600">
                  From: {new Date(selectedScholarship.validFrom).toLocaleDateString()} - To: {new Date(selectedScholarship.validTo).toLocaleDateString()}
                </p>
              </div>
            )}

            <button onClick={() => setShowDetailsModal(false)} className="w-full px-4 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 font-medium transition-colors">
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentScholarship;
