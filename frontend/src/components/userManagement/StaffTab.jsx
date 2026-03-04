import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { Edit, Trash2, Plus, Search, Eye, X, Upload, FileText, Image } from 'lucide-react';
import StaffDetailsModal from '../StaffDetailsModal';
import { SocketContext } from '../../context/SocketContext';
import { userAPI } from '../../services/api';
import { useAlert } from '../../hooks/useAlert';

const StaffTab = () => {
  const navigate = useNavigate();
  const { showSuccess, showError } = useAlert();
  const socket = useContext(SocketContext);
  const [staff, setStaff] = useState([]);
  const [filteredStaff, setFilteredStaff] = useState([]);
  const [isStaffDetailsModalOpen, setIsStaffDetailsModalOpen] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDepartment, setFilterDepartment] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 10;

  const departments = ['Maths', 'English', 'Science', 'Computer Science', 'Office', 'Transport', 'Library', 'Sports'];
  const statuses = ['Active', 'Inactive', 'On Leave'];

  useEffect(() => {
    fetchStaff();
  }, []);
  
  useEffect(() => {
    if (socket) {
      socket.on('staffUpdate', (data) => {
        if (data.deleted) {
          setStaff(prev => prev.filter(s => s._id !== data.staffId));
        } else {
          setStaff(prev => {
            const exists = prev.find(s => s._id === data.staffId);
            if (exists) {
              return prev.map(s => s._id === data.staffId ? data.updatedData : s);
            } else {
              return [...prev, data.updatedData];
            }
          });
        }
      });
      return () => socket.off('staffUpdate');
    }
  }, [socket]);

  useEffect(() => {
    filterStaffData();
  }, [staff, searchTerm, filterDepartment, filterStatus]);

  const fetchStaff = async () => {
    try {
      const res = await userAPI.getUsers({ role: 'staff' });
      setStaff(res.data);
    } catch (error) {
      showError('Failed to fetch staff');
    }
  };

  const filterStaffData = () => {
    let filtered = staff.filter(s => {
      const matchSearch = s.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         s.staffId?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchDept = !filterDepartment || s.department === filterDepartment;
      const matchStatus = !filterStatus || s.status === filterStatus;
      return matchSearch && matchDept && matchStatus;
    });
    setFilteredStaff(filtered);
    setCurrentPage(1);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to deactivate this staff member?')) return;
    try {
      const staffMember = staff.find(s => s._id === id);
      await userAPI.updateUser(id, { ...staffMember, status: 'Inactive' });
      showSuccess('Staff deactivated successfully');
      fetchStaff();
    } catch (error) {
      showError('Failed to deactivate staff');
    }
  };

  const openStaffDetailsModal = (staffMember) => {
    setSelectedStaff(staffMember);
    setIsStaffDetailsModalOpen(true);
  };

  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentRecords = filteredStaff.slice(indexOfFirstRecord, indexOfLastRecord);
  const totalPages = Math.ceil(filteredStaff.length / recordsPerPage);

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 gap-4">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Staff Management</h2>
          <p className="text-gray-600 mt-1 text-sm">Manage teaching and non-teaching staff</p>
        </div>
        <button
          onClick={() => navigate('/admin/staff/add')}
          className="bg-blue-500 text-white px-4 sm:px-6 py-3 min-h-[48px] rounded-lg flex items-center justify-center gap-2 hover:bg-blue-600 active:bg-blue-700 transition-colors w-full sm:w-auto text-base font-medium shadow-sm"
        >
          <Plus size={20} /> Add Staff
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search by name or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 min-h-[48px] text-base border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <select
            value={filterDepartment}
            onChange={(e) => setFilterDepartment(e.target.value)}
            className="px-4 py-3 min-h-[48px] text-base border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
          >
            <option value="">All Departments</option>
            {departments.map(dept => <option key={dept} value={dept}>{dept}</option>)}
          </select>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-3 min-h-[48px] text-base border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
          >
            <option value="">All Status</option>
            {statuses.map(status => <option key={status} value={status}>{status}</option>)}
          </select>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {/* Mobile Card View */}
        <div className="block lg:hidden">
          {currentRecords.length === 0 ? (
            <div className="text-center py-8 text-gray-500">No staff members found</div>
          ) : (
            <div className="divide-y divide-gray-200">
              {currentRecords.map((staffMember) => (
                <div key={staffMember._id} className="p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 
                        className="font-semibold text-gray-900 text-base cursor-pointer hover:text-blue-600 transition-colors"
                        onClick={() => openStaffDetailsModal(staffMember)}
                      >
                        {staffMember.name}
                      </h3>
                      <p className="text-sm text-gray-600">{staffMember.email}</p>
                      <p className="text-sm text-gray-500">{staffMember.staffId || 'N/A'}</p>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      staffMember.status === 'Active' ? 'bg-green-100 text-green-800' :
                      staffMember.status === 'On Leave' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {staffMember.status || 'Active'}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm text-gray-600 mb-3">
                    <div><span className="font-medium">Phone:</span> {staffMember.phone || 'N/A'}</div>
                    <div><span className="font-medium">Role:</span> {staffMember.role || 'N/A'}</div>
                    <div className="col-span-2"><span className="font-medium">Department:</span> {staffMember.department || 'N/A'}</div>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => navigate('/admin/staff', { state: { viewStaff: staffMember } })} 
                      className="flex-1 text-green-600 bg-green-50 hover:bg-green-100 py-2 px-3 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-1"
                    >
                      <Eye size={16} /> View
                    </button>
                    <button 
                      onClick={() => navigate(`/admin/staff/edit/${staffMember._id}`)} 
                      className="flex-1 text-blue-600 bg-blue-50 hover:bg-blue-100 py-2 px-3 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-1"
                    >
                      <Edit size={16} /> Edit
                    </button>
                    <button 
                      onClick={() => handleDelete(staffMember._id)} 
                      className="text-red-600 bg-red-50 hover:bg-red-100 py-2 px-3 rounded-lg text-sm font-medium transition-colors flex items-center justify-center"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Desktop Table View */}
        <div className="hidden lg:block overflow-x-auto">
          <table className="w-full min-w-[900px]">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Staff ID</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {currentRecords.map((staffMember) => (
                <tr key={staffMember._id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 text-sm text-gray-900">{staffMember.staffId || 'N/A'}</td>
                  <td className="px-4 py-3 text-sm font-medium">
                    <button 
                      onClick={() => openStaffDetailsModal(staffMember)}
                      className="text-gray-900 hover:text-blue-600 transition-colors font-medium"
                    >
                      {staffMember.name}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">{staffMember.email}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{staffMember.phone || 'N/A'}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{staffMember.role || 'N/A'}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{staffMember.department || 'N/A'}</td>
                  <td className="px-4 py-3 text-sm">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      staffMember.status === 'Active' ? 'bg-green-100 text-green-800' :
                      staffMember.status === 'On Leave' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {staffMember.status || 'Active'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <div className="flex gap-2">
                      <button 
                        onClick={() => navigate('/admin/staff', { state: { viewStaff: staffMember } })} 
                        className="text-green-500 hover:text-green-700 p-2 min-w-[44px] min-h-[44px] rounded hover:bg-green-50 active:bg-green-100 transition-colors flex items-center justify-center"
                        aria-label="View staff"
                      >
                        <Eye size={18} />
                      </button>
                      <button 
                        onClick={() => navigate('/admin/staff', { state: { editStaff: staffMember } })} 
                        className="text-blue-500 hover:text-blue-700 p-2 min-w-[44px] min-h-[44px] rounded hover:bg-blue-50 active:bg-blue-100 transition-colors flex items-center justify-center"
                        aria-label="Edit staff"
                      >
                        <Edit size={18} />
                      </button>
                      <button 
                        onClick={() => handleDelete(staffMember._id)} 
                        className="text-red-500 hover:text-red-700 p-2 min-w-[44px] min-h-[44px] rounded hover:bg-red-50 active:bg-red-100 transition-colors flex items-center justify-center"
                        aria-label="Delete staff"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {currentRecords.length === 0 && (
            <div className="text-center py-8 text-gray-500">No staff members found</div>
          )}
        </div>
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center mt-6 gap-2 flex-wrap px-4">
          <button
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className="px-3 py-2 min-w-[44px] min-h-[44px] rounded transition-colors bg-gray-200 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            ‹
          </button>
          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            let page;
            if (totalPages <= 5) {
              page = i + 1;
            } else if (currentPage <= 3) {
              page = i + 1;
            } else if (currentPage >= totalPages - 2) {
              page = totalPages - 4 + i;
            } else {
              page = currentPage - 2 + i;
            }
            return (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`px-3 py-2 min-w-[44px] min-h-[44px] rounded transition-colors text-sm font-medium ${
                  currentPage === page 
                    ? 'bg-blue-500 text-white shadow-sm' 
                    : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                }`}
              >
                {page}
              </button>
            );
          })}
          <button
            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
            className="px-3 py-2 min-w-[44px] min-h-[44px] rounded transition-colors bg-gray-200 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            ›
          </button>
        </div>
      )}

      {/* Staff Details Modal */}
      {isStaffDetailsModalOpen && selectedStaff && (
        <StaffDetailsModal
          isOpen={isStaffDetailsModalOpen}
          onClose={() => setIsStaffDetailsModalOpen(false)}
          staff={selectedStaff}
        />
      )}
    </div>
  );
};

export default StaffTab;
