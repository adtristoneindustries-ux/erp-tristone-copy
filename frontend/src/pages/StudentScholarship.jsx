import { useState, useEffect } from 'react';
import { Plus, Clock, CheckCircle, XCircle, FileText, Calendar, DollarSign, Award, ChevronDown, ChevronUp } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import api from '../services/api';
import { useSocket } from '../context/SocketContext';

const StudentScholarship = () => {
  const [availableScholarships, setAvailableScholarships] = useState([]);
  const [myApplications, setMyApplications] = useState([]);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedScholarship, setSelectedScholarship] = useState(null);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [activeTab, setActiveTab] = useState('available');
  const [formData, setFormData] = useState({ reason: '', familyIncome: '', previousScholarship: false });
  const [submitting, setSubmitting] = useState(false);
  const socket = useSocket();

  useEffect(() => {
    fetchData();
    if (socket) socket.on('scholarshipUpdate', fetchData);
    return () => { if (socket) socket.off('scholarshipUpdate', fetchData); };
  }, [socket]);

  const fetchData = async () => {
    try {
      const [availRes, myRes] = await Promise.all([
        api.get('/scholarships'),
        api.get('/scholarships/my-applications')
      ]);
      setAvailableScholarships(availRes.data.data || []);
      setMyApplications(myRes.data.data || []);
    } catch (error) {
      console.error(error);
    }
  };

  const hasApplied = (scholarshipId) =>
    myApplications.some(a => a.scholarship?._id === scholarshipId);

  const handleApplyClick = (scholarship) => {
    setSelectedScholarship(scholarship);
    setFormData({ reason: '', familyIncome: '', previousScholarship: false });
    setShowApplyModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/scholarships/apply', {
        scholarshipId: selectedScholarship._id,
        reason: formData.reason,
        familyIncome: formData.familyIncome ? Number(formData.familyIncome) : undefined,
        previousScholarship: formData.previousScholarship
      });
      alert('✅ Application submitted successfully!');
      setShowApplyModal(false);
      fetchData();
    } catch (error) {
      alert('❌ ' + (error.response?.data?.message || 'Failed to submit'));
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusColor = (status) => ({
    Pending: 'bg-yellow-100 text-yellow-800',
    Verified: 'bg-blue-100 text-blue-800',
    Approved: 'bg-green-100 text-green-800',
    Rejected: 'bg-red-100 text-red-800'
  }[status] || 'bg-gray-100 text-gray-800');

  const stats = {
    total: myApplications.length,
    pending: myApplications.filter(a => a.status === 'Pending').length,
    approved: myApplications.filter(a => a.status === 'Approved').length,
    totalAmount: myApplications.filter(a => a.status === 'Approved').reduce((s, a) => s + (a.approvedAmount || 0), 0)
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 lg:ml-64">
        <Navbar />
        <div className="p-4 lg:p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Scholarships</h1>
            <p className="text-sm text-gray-600 mt-1">Browse available scholarships and track your applications</p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {[
              { label: 'My Applications', value: stats.total, icon: FileText, color: 'border-blue-500', iconColor: 'text-blue-500' },
              { label: 'Pending', value: stats.pending, icon: Clock, color: 'border-yellow-500', iconColor: 'text-yellow-500' },
              { label: 'Approved', value: stats.approved, icon: CheckCircle, color: 'border-green-500', iconColor: 'text-green-500' },
              { label: 'Amount Received', value: `₹${stats.totalAmount.toLocaleString()}`, icon: DollarSign, color: 'border-purple-500', iconColor: 'text-purple-500' }
            ].map((s, i) => (
              <div key={i} className={`bg-white rounded-lg shadow-md p-4 border-l-4 ${s.color}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-600">{s.label}</p>
                    <p className="text-xl font-bold text-gray-900">{s.value}</p>
                  </div>
                  <s.icon className={s.iconColor} size={28} />
                </div>
              </div>
            ))}
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mb-6">
            <button onClick={() => setActiveTab('available')} className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${activeTab === 'available' ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50 border'}`}>
              Available Scholarships ({availableScholarships.length})
            </button>
            <button onClick={() => setActiveTab('applications')} className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${activeTab === 'applications' ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50 border'}`}>
              My Applications ({myApplications.length})
            </button>
          </div>

          {/* Available Scholarships */}
          {activeTab === 'available' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {availableScholarships.length === 0 ? (
                <div className="col-span-full text-center py-16 bg-white rounded-lg shadow-md">
                  <Award size={64} className="mx-auto text-gray-300 mb-4" />
                  <p className="text-gray-500">No scholarships available right now</p>
                </div>
              ) : availableScholarships.map((s) => {
                const applied = hasApplied(s._id);
                return (
                  <div key={s._id} className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
                    <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-4 text-white">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-bold text-lg">{s.name}</h3>
                          <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full">{s.type}</span>
                        </div>
                        <span className="text-xs bg-white/20 px-2 py-1 rounded-full">{s.academicYear}</span>
                      </div>
                    </div>
                    <div className="p-4">
                      {s.description && <p className="text-sm text-gray-600 mb-3">{s.description}</p>}
                      <div className="space-y-2 mb-4">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">Amount</span>
                          <span className="font-bold text-green-600">
                            {s.amountType === 'Percentage' ? `${s.amount}%` : `₹${s.amount?.toLocaleString()}`}
                          </span>
                        </div>
                        {s.deadline && (
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-500">Deadline</span>
                            <span className="font-medium text-red-600">{new Date(s.deadline).toLocaleDateString()}</span>
                          </div>
                        )}
                        {s.eligibilityCriteria?.description && (
                          <div className="bg-blue-50 rounded p-2 text-xs text-blue-700">
                            <span className="font-semibold">Eligibility: </span>{s.eligibilityCriteria.description}
                          </div>
                        )}
                        {(s.eligibilityCriteria?.minAttendance > 0 || s.eligibilityCriteria?.minCGPA > 0 || s.eligibilityCriteria?.maxFamilyIncome > 0) && (
                          <div className="bg-gray-50 rounded p-2 space-y-1 text-xs text-gray-600">
                            {s.eligibilityCriteria.minAttendance > 0 && <p>Min Attendance: {s.eligibilityCriteria.minAttendance}%</p>}
                            {s.eligibilityCriteria.minCGPA > 0 && <p>Min CGPA: {s.eligibilityCriteria.minCGPA}</p>}
                            {s.eligibilityCriteria.maxFamilyIncome > 0 && <p>Max Family Income: ₹{s.eligibilityCriteria.maxFamilyIncome.toLocaleString()}</p>}
                            {s.eligibilityCriteria.classes?.length > 0 && <p>Classes: {s.eligibilityCriteria.classes.join(', ')}</p>}
                          </div>
                        )}
                      </div>
                      {applied ? (
                        <div className="w-full py-2 bg-green-50 text-green-700 rounded-lg text-sm font-medium text-center border border-green-200">
                          ✅ Already Applied
                        </div>
                      ) : (
                        <button onClick={() => handleApplyClick(s)} className="w-full py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
                          Apply Now
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* My Applications */}
          {activeTab === 'applications' && (
            <div className="space-y-4">
              {myApplications.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-lg shadow-md">
                  <FileText size={64} className="mx-auto text-gray-300 mb-4" />
                  <p className="text-gray-500">No applications yet. Browse available scholarships to apply.</p>
                  <button onClick={() => setActiveTab('available')} className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm">
                    Browse Scholarships
                  </button>
                </div>
              ) : myApplications.map((app) => (
                <div key={app._id} className="bg-white rounded-lg shadow-md p-5 border border-gray-200">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div>
                      <h3 className="font-bold text-gray-900">{app.scholarship?.name}</h3>
                      <p className="text-sm text-gray-500">{app.scholarship?.type} • {app.academicYear}</p>
                      <p className="text-xs text-gray-400 mt-1">Applied: {new Date(app.appliedDate).toLocaleDateString()}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(app.status)}`}>
                        {app.status}
                      </span>
                      <button onClick={() => { setSelectedApplication(app); setShowDetailsModal(true); }} className="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-xs font-medium">
                        View Details
                      </button>
                    </div>
                  </div>
                  {app.status === 'Approved' && app.approvedAmount && (
                    <div className="mt-3 bg-green-50 border border-green-200 rounded-lg p-3">
                      <p className="text-xs text-green-700 font-medium">Approved Amount</p>
                      <p className="text-lg font-bold text-green-700">
                        {app.approvedAmountType === 'Percentage' ? `${app.approvedAmount}%` : `₹${app.approvedAmount.toLocaleString()}`}
                      </p>
                    </div>
                  )}
                  {app.adminRemarks && (
                    <div className="mt-3 bg-purple-50 border border-purple-200 rounded p-2">
                      <p className="text-xs font-semibold text-purple-700">Admin Remarks:</p>
                      <p className="text-xs text-purple-600">{app.adminRemarks}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Apply Modal */}
      {showApplyModal && selectedScholarship && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl">
            <h2 className="text-xl font-bold mb-1">Apply for Scholarship</h2>
            <p className="text-sm text-gray-500 mb-4">{selectedScholarship.name} — {selectedScholarship.amountType === 'Percentage' ? `${selectedScholarship.amount}%` : `₹${selectedScholarship.amount?.toLocaleString()}`}</p>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Reason for Application *</label>
                <textarea value={formData.reason} onChange={e => setFormData({ ...formData, reason: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none" rows="4"
                  placeholder="Explain why you deserve this scholarship..." required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Family Annual Income (₹)</label>
                <input type="number" value={formData.familyIncome} onChange={e => setFormData({ ...formData, familyIncome: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  placeholder="e.g., 300000" />
              </div>
              <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                <input type="checkbox" checked={formData.previousScholarship} onChange={e => setFormData({ ...formData, previousScholarship: e.target.checked })} className="w-4 h-4" />
                <label className="text-sm text-gray-700">Renewal application (received this scholarship before)</label>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowApplyModal(false)} className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">Cancel</button>
                <button type="submit" disabled={submitting} className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">
                  {submitting ? 'Submitting...' : 'Submit Application'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Details Modal */}
      {showDetailsModal && selectedApplication && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="text-xl font-bold">{selectedApplication.scholarship?.name}</h2>
                <p className="text-sm text-gray-500">{selectedApplication.scholarship?.type} • {selectedApplication.academicYear}</p>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(selectedApplication.status)}`}>
                {selectedApplication.status}
              </span>
            </div>
            <div className="space-y-3">
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-xs text-gray-500 mb-1">Applied On</p>
                <p className="font-medium text-sm">{new Date(selectedApplication.appliedDate).toLocaleDateString()}</p>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-xs text-gray-500 mb-1">Reason</p>
                <p className="text-sm text-gray-700">{selectedApplication.reason}</p>
              </div>
              {selectedApplication.familyIncome && (
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">Family Income</p>
                  <p className="font-medium text-sm">₹{selectedApplication.familyIncome.toLocaleString()}</p>
                </div>
              )}
              {selectedApplication.status === 'Approved' && selectedApplication.approvedAmount && (
                <div className="bg-green-50 border border-green-200 p-3 rounded-lg">
                  <p className="text-xs text-green-600 mb-1">Approved Amount</p>
                  <p className="font-bold text-green-700 text-lg">
                    {selectedApplication.approvedAmountType === 'Percentage' ? `${selectedApplication.approvedAmount}%` : `₹${selectedApplication.approvedAmount.toLocaleString()}`}
                  </p>
                  {selectedApplication.validFrom && selectedApplication.validTo && (
                    <p className="text-xs text-green-600 mt-1">
                      Valid: {new Date(selectedApplication.validFrom).toLocaleDateString()} – {new Date(selectedApplication.validTo).toLocaleDateString()}
                    </p>
                  )}
                </div>
              )}
              {selectedApplication.adminRemarks && (
                <div className="bg-purple-50 border border-purple-200 p-3 rounded-lg">
                  <p className="text-xs font-semibold text-purple-700 mb-1">Admin Remarks</p>
                  <p className="text-sm text-purple-600">{selectedApplication.adminRemarks}</p>
                </div>
              )}
            </div>
            <button onClick={() => setShowDetailsModal(false)} className="w-full mt-4 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700">Close</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentScholarship;
