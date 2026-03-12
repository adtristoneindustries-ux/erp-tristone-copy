import { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Eye, Search, Filter, TrendingUp, Users, Clock } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import api from '../services/api';

const StaffScholarship = () => {
  const [scholarships, setScholarships] = useState([]);
  const [filteredScholarships, setFilteredScholarships] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selected, setSelected] = useState(null);
  const [remarks, setRemarks] = useState('');
  const [action, setAction] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');

  useEffect(() => {
    fetchScholarships();
  }, []);

  useEffect(() => {
    filterData();
  }, [scholarships, searchTerm, filterStatus]);

  const fetchScholarships = async () => {
    try {
      const res = await api.get('/scholarships');
      setScholarships(res.data.data || []);
    } catch (error) {
      console.error(error);
      setScholarships([]);
    }
  };

  const filterData = () => {
    let filtered = scholarships || [];
    if (searchTerm) {
      filtered = filtered.filter(s => 
        s.student?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.student?.rollNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.scholarshipType.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    if (filterStatus !== 'All') {
      filtered = filtered.filter(s => s.status === filterStatus);
    }
    setFilteredScholarships(filtered);
  };

  const handleVerify = (scholarship, status) => {
    setSelected(scholarship);
    setAction(status);
    setRemarks('');
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/scholarships/${selected._id}/verify`, { status: action, remarks });
      alert(`✅ Scholarship ${action.toLowerCase()} successfully!`);
      setShowModal(false);
      setRemarks('');
      fetchScholarships();
    } catch (error) {
      alert('❌ Error: ' + error.response?.data?.message);
    }
  };

  const getStatusColor = (status) => {
    const colors = { Pending: 'bg-yellow-100 text-yellow-800', Verified: 'bg-blue-100 text-blue-800', Approved: 'bg-green-100 text-green-800', Rejected: 'bg-red-100 text-red-800' };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const stats = {
    total: scholarships?.length || 0,
    pending: scholarships?.filter(s => s.status === 'Pending').length || 0,
    verified: scholarships?.filter(s => s.status === 'Verified').length || 0,
    rejected: scholarships?.filter(s => s.status === 'Rejected').length || 0
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 lg:ml-64">
        <Navbar />
        <div className="p-4 sm:p-6">
          <div className="mb-4 sm:mb-6">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Scholarship Verification</h1>
            <p className="text-xs sm:text-sm text-gray-600 mt-1">Review and verify student scholarship applications</p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-6">
            <div className="bg-white rounded-lg shadow-md p-3 sm:p-4 border-l-4 border-blue-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm text-gray-600">Total</p>
                  <p className="text-xl sm:text-2xl font-bold text-gray-900">{stats.total}</p>
                </div>
                <Users className="text-blue-500" size={24} />
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-md p-3 sm:p-4 border-l-4 border-yellow-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm text-gray-600">Pending</p>
                  <p className="text-xl sm:text-2xl font-bold text-gray-900">{stats.pending}</p>
                </div>
                <Clock className="text-yellow-500" size={24} />
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-md p-3 sm:p-4 border-l-4 border-green-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm text-gray-600">Verified</p>
                  <p className="text-xl sm:text-2xl font-bold text-gray-900">{stats.verified}</p>
                </div>
                <CheckCircle className="text-green-500" size={24} />
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-md p-3 sm:p-4 border-l-4 border-red-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm text-gray-600">Rejected</p>
                  <p className="text-xl sm:text-2xl font-bold text-gray-900">{stats.rejected}</p>
                </div>
                <XCircle className="text-red-500" size={24} />
              </div>
            </div>
          </div>

          {/* Search and Filter */}
          <div className="bg-white rounded-lg shadow-md p-3 sm:p-4 mb-4 sm:mb-6">
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  placeholder="Search student, roll no, type..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div className="flex items-center gap-2">
                <Filter size={18} className="text-gray-400" />
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-3 sm:px-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="All">All Status</option>
                  <option value="Pending">Pending</option>
                  <option value="Verified">Verified</option>
                  <option value="Rejected">Rejected</option>
                </select>
              </div>
            </div>
          </div>

          {/* Desktop Table View */}
          <div className="hidden md:block bg-white rounded-lg shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Student</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Type</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Year</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Applied</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Eligibility</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredScholarships.map((s) => (
                    <tr key={s._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3">
                        <div>
                          <div className="font-medium text-sm text-gray-900">{s.student?.name}</div>
                          <div className="text-xs text-gray-500">{s.student?.rollNumber}</div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">{s.scholarshipType}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{s.academicYear}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{new Date(s.applicationDate).toLocaleDateString()}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-16 bg-gray-200 rounded-full h-2">
                            <div className={`h-2 rounded-full ${s.autoEligible ? 'bg-green-500' : 'bg-yellow-500'}`} style={{ width: `${s.eligibilityScore}%` }}></div>
                          </div>
                          <span className="text-xs font-semibold">{s.eligibilityScore}%</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(s.status)}`}>{s.status}</span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          {s.status === 'Pending' && (
                            <>
                              <button onClick={() => handleVerify(s, 'Verified')} className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors" title="Verify">
                                <CheckCircle size={18} />
                              </button>
                              <button onClick={() => handleVerify(s, 'Rejected')} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Reject">
                                <XCircle size={18} />
                              </button>
                            </>
                          )}
                          <button onClick={() => { setSelected(s); setAction('view'); setShowModal(true); }} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="View">
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
                <p className="text-gray-500">No applications found</p>
              </div>
            )}
          </div>

          {/* Mobile Card View */}
          <div className="md:hidden space-y-3">
            {filteredScholarships.length === 0 ? (
              <div className="bg-white rounded-lg shadow-md p-8 text-center">
                <p className="text-gray-500">No applications found</p>
              </div>
            ) : (
              filteredScholarships.map((s) => (
                <div key={s._id} className="bg-white rounded-lg shadow-md p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-semibold text-sm text-gray-900">{s.student?.name}</h3>
                      <p className="text-xs text-gray-500">{s.student?.rollNumber}</p>
                    </div>
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(s.status)}`}>{s.status}</span>
                  </div>
                  
                  <div className="space-y-2 text-xs mb-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Type:</span>
                      <span className="font-medium">{s.scholarshipType}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Year:</span>
                      <span className="font-medium">{s.academicYear}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Applied:</span>
                      <span className="font-medium">{new Date(s.applicationDate).toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Eligibility:</span>
                      <div className="flex items-center gap-2">
                        <div className="w-16 bg-gray-200 rounded-full h-2">
                          <div className={`h-2 rounded-full ${s.autoEligible ? 'bg-green-500' : 'bg-yellow-500'}`} style={{ width: `${s.eligibilityScore}%` }}></div>
                        </div>
                        <span className="font-semibold">{s.eligibilityScore}%</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-3 border-t">
                    {s.status === 'Pending' && (
                      <>
                        <button onClick={() => handleVerify(s, 'Verified')} className="flex-1 py-2 text-green-600 bg-green-50 hover:bg-green-100 rounded-lg transition-colors flex items-center justify-center gap-1 text-sm font-medium">
                          <CheckCircle size={16} /> Verify
                        </button>
                        <button onClick={() => handleVerify(s, 'Rejected')} className="flex-1 py-2 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors flex items-center justify-center gap-1 text-sm font-medium">
                          <XCircle size={16} /> Reject
                        </button>
                      </>
                    )}
                    <button onClick={() => { setSelected(s); setAction('view'); setShowModal(true); }} className={`${s.status === 'Pending' ? 'flex-none px-4' : 'flex-1'} py-2 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors flex items-center justify-center gap-1 text-sm font-medium`}>
                      <Eye size={16} /> View
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-4 sm:p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 text-gray-900">{action === 'view' ? 'Application Details' : `${action} Application`}</h2>
            {selected && (
              <div className="space-y-4 sm:space-y-6">
                {/* Student Info */}
                <div className="bg-gray-50 rounded-lg p-3 sm:p-4">
                  <h3 className="font-semibold text-sm sm:text-base text-gray-900 mb-3">Student Information</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-xs sm:text-sm">
                    <div><span className="text-gray-600">Name:</span> <span className="font-medium">{selected.student?.name}</span></div>
                    <div><span className="text-gray-600">Roll Number:</span> <span className="font-medium">{selected.student?.rollNumber}</span></div>
                    <div><span className="text-gray-600">Class:</span> <span className="font-medium">{selected.student?.class}</span></div>
                    <div><span className="text-gray-600">Type:</span> <span className="font-medium">{selected.scholarshipType}</span></div>
                    <div><span className="text-gray-600">Year:</span> <span className="font-medium">{selected.academicYear}</span></div>
                    <div><span className="text-gray-600">Income:</span> <span className="font-medium">₹{selected.familyIncome?.toLocaleString()}</span></div>
                  </div>
                </div>

                {/* Eligibility */}
                <div className="bg-blue-50 rounded-lg p-3 sm:p-4 border border-blue-200">
                  <h3 className="font-semibold text-sm sm:text-base text-blue-900 mb-3">Eligibility Assessment</h3>
                  <div className="flex items-center gap-3 sm:gap-4">
                    <div className="flex-1 bg-white rounded-full h-3 sm:h-4 overflow-hidden">
                      <div className={`h-3 sm:h-4 ${selected.autoEligible ? 'bg-green-500' : 'bg-yellow-500'}`} style={{ width: `${selected.eligibilityScore}%` }}></div>
                    </div>
                    <span className="font-bold text-base sm:text-lg">{selected.eligibilityScore}%</span>
                    <span className="text-xl sm:text-2xl">{selected.autoEligible ? '✅' : '⚠️'}</span>
                  </div>
                  <p className="text-xs text-blue-700 mt-2">Based on marks (70%) and attendance (30%)</p>
                </div>

                {/* Reason */}
                <div>
                  <h3 className="font-semibold text-sm sm:text-base text-gray-900 mb-2">Application Reason:</h3>
                  <p className="text-xs sm:text-sm text-gray-600 bg-gray-50 p-3 sm:p-4 rounded-lg border border-gray-200">{selected.reason}</p>
                </div>

                {/* Form for Verify/Reject */}
                {action !== 'view' && (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold mb-2 text-gray-700">Verification Remarks *</label>
                      <textarea value={remarks} onChange={(e) => setRemarks(e.target.value)} className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" rows="4" placeholder="Add your verification comments..." required />
                    </div>
                    <div className="flex flex-col sm:flex-row gap-3">
                      <button type="button" onClick={() => setShowModal(false)} className="flex-1 px-4 py-2 sm:py-3 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium transition-colors text-sm">Cancel</button>
                      <button type="submit" className={`flex-1 px-4 py-2 sm:py-3 text-white rounded-lg font-medium shadow-md transition-colors text-sm ${action === 'Verified' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}`}>
                        Confirm {action}
                      </button>
                    </div>
                  </form>
                )}
                {action === 'view' && <button onClick={() => setShowModal(false)} className="w-full px-4 py-2 sm:py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 font-medium transition-colors text-sm">Close</button>}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default StaffScholarship;
