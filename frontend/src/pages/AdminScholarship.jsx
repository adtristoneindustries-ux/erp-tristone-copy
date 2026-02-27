import { useState, useEffect } from 'react';
import { CheckCircle, XCircle, TrendingUp, DollarSign, Users, Award, Search, Filter, Eye } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import api from '../services/api';

const AdminScholarship = () => {
  const [scholarships, setScholarships] = useState([]);
  const [filteredScholarships, setFilteredScholarships] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selected, setSelected] = useState(null);
  const [formData, setFormData] = useState({ status: 'Approved', amount: '', amountType: 'Fixed', validFrom: '', validTo: '', remarks: '' });
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('All');

  useEffect(() => {
    fetchScholarships();
    fetchAnalytics();
  }, []);

  useEffect(() => {
    filterData();
  }, [scholarships, searchTerm, filterType]);

  const fetchScholarships = async () => {
    try {
      const res = await api.get('/scholarships?status=Verified');
      setScholarships(res.data.data);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchAnalytics = async () => {
    try {
      const res = await api.get('/scholarships/analytics');
      setAnalytics(res.data.data);
    } catch (error) {
      console.error(error);
    }
  };

  const filterData = () => {
    let filtered = scholarships;
    if (searchTerm) {
      filtered = filtered.filter(s => 
        s.student?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.student?.rollNumber.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    if (filterType !== 'All') {
      filtered = filtered.filter(s => s.scholarshipType === filterType);
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
      await api.put(`/scholarships/${selected._id}/approve`, formData);
      alert(`✅ Scholarship ${formData.status.toLowerCase()} successfully!`);
      setShowModal(false);
      fetchScholarships();
      fetchAnalytics();
    } catch (error) {
      alert('❌ Error: ' + error.response?.data?.message);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 lg:ml-64">
        <Navbar />
        <div className="p-4 lg:p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Scholarship Management</h1>
            <p className="text-sm text-gray-600 mt-1">Review verified applications and make final decisions</p>
          </div>

          {analytics && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-lg p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-100 text-sm">Total Applications</p>
                    <p className="text-3xl font-bold mt-1">{analytics.total}</p>
                  </div>
                  <Users size={40} className="opacity-80" />
                </div>
              </div>
              <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-lg shadow-lg p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-yellow-100 text-sm">Pending Review</p>
                    <p className="text-3xl font-bold mt-1">{analytics.pending + analytics.verified}</p>
                  </div>
                  <TrendingUp size={40} className="opacity-80" />
                </div>
              </div>
              <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow-lg p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-100 text-sm">Approved</p>
                    <p className="text-3xl font-bold mt-1">{analytics.approved}</p>
                  </div>
                  <Award size={40} className="opacity-80" />
                </div>
              </div>
              <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg shadow-lg p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-purple-100 text-sm">Total Distributed</p>
                    <p className="text-3xl font-bold mt-1">₹{(analytics.totalAmount / 1000).toFixed(0)}K</p>
                  </div>
                  <DollarSign size={40} className="opacity-80" />
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
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Student</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Type</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Year</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Eligibility</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Staff Remarks</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredScholarships.map((s) => (
                    <tr key={s._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div>
                          <div className="font-medium text-gray-900">{s.student?.name}</div>
                          <div className="text-sm text-gray-500">{s.student?.class}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-3 py-1 bg-blue-100 text-blue-800 text-xs font-semibold rounded-full">{s.scholarshipType}</span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">{s.academicYear}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-20 bg-gray-200 rounded-full h-2.5">
                            <div className={`h-2.5 rounded-full ${s.autoEligible ? 'bg-green-500' : 'bg-yellow-500'}`} style={{ width: `${s.eligibilityScore}%` }}></div>
                          </div>
                          <span className="text-sm font-semibold">{s.eligibilityScore}%</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 max-w-xs truncate">{s.staffRemarks}</td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <button onClick={() => handleApprove(s)} className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors" title="Approve">
                            <CheckCircle size={18} />
                          </button>
                          <button onClick={() => handleReject(s)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Reject">
                            <XCircle size={18} />
                          </button>
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
            {filteredScholarships.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500">No verified applications pending approval</p>
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
                <div><span className="text-gray-600">Type:</span> <span className="font-semibold">{selected.scholarshipType}</span></div>
                <div><span className="text-gray-600">Eligibility:</span> <span className="font-semibold">{selected.eligibilityScore}%</span></div>
                <div><span className="text-gray-600">Staff Verified:</span> <span className="font-semibold">✅</span></div>
              </div>
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
    </div>
  );
};

export default AdminScholarship;
