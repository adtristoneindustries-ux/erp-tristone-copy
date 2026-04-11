import { useState, useEffect } from 'react';
import { CheckCircle, XCircle, TrendingUp, DollarSign, Users, Award, Search, Filter, Eye, Edit2 } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import api from '../services/api';

const AdminScholarship = () => {
  const [scholarships, setScholarships] = useState([]);
  const [allScholarships, setAllScholarships] = useState([]);
  const [filteredScholarships, setFilteredScholarships] = useState([]);
  const [analytics, setAnalytics] = useState({ total: 0, pending: 0, verified: 0, approved: 0, totalAmount: 0 });
  const [showModal, setShowModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selected, setSelected] = useState(null);
  const [formData, setFormData] = useState({ status: 'Approved', amount: '', amountType: 'Fixed', validFrom: '', validTo: '', remarks: '' });
  const [scholarshipForm, setScholarshipForm] = useState({
    name: '',
    description: '',
    type: 'Merit',
    amount: '',
    amountType: 'Fixed',
    academicYear: new Date().getFullYear() + '-' + (new Date().getFullYear() + 1),
    deadline: '',
    status: 'Active'
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('All');

  useEffect(() => {
    fetchScholarships();
    fetchAllScholarships();
    fetchAnalytics();
  }, []);

  useEffect(() => {
    filterData();
  }, [scholarships, searchTerm, filterType]);

  const fetchScholarships = async () => {
    try {
      const res = await api.get('/scholarships/applications');
      setScholarships(res.data.data || []);
    } catch (error) {
      console.log('Scholarships not available');
      setScholarships([]);
    }
  };

  const fetchAllScholarships = async () => {
    try {
      const res = await api.get('/scholarships');
      setAllScholarships(res.data.data || []);
    } catch (error) {
      console.log('Error fetching scholarships');
    }
  };

  const fetchAnalytics = async () => {
    try {
      const res = await api.get('/scholarships/analytics');
      setAnalytics(res.data.data);
    } catch (error) {
      console.log('Analytics not available');
    }
  };

  const filterData = () => {
    let filtered = scholarships;
    if (searchTerm) {
      filtered = filtered.filter(s => 
        s.student?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.student?.rollNumber?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    if (filterType !== 'All') {
      filtered = filtered.filter(s => s.scholarship?.type === filterType);
    }
    setFilteredScholarships(filtered);
  };

  const handleApprove = (scholarship) => {
    setSelected(scholarship);
    setFormData({ status: 'Approved', amount: '', amountType: 'Fixed', validFrom: '', validTo: '', remarks: '' });
    setShowModal(true);
  };

  const handleReject = (scholarship) => {
    setSelected(scholarship);
    setFormData({ status: 'Rejected', amount: '', amountType: 'Fixed', validFrom: '', validTo: '', remarks: '' });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/scholarships/applications/${selected._id}/review`, {
        status: formData.status,
        adminRemarks: formData.remarks,
        approvedAmount: formData.amount,
        approvedAmountType: formData.amountType,
        validFrom: formData.validFrom,
        validTo: formData.validTo
      });
      alert(`✅ Scholarship ${formData.status.toLowerCase()} successfully!`);
      setShowModal(false);
      fetchScholarships();
      fetchAnalytics();
    } catch (error) {
      alert('❌ Error: ' + error.response?.data?.message);
    }
  };

  const handleScholarshipSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editMode) {
        await api.put(`/scholarships/${selected._id}`, scholarshipForm);
        alert('✅ Scholarship updated successfully!');
      } else {
        await api.post('/scholarships', scholarshipForm);
        alert('✅ Scholarship created successfully!');
      }
      resetScholarshipForm();
      fetchAllScholarships();
    } catch (error) {
      alert('❌ Error: ' + error.response?.data?.message);
    }
  };

  const handleEditScholarship = (scholarship) => {
    setScholarshipForm({
      name: scholarship.name,
      description: scholarship.description || '',
      type: scholarship.type,
      amount: scholarship.amount,
      amountType: scholarship.amountType,
      academicYear: scholarship.academicYear,
      deadline: scholarship.deadline ? scholarship.deadline.split('T')[0] : '',
      status: scholarship.status
    });
    setSelected(scholarship);
    setEditMode(true);
    setShowCreateModal(true);
  };

  const handleDeleteScholarship = async (id) => {
    if (!confirm('Are you sure you want to delete this scholarship?')) return;
    try {
      await api.delete(`/scholarships/${id}`);
      alert('✅ Scholarship deleted successfully!');
      fetchAllScholarships();
    } catch (error) {
      alert('❌ Error: ' + error.response?.data?.message);
    }
  };

  const resetScholarshipForm = () => {
    setScholarshipForm({
      name: '',
      description: '',
      type: 'Merit',
      amount: '',
      amountType: 'Fixed',
      academicYear: new Date().getFullYear() + '-' + (new Date().getFullYear() + 1),
      deadline: '',
      status: 'Active'
    });
    setShowCreateModal(false);
    setEditMode(false);
    setSelected(null);
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 lg:ml-64 overflow-x-hidden">
        <Navbar />
        <div className="p-3 sm:p-4 lg:p-6">
          <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Scholarship Management</h1>
              <p className="text-sm text-gray-600 mt-1">Review verified applications and make final decisions</p>
            </div>
            <button onClick={() => setShowCreateModal(true)} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 font-medium text-sm whitespace-nowrap">
              + Add Scholarship
            </button>
          </div>

          {/* Available Scholarships */}
          {allScholarships.length > 0 && (
            <div className="bg-white rounded-lg shadow-md p-4 mb-6">
              <h2 className="text-lg font-semibold mb-4">Available Scholarships</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {allScholarships.map((scholarship) => (
                  <div key={scholarship._id} className="border rounded-lg p-4 hover:shadow-lg transition-shadow">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold text-gray-900">{scholarship.name}</h3>
                      <div className="flex gap-1">
                        <button onClick={() => handleEditScholarship(scholarship)} className="text-blue-600 hover:text-blue-800 p-1">
                          <Edit2 size={16} />
                        </button>
                        <button onClick={() => handleDeleteScholarship(scholarship._id)} className="text-red-600 hover:text-red-800 p-1">
                          <XCircle size={16} />
                        </button>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{scholarship.description}</p>
                    <div className="text-sm space-y-1">
                      <div><span className="text-gray-500">Type:</span> <span className="font-medium">{scholarship.type}</span></div>
                      <div><span className="text-gray-500">Amount:</span> <span className="font-medium text-green-600">₹{scholarship.amount.toLocaleString()} ({scholarship.amountType})</span></div>
                      <div><span className="text-gray-500">Year:</span> <span className="font-medium">{scholarship.academicYear}</span></div>
                      <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium mt-2 ${scholarship.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                        {scholarship.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {analytics && analytics.total > 0 && (
            <div className="overflow-x-auto mb-6" style={{scrollbarWidth: 'thin', scrollbarColor: '#9CA3AF #F3F4F6'}}>
              <div className="flex gap-4 lg:grid lg:grid-cols-4 lg:gap-6 pb-2">
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-lg p-4 sm:p-6 text-white min-w-[180px]">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-100 text-sm">Total Applications</p>
                    <p className="text-xl sm:text-3xl font-bold mt-1">{analytics.total}</p>
                  </div>
                  <Users size={40} className="opacity-80" />
                </div>
              </div>
              <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-lg shadow-lg p-4 sm:p-6 text-white min-w-[180px]">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-yellow-100 text-sm">Pending Review</p>
                    <p className="text-xl sm:text-3xl font-bold mt-1">{analytics.pending + analytics.verified}</p>
                  </div>
                  <TrendingUp size={40} className="opacity-80" />
                </div>
              </div>
              <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow-lg p-4 sm:p-6 text-white min-w-[180px]">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-100 text-sm">Approved</p>
                    <p className="text-xl sm:text-3xl font-bold mt-1">{analytics.approved}</p>
                  </div>
                  <Award size={40} className="opacity-80" />
                </div>
              </div>
              <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg shadow-lg p-4 sm:p-6 text-white min-w-[180px]">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-purple-100 text-sm">Total Distributed</p>
                    <p className="text-xl sm:text-3xl font-bold mt-1">₹{(analytics.totalAmount / 1000).toFixed(0)}K</p>
                  </div>
                  <DollarSign size={40} className="opacity-80" />
                </div>
              </div>
            </div>
            </div>
          )}

          {/* Search and Filter */}
          <div className="bg-white rounded-lg shadow-md p-4 mb-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input type="text" placeholder="Search by student name or roll number..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
              </div>
              <div className="flex items-center gap-2">
                <Filter size={20} className="text-gray-400" />
                <select value={filterType} onChange={(e) => setFilterType(e.target.value)} className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                  <option value="All">All Types</option>
                  <option value="Merit">Merit</option>
                  <option value="Government">Government</option>
                  <option value="Sports">Sports</option>
                  <option value="Minority">Minority</option>
                  <option value="Management">Management</option>
                </select>
              </div>
            </div>
          </div>

          {/* Applications Table */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div style={{overflowX: 'scroll', overflowY: 'scroll', maxHeight: '500px', WebkitOverflowScrolling: 'touch'}}>
              <div style={{minWidth: '1200px'}}>
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Student</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Scholarship</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Type</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Applied Date</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredScholarships.map((s) => (
                    <tr key={s._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div>
                          <div className="font-medium text-gray-900">{s.student?.name}</div>
                          <div className="text-sm text-gray-500">{s.student?.rollNumber} • {s.student?.class}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-900">{s.scholarship?.name}</div>
                        <div className="text-sm text-gray-500">{s.academicYear}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-3 py-1 bg-blue-100 text-blue-800 text-xs font-semibold rounded-full">{s.scholarship?.type}</span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">{new Date(s.appliedDate).toLocaleDateString()}</td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                          s.status === 'Approved' ? 'bg-green-100 text-green-800' :
                          s.status === 'Rejected' ? 'bg-red-100 text-red-800' :
                          s.status === 'Verified' ? 'bg-blue-100 text-blue-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {s.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          {(s.status === 'Pending' || s.status === 'Verified') && (
                            <>
                              <button onClick={() => handleApprove(s)} className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors" title="Approve">
                                <CheckCircle size={18} />
                              </button>
                              <button onClick={() => handleReject(s)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Reject">
                                <XCircle size={18} />
                              </button>
                            </>
                          )}
                          <button onClick={() => { setSelected(s); setShowDetailsModal(true); }} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="View">
                            <Eye size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              </div>
            </div>
            {filteredScholarships.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500">No scholarship applications found</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Approval/Rejection Modal */}
      {showModal && selected && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <h2 className="text-2xl font-bold mb-6 text-gray-900">{formData.status} Scholarship</h2>
            <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div><span className="text-gray-600">Student:</span> <span className="font-semibold">{selected.student?.name}</span></div>
                <div><span className="text-gray-600">Scholarship:</span> <span className="font-semibold">{selected.scholarship?.name}</span></div>
                <div><span className="text-gray-600">Type:</span> <span className="font-semibold">{selected.scholarship?.type}</span></div>
                <div><span className="text-gray-600">Applied:</span> <span className="font-semibold">{new Date(selected.appliedDate).toLocaleDateString()}</span></div>
              </div>
              {selected.reason && (
                <div className="mt-3 pt-3 border-t">
                  <p className="text-xs text-gray-600 mb-1">Reason for Application:</p>
                  <p className="text-sm text-gray-800">{selected.reason}</p>
                </div>
              )}
              {selected.familyIncome && (
                <div className="mt-2">
                  <p className="text-xs text-gray-600">Family Income: <span className="font-semibold">₹{selected.familyIncome.toLocaleString()}</span></p>
                </div>
              )}
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              {formData.status === 'Approved' && (
                <>
                  <div>
                    <label className="block text-sm font-semibold mb-2 text-gray-700">Amount Type *</label>
                    <select value={formData.amountType} onChange={(e) => setFormData({ ...formData, amountType: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" required>
                      <option value="Fixed">Fixed Amount (₹)</option>
                      <option value="Percentage">Percentage (%)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2 text-gray-700">{formData.amountType === 'Fixed' ? 'Amount (₹) *' : 'Percentage (%) *'}</label>
                    <input type="number" value={formData.amount} onChange={(e) => setFormData({ ...formData, amount: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder={formData.amountType === 'Fixed' ? 'e.g., 10000' : 'e.g., 20'} required />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold mb-2 text-gray-700">Valid From *</label>
                      <input type="date" value={formData.validFrom} onChange={(e) => setFormData({ ...formData, validFrom: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" required />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold mb-2 text-gray-700">Valid To *</label>
                      <input type="date" value={formData.validTo} onChange={(e) => setFormData({ ...formData, validTo: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" required />
                    </div>
                  </div>
                </>
              )}
              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-700">Admin Remarks *</label>
                <textarea value={formData.remarks} onChange={(e) => setFormData({ ...formData, remarks: e.target.value })} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" rows="4" placeholder="Add your decision remarks..." required />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium transition-colors">Cancel</button>
                <button type="submit" className={`flex-1 px-4 py-3 text-white rounded-lg font-medium shadow-md transition-colors ${formData.status === 'Approved' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}`}>
                  Confirm {formData.status}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create/Edit Scholarship Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <h2 className="text-2xl font-bold mb-6 text-gray-900">{editMode ? 'Edit' : 'Add'} Scholarship</h2>
            <form onSubmit={handleScholarshipSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-700">Scholarship Name *</label>
                <input type="text" value={scholarshipForm.name} onChange={(e) => setScholarshipForm({...scholarshipForm, name: e.target.value})} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" required />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-700">Description</label>
                <textarea value={scholarshipForm.description} onChange={(e) => setScholarshipForm({...scholarshipForm, description: e.target.value})} rows="3" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-700">Type *</label>
                  <select value={scholarshipForm.type} onChange={(e) => setScholarshipForm({...scholarshipForm, type: e.target.value})} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                    <option value="Merit">Merit</option>
                    <option value="Government">Government</option>
                    <option value="Sports">Sports</option>
                    <option value="Minority">Minority</option>
                    <option value="Management">Management</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-700">Status *</label>
                  <select value={scholarshipForm.status} onChange={(e) => setScholarshipForm({...scholarshipForm, status: e.target.value})} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                    <option value="Active">Active</option>
                    <option value="Closed">Closed</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-700">Amount *</label>
                  <input type="number" value={scholarshipForm.amount} onChange={(e) => setScholarshipForm({...scholarshipForm, amount: e.target.value})} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" required />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-700">Amount Type *</label>
                  <select value={scholarshipForm.amountType} onChange={(e) => setScholarshipForm({...scholarshipForm, amountType: e.target.value})} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                    <option value="Fixed">Fixed Amount</option>
                    <option value="Percentage">Percentage</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-700">Academic Year *</label>
                  <input type="text" value={scholarshipForm.academicYear} onChange={(e) => setScholarshipForm({...scholarshipForm, academicYear: e.target.value})} placeholder="2024-2025" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" required />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-700">Deadline</label>
                  <input type="date" value={scholarshipForm.deadline} onChange={(e) => setScholarshipForm({...scholarshipForm, deadline: e.target.value})} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={resetScholarshipForm} className="flex-1 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium transition-colors">Cancel</button>
                <button type="submit" className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors">
                  {editMode ? 'Update' : 'Create'} Scholarship
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminScholarship;
