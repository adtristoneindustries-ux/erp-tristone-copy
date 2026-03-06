import { useState, useEffect, useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Edit, Trash2, Plus, Search, Eye, X, Upload, FileText, Image } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import StaffDetailsModal from '../components/StaffDetailsModal';
import { SocketContext } from '../context/SocketContext';
import { userAPI } from '../services/api';
import { useAlert } from '../hooks/useAlert';

const AdminStaff = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { showSuccess, showError } = useAlert();
  const socket = useContext(SocketContext);
  const [staff, setStaff] = useState([]);
  const [filteredStaff, setFilteredStaff] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isStaffDetailsModalOpen, setIsStaffDetailsModalOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState(null);
  const [viewingStaff, setViewingStaff] = useState(null);
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDepartment, setFilterDepartment] = useState('');
  const [filterRole, setFilterRole] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [activeTab, setActiveTab] = useState('personal');
  const recordsPerPage = 10;

  const [formData, setFormData] = useState({
    name: '', email: '', password: '', phone: '', gender: '', dob: '',
    role: 'Teacher', department: '', staffId: '', joiningDate: '', qualification: '',
    address: '', loginAccess: true, permissionLevel: 'Staff', status: 'Active',
    panNumber: '', maritalStatus: '', designation: '', employmentType: '',
    yearsOfExperience: '', previousInstitution: '', specialization: '',
    basicSalary: '', pfNumber: '', esiNumber: '', uanNumber: ''
  });

  const [errors, setErrors] = useState({});
  const [passportPhoto, setPassportPhoto] = useState(null);
  const [passportPhotoPreview, setPassportPhotoPreview] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [dragActive, setDragActive] = useState(false);
  const [collapsedSections, setCollapsedSections] = useState({
    basic: false,
    photo: false,
    documents: false,
    additional: false
  });
  const [documentViewerOpen, setDocumentViewerOpen] = useState(false);
  const [viewingDocument, setViewingDocument] = useState(null);

  const departments = ['Maths', 'English', 'Science', 'Computer Science', 'Office', 'Transport', 'Library', 'Sports', 'Cafeteria'];
  const roles = ['Teacher', 'Accountant', 'Librarian', 'Admin Staff', 'Principal', 'Transport Staff'];
  const statuses = ['Active', 'Inactive', 'On Leave'];
  const permissionLevels = ['Admin', 'Staff', 'ReadOnly'];

  useEffect(() => {
    fetchStaff();
    
    // Handle view staff from navigation state
    if (location.state?.viewStaff) {
      openViewModal(location.state.viewStaff);
      // Clear the state
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, []);
  
  useEffect(() => {
    if (socket) {
      console.log('Socket connected in AdminStaff');
      
      socket.on('staffUpdate', (data) => {
        console.log('Staff update received:', data);
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
      
      return () => {
        socket.off('staffUpdate');
      };
    }
  }, [socket]);

  useEffect(() => {
    filterStaffData();
  }, [staff, searchTerm, filterDepartment, filterRole, filterStatus]);

  const fetchStaff = async () => {
    try {
      const res = await userAPI.getUsers();
      const allUsers = res.data.data || res.data || [];
      // Filter to show both staff and librarian roles
      const staffData = allUsers.filter(u => u.role === 'staff' || u.role === 'librarian');
      setStaff(staffData);
    } catch (error) {
      showError('Failed to fetch staff');
    }
  };

  const filterStaffData = () => {
    if (!Array.isArray(staff)) {
      setFilteredStaff([]);
      return;
    }
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

  const generateStaffId = () => {
    const year = new Date().getFullYear();
    const count = staff.length + 1;
    return `ST-${year}-${String(count).padStart(3, '0')}`;
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name) newErrors.name = 'Name is required';
    if (!formData.email) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Invalid email format';
    if (!editingStaff && !formData.password) newErrors.password = 'Password is required';
    else if (!editingStaff && formData.password.length < 6) newErrors.password = 'Password must be at least 6 characters';
    if (!formData.phone) newErrors.phone = 'Phone is required';
    else if (formData.phone.length < 10) newErrors.phone = 'Phone must be at least 10 digits';
    if (!formData.gender) newErrors.gender = 'Gender is required';
    if (!formData.role) newErrors.role = 'Role is required';
    if (!formData.department) newErrors.department = 'Department is required';
    if (!editingStaff && !formData.staffId) newErrors.staffId = 'Staff ID is required';
    else if (!editingStaff && formData.staffId && staff.some(s => s.staffId === formData.staffId)) {
      newErrors.staffId = 'Staff ID already exists';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePassportPhotoChange = (file) => {
    if (!file) return;
    
    // Validate file type
    if (!['image/jpeg', 'image/jpg', 'image/png'].includes(file.type)) {
      showError('Only PNG, JPG, JPEG files are allowed for passport photo');
      return;
    }
    
    // Validate file size (2MB)
    if (file.size > 2 * 1024 * 1024) {
      showError('Passport photo must be less than 2MB');
      return;
    }
    
    setPassportPhoto(file);
    
    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => setPassportPhotoPreview(e.target.result);
    reader.readAsDataURL(file);
  };

  const handleDocumentChange = (files, docType) => {
    const newDocs = [];
    
    for (let file of files) {
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
      if (!allowedTypes.includes(file.type)) {
        showError('Only PNG, JPG, JPEG, PDF files are allowed');
        continue;
      }
      
      // Validate file size
      const maxSize = file.type === 'application/pdf' ? 5 * 1024 * 1024 : 2 * 1024 * 1024;
      if (file.size > maxSize) {
        showError(`${file.type === 'application/pdf' ? 'PDF' : 'Image'} files must be less than ${file.type === 'application/pdf' ? '5MB' : '2MB'}`);
        continue;
      }
      
      newDocs.push({ file, type: docType, preview: null });
      
      // Create preview for images
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          setDocuments(prev => prev.map(doc => 
            doc.file === file ? { ...doc, preview: e.target.result } : doc
          ));
        };
        reader.readAsDataURL(file);
      }
    }
    
    setDocuments(prev => [...prev, ...newDocs]);
  };

  const removeDocument = (index) => {
    setDocuments(prev => prev.filter((_, i) => i !== index));
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragActive(false);
  };

  const handleDrop = (e, isPassport = false) => {
    e.preventDefault();
    setDragActive(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (isPassport && files.length > 0) {
      handlePassportPhotoChange(files[0]);
    } else if (!isPassport) {
      handleDocumentChange(files, 'other');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      if (editingStaff) {
        const submitData = { 
          ...formData, 
          role: 'staff',
          name: formData.name || formData.fullName
        };
        delete submitData.password;
        await userAPI.updateUser(editingStaff._id, submitData);
        
        // Emit socket event for real-time update
        if (socket) {
          socket.emit('staffUpdate', {
            staffId: editingStaff._id,
            updatedData: { ...editingStaff, ...submitData }
          });
        }
        
        showSuccess('Staff updated successfully');
      } else {
        const formDataToSend = new FormData();
        formDataToSend.append('userData', JSON.stringify({ ...formData, role: 'staff' }));
        
        if (passportPhoto) {
          formDataToSend.append('passportPhoto', passportPhoto);
        }
        
        const docTypes = [];
        documents.forEach((doc) => {
          formDataToSend.append('documents', doc.file);
          docTypes.push(doc.type);
        });
        
        if (docTypes.length > 0) {
          formDataToSend.append('docTypes', JSON.stringify(docTypes));
        }
        
        await userAPI.createStaffWithDocs(formDataToSend);
        showSuccess('Staff created successfully with documents');
      }
      
      await fetchStaff();
      closeModal();
    } catch (error) {
      showError(error.response?.data?.message || 'Operation failed');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this staff member?')) return;
    try {
      await userAPI.deleteUser(id);
      setStaff(prev => prev.filter(s => s._id !== id));
      showSuccess('Staff deleted successfully');
      await fetchStaff();
    } catch (error) {
      showError('Failed to delete staff');
    }
  };

  const openEditModal = (staffMember) => {
    setEditingStaff(staffMember);
    setFormData({
      name: staffMember.name || staffMember.fullName || '',
      email: staffMember.email || '',
      password: '',
      phone: staffMember.phone || '',
      gender: staffMember.gender || '',
      dob: staffMember.dob || staffMember.dateOfBirth || '',
      role: staffMember.role || 'Teacher',
      department: staffMember.department || '',
      staffId: staffMember.staffId || '',
      joiningDate: staffMember.joiningDate || staffMember.dateOfJoining || '',
      qualification: staffMember.qualification || '',
      address: staffMember.address || staffMember.permanentAddress || '',
      loginAccess: staffMember.loginAccess !== undefined ? staffMember.loginAccess : true,
      permissionLevel: staffMember.permissionLevel || 'Staff',
      status: staffMember.status || staffMember.employeeStatus || 'Active',
      panNumber: staffMember.panNumber || '',
      maritalStatus: staffMember.maritalStatus || '',
      designation: staffMember.designation || '',
      employmentType: staffMember.employmentType || '',
      yearsOfExperience: staffMember.yearsOfExperience || '',
      previousInstitution: staffMember.previousInstitution || '',
      specialization: staffMember.specialization || '',
      basicSalary: staffMember.basicSalary || '',
      pfNumber: staffMember.pfNumber || '',
      esiNumber: staffMember.esiNumber || '',
      uanNumber: staffMember.uanNumber || '',
      bloodGroup: staffMember.bloodGroup || '',
      aadhaarNumber: staffMember.aadhaarNumber || '',
      nationality: staffMember.nationality || '',
      religion: staffMember.religion || '',
      casteCategory: staffMember.casteCategory || '',
      employeeCode: staffMember.employeeCode || '',
      allowances: staffMember.allowances || '',
      taxDeduction: staffMember.taxDeduction || '',
      salaryAccountNumber: staffMember.salaryAccountNumber || '',
      bankName: staffMember.bankName || '',
      ifscCode: staffMember.ifscCode || '',
      branchName: staffMember.branchName || '',
      alternateContact: staffMember.alternateContact || '',
      emergencyContactName: staffMember.emergencyContactName || '',
      emergencyContactNumber: staffMember.emergencyContactNumber || '',
      permanentAddress: staffMember.permanentAddress || '',
      currentAddress: staffMember.currentAddress || '',
      city: staffMember.city || '',
      state: staffMember.state || '',
      pincode: staffMember.pincode || '',
      country: staffMember.country || '',
      medicalConditions: staffMember.medicalConditions || '',
      healthInsurance: staffMember.healthInsurance || '',
      disability: staffMember.disability || false,
      disabilityDetails: staffMember.disabilityDetails || '',
      accommodationRequired: staffMember.accommodationRequired || false,
      accommodationRoomNumber: staffMember.accommodationRoomNumber || '',
      accommodationBlock: staffMember.accommodationBlock || '',
      accommodationWardenName: staffMember.accommodationWardenName || ''
    });
    setIsModalOpen(true);
  };

  const openViewModal = (staffMember) => {
    setViewingStaff(staffMember);
    setIsViewModalOpen(true);
    setActiveTab('personal');
  };

  const openStaffDetailsModal = (staffMember) => {
    setSelectedStaff(staffMember);
    setIsStaffDetailsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingStaff(null);
    setFormData({
      name: '', email: '', password: '', phone: '', gender: '', dob: '',
      role: 'Teacher', department: '', staffId: '', joiningDate: '', qualification: '',
      address: '', loginAccess: true, permissionLevel: 'Staff', status: 'Active',
      panNumber: '', maritalStatus: '', designation: '', employmentType: '',
      yearsOfExperience: '', previousInstitution: '', specialization: '',
      basicSalary: '', pfNumber: '', esiNumber: '', uanNumber: ''
    });
    setErrors({});
    setPassportPhoto(null);
    setPassportPhotoPreview(null);
    setDocuments([]);
    setCollapsedSections({ basic: false, photo: false, documents: false, additional: false });
  };

  const openDocumentViewer = (doc) => {
    setViewingDocument(doc);
    setDocumentViewerOpen(true);
  };



  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentRecords = filteredStaff.slice(indexOfFirstRecord, indexOfLastRecord);
  const totalPages = Math.ceil(filteredStaff.length / recordsPerPage);

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 lg:ml-64 transition-all duration-300">
        <Navbar />
        <div className="p-4 lg:p-6">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Staff Management</h1>
              <p className="text-gray-600 mt-1 text-sm sm:text-base">Manage teaching and non-teaching staff</p>
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
                          onClick={() => openViewModal(staffMember)} 
                          className="flex-1 text-green-600 bg-green-50 hover:bg-green-100 py-2 px-3 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-1"
                        >
                          <Eye size={16} /> View
                        </button>
                        <button 
                          onClick={() => openEditModal(staffMember)} 
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
                          onClick={() => openViewModal(staffMember)} 
                          className="text-green-500 hover:text-green-700 p-2 min-w-[44px] min-h-[44px] rounded hover:bg-green-50 active:bg-green-100 transition-colors flex items-center justify-center"
                          aria-label="View staff"
                        >
                          <Eye size={18} />
                        </button>
                        <button 
                          onClick={() => openEditModal(staffMember)} 
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

          {isModalOpen && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
              <div className="bg-white rounded-lg w-full max-w-4xl my-4 sm:my-8 max-h-[95vh] overflow-hidden">
                <div className="flex justify-between items-center p-4 sm:p-6 border-b bg-gray-50">
                  <h2 className="text-lg sm:text-xl font-bold text-gray-900">{editingStaff ? 'Edit Staff' : 'Add Staff'}</h2>
                  <button onClick={closeModal} className="text-gray-500 hover:text-gray-700 p-2 rounded-full hover:bg-gray-200 transition-all">
                    <X size={24} />
                  </button>
                </div>
                <form onSubmit={handleSubmit} className="p-4 sm:p-6 max-h-[calc(95vh-120px)] overflow-y-auto">
                  {/* Basic Details Section */}
                  <div className="mb-6">
                    <div 
                      className="flex items-center justify-between cursor-pointer mb-4 p-3 bg-gray-50 rounded-lg"
                      onClick={() => setCollapsedSections(prev => ({ ...prev, basic: !prev.basic }))}
                    >
                      <h3 className="text-lg font-semibold">Basic Details</h3>
                      <span className={`transform transition-transform ${collapsedSections.basic ? 'rotate-180' : ''}`}>▼</span>
                    </div>
                    {!collapsedSections.basic && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                        <div>
                          <label className="block text-sm font-medium mb-2 text-gray-700">Staff Name *</label>
                          <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="w-full px-4 py-3 min-h-[48px] text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Enter full name"
                          />
                          {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-2 text-gray-700">Email *</label>
                          <input
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            className="w-full px-4 py-3 min-h-[48px] text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Enter email address"
                          />
                          {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                        </div>
                        {!editingStaff && (
                          <div>
                            <label className="block text-sm font-medium mb-2 text-gray-700">Password *</label>
                            <input
                              type="password"
                              value={formData.password}
                              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                              className="w-full px-4 py-3 min-h-[48px] text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              placeholder="Enter password"
                            />
                            {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
                          </div>
                        )}
                        <div>
                          <label className="block text-sm font-medium mb-2 text-gray-700">Phone *</label>
                          <input
                            type="text"
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            className="w-full px-4 py-3 min-h-[48px] text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Enter phone number"
                          />
                          {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">Gender *</label>
                          <select
                            value={formData.gender}
                            onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                            className="w-full px-4 py-3 min-h-[48px] text-base border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="">Select Gender</option>
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                            <option value="Other">Other</option>
                          </select>
                          {errors.gender && <p className="text-red-500 text-xs mt-1">{errors.gender}</p>}
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">Date of Birth</label>
                          <input
                            type="date"
                            value={formData.dob}
                            onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                            className="w-full px-4 py-3 min-h-[48px] text-base border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">Staff Role *</label>
                          <select
                            value={formData.role}
                            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                            className="w-full px-4 py-3 min-h-[48px] text-base border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            {roles.map(role => <option key={role} value={role}>{role}</option>)}
                          </select>
                          {errors.role && <p className="text-red-500 text-xs mt-1">{errors.role}</p>}
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">Staff ID {!editingStaff && '*'}</label>
                          <input
                            type="text"
                            value={formData.staffId}
                            onChange={(e) => setFormData({ ...formData, staffId: e.target.value })}
                            className="w-full px-4 py-3 min-h-[48px] text-base border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                            placeholder="Enter staff ID"
                            disabled={editingStaff}
                          />
                          {errors.staffId && <p className="text-red-500 text-xs mt-1">{errors.staffId}</p>}
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">Department *</label>
                          <select
                            value={formData.department}
                            onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                            className="w-full px-4 py-3 min-h-[48px] text-base border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="">Select Department</option>
                            {departments.map(dept => <option key={dept} value={dept}>{dept}</option>)}
                          </select>
                          {errors.department && <p className="text-red-500 text-xs mt-1">{errors.department}</p>}
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">Joining Date</label>
                          <input
                            type="date"
                            value={formData.joiningDate}
                            onChange={(e) => setFormData({ ...formData, joiningDate: e.target.value })}
                            className="w-full px-4 py-3 min-h-[48px] text-base border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">Qualification</label>
                          <input
                            type="text"
                            value={formData.qualification}
                            onChange={(e) => setFormData({ ...formData, qualification: e.target.value })}
                            className="w-full px-4 py-3 min-h-[48px] text-base border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">Permission Level</label>
                          <select
                            value={formData.permissionLevel}
                            onChange={(e) => setFormData({ ...formData, permissionLevel: e.target.value })}
                            className="w-full px-4 py-3 min-h-[48px] text-base border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            {permissionLevels.map(level => <option key={level} value={level}>{level}</option>)}
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">Status</label>
                          <select
                            value={formData.status}
                            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                            className="w-full px-4 py-3 min-h-[48px] text-base border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            {statuses.map(status => <option key={status} value={status}>{status}</option>)}
                          </select>
                        </div>
                        <div className="col-span-2">
                          <label className="block text-sm font-medium mb-1">Address</label>
                          <textarea
                            value={formData.address}
                            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                            rows="3"
                            className="w-full px-4 py-3 min-h-[100px] text-base border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            checked={formData.loginAccess}
                            onChange={(e) => setFormData({ ...formData, loginAccess: e.target.checked })}
                            className="mr-2"
                          />
                          <label className="text-sm font-medium">Login Access</label>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Additional Details Section */}
                  <div className="mb-6">
                    <div 
                      className="flex items-center justify-between cursor-pointer mb-4 p-3 bg-gray-50 rounded-lg"
                      onClick={() => setCollapsedSections(prev => ({ ...prev, additional: !prev.additional }))}
                    >
                      <h3 className="text-lg font-semibold">Additional Details</h3>
                      <span className={`transform transition-transform ${collapsedSections.additional ? 'rotate-180' : ''}`}>▼</span>
                    </div>
                    {!collapsedSections.additional && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                        <div>
                          <label className="block text-sm font-medium mb-1">PAN Number</label>
                          <input
                            type="text"
                            value={formData.panNumber}
                            onChange={(e) => setFormData({ ...formData, panNumber: e.target.value })}
                            className="w-full px-4 py-3 min-h-[48px] text-base border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Enter PAN number"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">Marital Status</label>
                          <select
                            value={formData.maritalStatus}
                            onChange={(e) => setFormData({ ...formData, maritalStatus: e.target.value })}
                            className="w-full px-4 py-3 min-h-[48px] text-base border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="">Select Status</option>
                            <option value="Single">Single</option>
                            <option value="Married">Married</option>
                            <option value="Divorced">Divorced</option>
                            <option value="Widowed">Widowed</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">Designation</label>
                          <input
                            type="text"
                            value={formData.designation}
                            onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                            className="w-full px-4 py-3 min-h-[48px] text-base border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Enter designation"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">Employment Type</label>
                          <select
                            value={formData.employmentType}
                            onChange={(e) => setFormData({ ...formData, employmentType: e.target.value })}
                            className="w-full px-4 py-3 min-h-[48px] text-base border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="">Select Type</option>
                            <option value="Permanent">Permanent</option>
                            <option value="Contract">Contract</option>
                            <option value="Part-Time">Part-Time</option>
                            <option value="Temporary">Temporary</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">Years of Experience</label>
                          <input
                            type="number"
                            value={formData.yearsOfExperience}
                            onChange={(e) => setFormData({ ...formData, yearsOfExperience: e.target.value })}
                            className="w-full px-4 py-3 min-h-[48px] text-base border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Enter years"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">Previous Institution</label>
                          <input
                            type="text"
                            value={formData.previousInstitution}
                            onChange={(e) => setFormData({ ...formData, previousInstitution: e.target.value })}
                            className="w-full px-4 py-3 min-h-[48px] text-base border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Enter previous institution"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">Specialization</label>
                          <input
                            type="text"
                            value={formData.specialization}
                            onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                            className="w-full px-4 py-3 min-h-[48px] text-base border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Enter specialization"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">Basic Salary</label>
                          <input
                            type="number"
                            value={formData.basicSalary}
                            onChange={(e) => setFormData({ ...formData, basicSalary: e.target.value })}
                            className="w-full px-4 py-3 min-h-[48px] text-base border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Enter basic salary"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">PF Number</label>
                          <input
                            type="text"
                            value={formData.pfNumber}
                            onChange={(e) => setFormData({ ...formData, pfNumber: e.target.value })}
                            className="w-full px-4 py-3 min-h-[48px] text-base border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Enter PF number"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">ESI Number</label>
                          <input
                            type="text"
                            value={formData.esiNumber}
                            onChange={(e) => setFormData({ ...formData, esiNumber: e.target.value })}
                            className="w-full px-4 py-3 min-h-[48px] text-base border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Enter ESI number"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">UAN Number</label>
                          <input type="text" value={formData.uanNumber} onChange={(e) => setFormData({ ...formData, uanNumber: e.target.value })} className="w-full px-4 py-3 min-h-[48px] text-base border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Enter UAN number" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">Aadhaar Number</label>
                          <input type="text" value={formData.aadhaarNumber} onChange={(e) => setFormData({ ...formData, aadhaarNumber: e.target.value })} className="w-full px-4 py-3 min-h-[48px] text-base border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Enter Aadhaar" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">Blood Group</label>
                          <select value={formData.bloodGroup} onChange={(e) => setFormData({ ...formData, bloodGroup: e.target.value })} className="w-full px-4 py-3 min-h-[48px] text-base border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                            <option value="">Select</option><option value="A+">A+</option><option value="A-">A-</option><option value="B+">B+</option><option value="B-">B-</option><option value="AB+">AB+</option><option value="AB-">AB-</option><option value="O+">O+</option><option value="O-">O-</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">Nationality</label>
                          <input type="text" value={formData.nationality} onChange={(e) => setFormData({ ...formData, nationality: e.target.value })} className="w-full px-4 py-3 min-h-[48px] text-base border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Enter nationality" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">Religion</label>
                          <input type="text" value={formData.religion} onChange={(e) => setFormData({ ...formData, religion: e.target.value })} className="w-full px-4 py-3 min-h-[48px] text-base border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Enter religion" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">Caste Category</label>
                          <select value={formData.casteCategory} onChange={(e) => setFormData({ ...formData, casteCategory: e.target.value })} className="w-full px-4 py-3 min-h-[48px] text-base border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                            <option value="">Select</option><option value="General">General</option><option value="OBC">OBC</option><option value="SC">SC</option><option value="ST">ST</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">Employee Code</label>
                          <input type="text" value={formData.employeeCode} onChange={(e) => setFormData({ ...formData, employeeCode: e.target.value })} className="w-full px-4 py-3 min-h-[48px] text-base border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Enter code" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">Allowances</label>
                          <input type="number" value={formData.allowances} onChange={(e) => setFormData({ ...formData, allowances: e.target.value })} className="w-full px-4 py-3 min-h-[48px] text-base border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Enter allowances" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">Tax Deduction</label>
                          <input type="number" value={formData.taxDeduction} onChange={(e) => setFormData({ ...formData, taxDeduction: e.target.value })} className="w-full px-4 py-3 min-h-[48px] text-base border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Enter tax" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">Bank Name</label>
                          <input type="text" value={formData.bankName} onChange={(e) => setFormData({ ...formData, bankName: e.target.value })} className="w-full px-4 py-3 min-h-[48px] text-base border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Enter bank" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">Account Number</label>
                          <input type="text" value={formData.salaryAccountNumber} onChange={(e) => setFormData({ ...formData, salaryAccountNumber: e.target.value })} className="w-full px-4 py-3 min-h-[48px] text-base border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Enter account" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">IFSC Code</label>
                          <input type="text" value={formData.ifscCode} onChange={(e) => setFormData({ ...formData, ifscCode: e.target.value })} className="w-full px-4 py-3 min-h-[48px] text-base border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Enter IFSC" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">Branch Name</label>
                          <input type="text" value={formData.branchName} onChange={(e) => setFormData({ ...formData, branchName: e.target.value })} className="w-full px-4 py-3 min-h-[48px] text-base border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Enter branch" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">Alternate Contact</label>
                          <input type="text" value={formData.alternateContact} onChange={(e) => setFormData({ ...formData, alternateContact: e.target.value })} className="w-full px-4 py-3 min-h-[48px] text-base border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Enter contact" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">Emergency Contact Name</label>
                          <input type="text" value={formData.emergencyContactName} onChange={(e) => setFormData({ ...formData, emergencyContactName: e.target.value })} className="w-full px-4 py-3 min-h-[48px] text-base border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Enter name" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">Emergency Contact Number</label>
                          <input type="text" value={formData.emergencyContactNumber} onChange={(e) => setFormData({ ...formData, emergencyContactNumber: e.target.value })} className="w-full px-4 py-3 min-h-[48px] text-base border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Enter number" />
                        </div>
                        <div className="col-span-2">
                          <label className="block text-sm font-medium mb-1">Permanent Address</label>
                          <textarea value={formData.permanentAddress} onChange={(e) => setFormData({ ...formData, permanentAddress: e.target.value })} rows="2" className="w-full px-4 py-3 text-base border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Enter address" />
                        </div>
                        <div className="col-span-2">
                          <label className="block text-sm font-medium mb-1">Current Address</label>
                          <textarea value={formData.currentAddress} onChange={(e) => setFormData({ ...formData, currentAddress: e.target.value })} rows="2" className="w-full px-4 py-3 text-base border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Enter address" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">City</label>
                          <input type="text" value={formData.city} onChange={(e) => setFormData({ ...formData, city: e.target.value })} className="w-full px-4 py-3 min-h-[48px] text-base border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Enter city" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">State</label>
                          <input type="text" value={formData.state} onChange={(e) => setFormData({ ...formData, state: e.target.value })} className="w-full px-4 py-3 min-h-[48px] text-base border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Enter state" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">Pincode</label>
                          <input type="text" value={formData.pincode} onChange={(e) => setFormData({ ...formData, pincode: e.target.value })} className="w-full px-4 py-3 min-h-[48px] text-base border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Enter pincode" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">Country</label>
                          <input type="text" value={formData.country} onChange={(e) => setFormData({ ...formData, country: e.target.value })} className="w-full px-4 py-3 min-h-[48px] text-base border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Enter country" />
                        </div>
                        <div className="col-span-2">
                          <label className="block text-sm font-medium mb-1">Medical Conditions</label>
                          <textarea value={formData.medicalConditions} onChange={(e) => setFormData({ ...formData, medicalConditions: e.target.value })} rows="2" className="w-full px-4 py-3 text-base border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Enter conditions" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">Health Insurance</label>
                          <input type="text" value={formData.healthInsurance} onChange={(e) => setFormData({ ...formData, healthInsurance: e.target.value })} className="w-full px-4 py-3 min-h-[48px] text-base border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Enter insurance" />
                        </div>
                        <div>
                          <label className="flex items-center gap-2">
                            <input type="checkbox" checked={formData.disability} onChange={(e) => setFormData({ ...formData, disability: e.target.checked })} className="w-5 h-5" />
                            <span className="text-sm font-medium">Disability</span>
                          </label>
                        </div>
                        {formData.disability && (
                          <div className="col-span-2">
                            <label className="block text-sm font-medium mb-1">Disability Details</label>
                            <textarea value={formData.disabilityDetails} onChange={(e) => setFormData({ ...formData, disabilityDetails: e.target.value })} rows="2" className="w-full px-4 py-3 text-base border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Enter details" />
                          </div>
                        )}
                        <div>
                          <label className="flex items-center gap-2">
                            <input type="checkbox" checked={formData.accommodationRequired} onChange={(e) => setFormData({ ...formData, accommodationRequired: e.target.checked })} className="w-5 h-5" />
                            <span className="text-sm font-medium">Accommodation Required</span>
                          </label>
                        </div>
                        {formData.accommodationRequired && (
                          <>
                            <div>
                              <label className="block text-sm font-medium mb-1">Room Number</label>
                              <input type="text" value={formData.accommodationRoomNumber} onChange={(e) => setFormData({ ...formData, accommodationRoomNumber: e.target.value })} className="w-full px-4 py-3 min-h-[48px] text-base border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Enter room" />
                            </div>
                            <div>
                              <label className="block text-sm font-medium mb-1">Block</label>
                              <input type="text" value={formData.accommodationBlock} onChange={(e) => setFormData({ ...formData, accommodationBlock: e.target.value })} className="w-full px-4 py-3 min-h-[48px] text-base border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Enter block" />
                            </div>
                            <div>
                              <label className="block text-sm font-medium mb-1">Warden Name</label>
                              <input type="text" value={formData.accommodationWardenName} onChange={(e) => setFormData({ ...formData, accommodationWardenName: e.target.value })} className="w-full px-4 py-3 min-h-[48px] text-base border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Enter warden" />
                            </div>
                          </>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Passport Photo Section */}
                  <div className="mb-6">
                    <div 
                      className="flex items-center justify-between cursor-pointer mb-4 p-3 bg-gray-50 rounded-lg"
                      onClick={() => setCollapsedSections(prev => ({ ...prev, photo: !prev.photo }))}
                    >
                      <h3 className="text-lg font-semibold">Upload Passport Photo *</h3>
                      <span className={`transform transition-transform ${collapsedSections.photo ? 'rotate-180' : ''}`}>▼</span>
                    </div>
                    {!collapsedSections.photo && (
                      <div>
                        <div 
                          className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                            dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
                          }`}
                          onDragOver={handleDragOver}
                          onDragLeave={handleDragLeave}
                          onDrop={(e) => handleDrop(e, true)}
                        >
                          {passportPhotoPreview ? (
                            <div className="space-y-4">
                              <img 
                                src={passportPhotoPreview} 
                                alt="Passport Preview" 
                                className="mx-auto w-32 h-32 object-cover rounded-lg border"
                              />
                              <div className="flex gap-2 justify-center">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setPassportPhoto(null);
                                    setPassportPhotoPreview(null);
                                  }}
                                  className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                                >
                                  Remove
                                </button>
                                <label className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 cursor-pointer">
                                  Replace
                                  <input
                                    type="file"
                                    accept="image/png,image/jpeg,image/jpg"
                                    onChange={(e) => handlePassportPhotoChange(e.target.files[0])}
                                    className="hidden"
                                  />
                                </label>
                              </div>
                            </div>
                          ) : (
                            <div className="space-y-4">
                              <Upload className="mx-auto h-12 w-12 text-gray-400" />
                              <div>
                                <p className="text-lg font-medium">Drop passport photo here</p>
                                <p className="text-sm text-gray-500">or click to browse</p>
                                <p className="text-xs text-gray-400 mt-2">PNG, JPG, JPEG up to 2MB</p>
                              </div>
                              <label className="inline-block px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 cursor-pointer">
                                Choose File
                                <input
                                  type="file"
                                  accept="image/png,image/jpeg,image/jpg"
                                  onChange={(e) => handlePassportPhotoChange(e.target.files[0])}
                                  className="hidden"
                                />
                              </label>
                            </div>
                          )}
                        </div>
                        {errors.passportPhoto && <p className="text-red-500 text-xs mt-1">{errors.passportPhoto}</p>}
                      </div>
                    )}
                  </div>

                  {/* Documents Section */}
                  <div className="mb-6">
                    <div 
                      className="flex items-center justify-between cursor-pointer mb-4 p-3 bg-gray-50 rounded-lg"
                      onClick={() => setCollapsedSections(prev => ({ ...prev, documents: !prev.documents }))}
                    >
                      <h3 className="text-lg font-semibold">Upload Official Documents</h3>
                      <span className={`transform transition-transform ${collapsedSections.documents ? 'rotate-180' : ''}`}>▼</span>
                    </div>
                    {!collapsedSections.documents && (
                      <div className="space-y-4">
                        {editingStaff && editingStaff.documents && editingStaff.documents.length > 0 && (
                          <div className="space-y-2 mb-4">
                            <h4 className="font-medium text-sm">Existing Documents:</h4>
                            {editingStaff.documents.map((doc, index) => (
                              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                <div className="flex items-center gap-3">
                                  {doc.contentType.startsWith('image/') ? <Image className="w-8 h-8 text-blue-500" /> : <FileText className="w-8 h-8 text-red-500" />}
                                  <div>
                                    <p className="text-sm font-medium">{doc.name}</p>
                                    <p className="text-xs text-gray-500 capitalize">{doc.type.replace(/([A-Z])/g, ' $1').trim()}</p>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                        {/* Document Type Buttons */}
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
                          {[
                            { type: 'idProof', label: 'ID Proof *', required: true },
                            { type: 'certification', label: 'Certification' },
                            { type: 'experience', label: 'Experience' },
                            { type: 'resume', label: 'Resume/CV' }
                          ].map(({ type, label, required }) => (
                            <label key={type} className="block">
                              <div className="px-4 py-2 border rounded-lg text-center cursor-pointer hover:bg-gray-50 transition-colors">
                                <span className="text-sm font-medium">{label}</span>
                                <input
                                  type="file"
                                  multiple
                                  accept="image/png,image/jpeg,image/jpg,application/pdf"
                                  onChange={(e) => handleDocumentChange(Array.from(e.target.files), type)}
                                  className="hidden"
                                />
                              </div>
                            </label>
                          ))}
                        </div>

                        {/* Drag & Drop Area */}
                        <div 
                          className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                            dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
                          }`}
                          onDragOver={handleDragOver}
                          onDragLeave={handleDragLeave}
                          onDrop={(e) => handleDrop(e, false)}
                        >
                          <Upload className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                          <p className="text-sm text-gray-600">Drop additional documents here</p>
                          <p className="text-xs text-gray-400">PNG, JPG, JPEG, PDF up to 5MB</p>
                        </div>

                        {/* Document List */}
                        {documents.length > 0 && (
                          <div className="space-y-2">
                            <h4 className="font-medium">Uploaded Documents:</h4>
                            {documents.map((doc, index) => (
                              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                <div className="flex items-center gap-3">
                                  {doc.preview ? (
                                    <img src={doc.preview} alt="Preview" className="w-10 h-10 object-cover rounded" />
                                  ) : (
                                    <FileText className="w-10 h-10 text-red-500" />
                                  )}
                                  <div>
                                    <p className="text-sm font-medium">{doc.file.name}</p>
                                    <p className="text-xs text-gray-500">
                                      {doc.type.charAt(0).toUpperCase() + doc.type.slice(1)} • {(doc.file.size / 1024 / 1024).toFixed(2)} MB
                                    </p>
                                  </div>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => removeDocument(index)}
                                  className="text-red-500 hover:text-red-700 p-1"
                                >
                                  <X size={16} />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                        {errors.documents && <p className="text-red-500 text-xs mt-1">{errors.documents}</p>}
                      </div>
                    )}
                  </div>

                  <div className="sticky bottom-0 bg-white border-t pt-4 sm:pt-6 mt-6 -mx-4 sm:-mx-6 px-4 sm:px-6 pb-4 sm:pb-6">
                    <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                      <button
                        type="button"
                        onClick={closeModal}
                        className="order-2 sm:order-1 flex-1 bg-gray-300 text-gray-700 py-3 min-h-[48px] text-base font-medium rounded-lg hover:bg-gray-400 active:bg-gray-500 transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={loading}
                        className="order-1 sm:order-2 flex-1 bg-blue-500 text-white py-3 min-h-[48px] text-base font-medium rounded-lg hover:bg-blue-600 active:bg-blue-700 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
                      >
                        {loading ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            Processing...
                          </>
                        ) : (
                          editingStaff ? 'Update Staff' : 'Create Staff'
                        )}
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          )}

          {isViewModalOpen && viewingStaff && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4 overflow-y-auto">
              <div className="bg-white rounded-xl w-full max-w-6xl mx-auto my-2 sm:my-4 shadow-2xl min-h-0 max-h-[98vh] overflow-hidden">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center p-3 sm:p-6 border-b bg-gradient-to-r from-blue-50 to-indigo-50 rounded-t-xl gap-3 sm:gap-4">
                  <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
                    {viewingStaff.passportPhoto && (
                      <img 
                        src={`data:${viewingStaff.passportPhoto.contentType};base64,${viewingStaff.passportPhoto.data}`}
                        alt="Staff Photo" 
                        className="w-10 h-10 sm:w-12 sm:h-12 lg:w-16 lg:h-16 object-cover rounded-full border-4 border-white shadow-lg flex-shrink-0"
                      />
                    )}
                    <div className="min-w-0 flex-1">
                      <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-800 truncate">{viewingStaff.name}</h2>
                      <p className="text-blue-600 font-medium text-xs sm:text-sm lg:text-base truncate">{viewingStaff.role} • {viewingStaff.department}</p>
                      <p className="text-xs sm:text-sm text-gray-500 truncate">Staff ID: {viewingStaff.staffId}</p>
                    </div>
                  </div>
                  <button onClick={() => setIsViewModalOpen(false)} className="text-gray-500 hover:text-gray-700 p-2 rounded-full hover:bg-white transition-all flex-shrink-0">
                    <X size={20} className="sm:w-6 sm:h-6" />
                  </button>
                </div>
                <div className="p-3 sm:p-6 max-h-[calc(98vh-120px)] sm:max-h-[calc(98vh-140px)] overflow-y-auto">
                  <div className="flex gap-1 sm:gap-2 mb-4 sm:mb-6 border-b overflow-x-auto scrollbar-hide">
                    {['personal', 'professional', 'salary', 'contact', 'medical', 'permissions', 'documents'].map(tab => (
                      <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-3 sm:px-4 lg:px-6 py-2 sm:py-3 font-medium whitespace-nowrap rounded-t-lg transition-all text-xs sm:text-sm lg:text-base flex-shrink-0 ${
                          activeTab === tab 
                            ? 'border-b-2 border-blue-500 text-blue-600 bg-blue-50' 
                            : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        {tab.charAt(0).toUpperCase() + tab.slice(1)}
                      </button>
                    ))}
                  </div>
                  {activeTab === 'personal' && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                      <div className="bg-gray-50 p-3 sm:p-4 rounded-lg">
                        <h4 className="font-semibold text-gray-700 mb-3 text-sm sm:text-base">Basic Information</h4>
                        <div className="space-y-2 text-sm">
                          <div><span className="font-medium text-gray-600">Name:</span> <span className="text-gray-800">{viewingStaff.name}</span></div>
                          <div><span className="font-medium text-gray-600">Email:</span> <span className="text-gray-800 break-all">{viewingStaff.email}</span></div>
                          <div><span className="font-medium text-gray-600">Phone:</span> <span className="text-gray-800">{viewingStaff.phone || 'N/A'}</span></div>
                          <div><span className="font-medium text-gray-600">Gender:</span> <span className="text-gray-800">{viewingStaff.gender || 'N/A'}</span></div>
                          <div><span className="font-medium text-gray-600">Date of Birth:</span> <span className="text-gray-800">{viewingStaff.dob ? new Date(viewingStaff.dob).toLocaleDateString() : 'N/A'}</span></div>
                          <div><span className="font-medium text-gray-600">Marital Status:</span> <span className="text-gray-800">{viewingStaff.maritalStatus || 'N/A'}</span></div>
                        </div>
                      </div>
                      <div className="bg-gray-50 p-3 sm:p-4 rounded-lg">
                        <h4 className="font-semibold text-gray-700 mb-3 text-sm sm:text-base">Personal Details</h4>
                        <div className="space-y-2 text-sm">
                          <div><span className="font-medium text-gray-600">PAN Number:</span> <span className="text-gray-800">{viewingStaff.panNumber || 'N/A'}</span></div>
                          <div><span className="font-medium text-gray-600">Address:</span> <span className="text-gray-800">{viewingStaff.address || 'N/A'}</span></div>
                        </div>
                      </div>
                    </div>
                  )}
                  {activeTab === 'professional' && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                      <div className="bg-gray-50 p-3 sm:p-4 rounded-lg">
                        <h4 className="font-semibold text-gray-700 mb-3 text-sm sm:text-base">Job Information</h4>
                        <div className="space-y-2 text-sm">
                          <div><span className="font-medium text-gray-600">Staff ID:</span> <span className="text-gray-800">{viewingStaff.staffId || 'N/A'}</span></div>
                          <div><span className="font-medium text-gray-600">Role:</span> <span className="text-gray-800">{viewingStaff.role || 'N/A'}</span></div>
                          <div><span className="font-medium text-gray-600">Department:</span> <span className="text-gray-800">{viewingStaff.department || 'N/A'}</span></div>
                          <div><span className="font-medium text-gray-600">Designation:</span> <span className="text-gray-800">{viewingStaff.designation || 'N/A'}</span></div>
                          <div><span className="font-medium text-gray-600">Employment Type:</span> <span className="text-gray-800">{viewingStaff.employmentType || 'N/A'}</span></div>
                          <div><span className="font-medium text-gray-600">Status:</span> 
                            <span className={`ml-2 px-2 py-1 rounded-full text-xs ${
                              viewingStaff.status === 'Active' ? 'bg-green-100 text-green-800' :
                              viewingStaff.status === 'On Leave' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {viewingStaff.status || 'Active'}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="bg-gray-50 p-3 sm:p-4 rounded-lg">
                        <h4 className="font-semibold text-gray-700 mb-3 text-sm sm:text-base">Career Details</h4>
                        <div className="space-y-2 text-sm">
                          <div><span className="font-medium text-gray-600">Qualification:</span> <span className="text-gray-800">{viewingStaff.qualification || 'N/A'}</span></div>
                          <div><span className="font-medium text-gray-600">Joining Date:</span> <span className="text-gray-800">{viewingStaff.joiningDate ? new Date(viewingStaff.joiningDate).toLocaleDateString() : 'N/A'}</span></div>
                          <div><span className="font-medium text-gray-600">Years of Experience:</span> <span className="text-gray-800">{viewingStaff.yearsOfExperience || 'N/A'}</span></div>
                          <div><span className="font-medium text-gray-600">Previous Institution:</span> <span className="text-gray-800">{viewingStaff.previousInstitution || 'N/A'}</span></div>
                          <div><span className="font-medium text-gray-600">Specialization:</span> <span className="text-gray-800">{viewingStaff.specialization || 'N/A'}</span></div>
                        </div>
                      </div>
                      <div className="bg-gray-50 p-3 sm:p-4 rounded-lg">
                        <h4 className="font-semibold text-gray-700 mb-3 text-sm sm:text-base">Salary Details</h4>
                        <div className="space-y-2 text-sm">
                          <div><span className="font-medium text-gray-600">Basic Salary:</span> <span className="text-gray-800">{viewingStaff.basicSalary ? `₹${viewingStaff.basicSalary}` : 'N/A'}</span></div>
                          <div><span className="font-medium text-gray-600">PF Number:</span> <span className="text-gray-800">{viewingStaff.pfNumber || 'N/A'}</span></div>
                          <div><span className="font-medium text-gray-600">ESI Number:</span> <span className="text-gray-800">{viewingStaff.esiNumber || 'N/A'}</span></div>
                          <div><span className="font-medium text-gray-600">UAN Number:</span> <span className="text-gray-800">{viewingStaff.uanNumber || 'N/A'}</span></div>
                        </div>
                      </div>
                    </div>
                  )}
                  {activeTab === 'salary' && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                      <div className="bg-gray-50 p-3 sm:p-4 rounded-lg">
                        <h4 className="font-semibold text-gray-700 mb-3 text-sm sm:text-base">Salary Information</h4>
                        <div className="space-y-2 text-sm">
                          <div><span className="font-medium text-gray-600">Basic Salary:</span> <span className="text-gray-800">{viewingStaff.basicSalary ? `₹${viewingStaff.basicSalary}` : 'N/A'}</span></div>
                          <div><span className="font-medium text-gray-600">Allowances:</span> <span className="text-gray-800">{viewingStaff.allowances ? `₹${viewingStaff.allowances}` : 'N/A'}</span></div>
                          <div><span className="font-medium text-gray-600">PF Number:</span> <span className="text-gray-800">{viewingStaff.pfNumber || 'N/A'}</span></div>
                          <div><span className="font-medium text-gray-600">ESI Number:</span> <span className="text-gray-800">{viewingStaff.esiNumber || 'N/A'}</span></div>
                          <div><span className="font-medium text-gray-600">UAN Number:</span> <span className="text-gray-800">{viewingStaff.uanNumber || 'N/A'}</span></div>
                        </div>
                      </div>
                      <div className="bg-gray-50 p-3 sm:p-4 rounded-lg">
                        <h4 className="font-semibold text-gray-700 mb-3 text-sm sm:text-base">Bank Details</h4>
                        <div className="space-y-2 text-sm">
                          <div><span className="font-medium text-gray-600">Bank Name:</span> <span className="text-gray-800">{viewingStaff.bankName || 'N/A'}</span></div>
                          <div><span className="font-medium text-gray-600">Account Number:</span> <span className="text-gray-800">{viewingStaff.salaryAccountNumber || 'N/A'}</span></div>
                          <div><span className="font-medium text-gray-600">IFSC Code:</span> <span className="text-gray-800">{viewingStaff.ifscCode || 'N/A'}</span></div>
                          <div><span className="font-medium text-gray-600">Branch:</span> <span className="text-gray-800">{viewingStaff.branchName || 'N/A'}</span></div>
                        </div>
                      </div>
                    </div>
                  )}
                  {activeTab === 'contact' && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                      <div className="bg-gray-50 p-3 sm:p-4 rounded-lg">
                        <h4 className="font-semibold text-gray-700 mb-3 text-sm sm:text-base">Contact Information</h4>
                        <div className="space-y-2 text-sm">
                          <div><span className="font-medium text-gray-600">Phone:</span> <span className="text-gray-800">{viewingStaff.phone || 'N/A'}</span></div>
                          <div><span className="font-medium text-gray-600">Alternate Contact:</span> <span className="text-gray-800">{viewingStaff.alternateContact || 'N/A'}</span></div>
                          <div><span className="font-medium text-gray-600">Email:</span> <span className="text-gray-800 break-all">{viewingStaff.email || 'N/A'}</span></div>
                          <div><span className="font-medium text-gray-600">Emergency Contact Name:</span> <span className="text-gray-800">{viewingStaff.emergencyContactName || 'N/A'}</span></div>
                          <div><span className="font-medium text-gray-600">Emergency Contact Number:</span> <span className="text-gray-800">{viewingStaff.emergencyContactNumber || 'N/A'}</span></div>
                        </div>
                      </div>
                      <div className="bg-gray-50 p-3 sm:p-4 rounded-lg">
                        <h4 className="font-semibold text-gray-700 mb-3 text-sm sm:text-base">Address Details</h4>
                        <div className="space-y-2 text-sm">
                          <div><span className="font-medium text-gray-600">Permanent Address:</span> <span className="text-gray-800">{viewingStaff.permanentAddress || 'N/A'}</span></div>
                          <div><span className="font-medium text-gray-600">Current Address:</span> <span className="text-gray-800">{viewingStaff.currentAddress || 'N/A'}</span></div>
                          <div><span className="font-medium text-gray-600">City:</span> <span className="text-gray-800">{viewingStaff.city || 'N/A'}</span></div>
                          <div><span className="font-medium text-gray-600">State:</span> <span className="text-gray-800">{viewingStaff.state || 'N/A'}</span></div>
                          <div><span className="font-medium text-gray-600">Pincode:</span> <span className="text-gray-800">{viewingStaff.pincode || 'N/A'}</span></div>
                        </div>
                      </div>
                    </div>
                  )}
                  {activeTab === 'medical' && (
                    <div className="bg-gray-50 p-3 sm:p-4 rounded-lg">
                      <h4 className="font-semibold text-gray-700 mb-3 text-sm sm:text-base">Medical Information</h4>
                      <div className="space-y-2 text-sm">
                        <div><span className="font-medium text-gray-600">Medical Conditions:</span> <span className="text-gray-800">{viewingStaff.medicalConditions || 'None'}</span></div>
                        <div><span className="font-medium text-gray-600">Health Insurance:</span> <span className="text-gray-800">{viewingStaff.healthInsurance || 'N/A'}</span></div>
                        <div><span className="font-medium text-gray-600">Disability:</span> <span className="text-gray-800">{viewingStaff.disability ? 'Yes' : 'No'}</span></div>
                        {viewingStaff.disability && (
                          <div><span className="font-medium text-gray-600">Disability Details:</span> <span className="text-gray-800">{viewingStaff.disabilityDetails || 'N/A'}</span></div>
                        )}
                        <div><span className="font-medium text-gray-600">Emergency Medical Contact:</span> <span className="text-gray-800">{viewingStaff.emergencyMedicalContact || 'N/A'}</span></div>
                      </div>
                    </div>
                  )}
                  {activeTab === 'permissions' && (
                    <div className="bg-gray-50 p-4 sm:p-6 rounded-lg">
                      <h4 className="font-semibold text-gray-700 mb-4 text-sm sm:text-base">System Access</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                          <span className="font-medium text-gray-600 text-sm">Login Access:</span> 
                          <span className={`px-3 py-1 rounded-full text-sm w-fit ${
                            viewingStaff.loginAccess ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {viewingStaff.loginAccess ? 'Enabled' : 'Disabled'}
                          </span>
                        </div>
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                          <span className="font-medium text-gray-600 text-sm">Permission Level:</span> 
                          <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm w-fit">
                            {viewingStaff.permissionLevel || 'Staff'}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                  {activeTab === 'documents' && (
                    <div className="space-y-4 sm:space-y-6">
                      {/* Passport Photo */}
                      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 sm:p-6 rounded-xl">
                        <h4 className="font-semibold text-gray-800 mb-4 flex items-center gap-2 text-sm sm:text-base">
                          <Image className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                          Passport Photo
                        </h4>
                        {viewingStaff.passportPhoto ? (
                          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6">
                            <img 
                              src={`data:${viewingStaff.passportPhoto.contentType};base64,${viewingStaff.passportPhoto.data}`}
                              alt="Passport Photo" 
                              className="w-24 h-24 sm:w-32 sm:h-32 object-cover rounded-xl border-4 border-white shadow-lg mx-auto sm:mx-0"
                            />
                            <div className="bg-white p-3 sm:p-4 rounded-lg shadow-sm flex-1 w-full">
                              <p className="text-xs sm:text-sm text-gray-600 mb-1"><span className="font-medium">Filename:</span> {viewingStaff.passportPhoto.filename}</p>
                              <p className="text-xs sm:text-sm text-gray-600"><span className="font-medium">Upload Date:</span> {new Date(viewingStaff.passportPhoto.uploadDate).toLocaleDateString()}</p>
                            </div>
                          </div>
                        ) : (
                          <div className="text-center py-6 sm:py-8">
                            <Image className="w-12 h-12 sm:w-16 sm:h-16 text-gray-300 mx-auto mb-2" />
                            <p className="text-gray-500 italic text-sm">No passport photo uploaded</p>
                          </div>
                        )}
                      </div>

                      {/* Documents */}
                      <div className="bg-gray-50 p-3 sm:p-4 lg:p-6 rounded-xl">
                        <h4 className="font-semibold text-gray-800 mb-3 sm:mb-4 flex items-center gap-2 text-sm sm:text-base lg:text-lg">
                          <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
                          Official Documents
                        </h4>
                        {viewingStaff.documents && viewingStaff.documents.length > 0 ? (
                          <div className="space-y-3 sm:space-y-4">
                            {viewingStaff.documents.map((doc, index) => (
                              <div key={index} className="bg-white p-3 sm:p-4 rounded-lg shadow-sm border hover:shadow-md transition-all duration-200">
                                {/* Mobile Layout */}
                                <div className="block sm:hidden">
                                  <div className="flex items-center gap-3 mb-3">
                                    <div className="flex-shrink-0 cursor-pointer" onClick={() => openDocumentViewer(doc)}>
                                      {doc.contentType.startsWith('image/') ? (
                                        <img 
                                          src={`data:${doc.contentType};base64,${doc.data}`}
                                          alt={doc.name} 
                                          className="w-12 h-12 object-cover rounded-lg border-2 border-gray-200 hover:border-blue-300 transition-colors"
                                        />
                                      ) : (
                                        <div className="w-12 h-12 bg-red-50 rounded-lg border-2 border-red-200 flex items-center justify-center hover:bg-red-100 transition-colors">
                                          <FileText className="w-6 h-6 text-red-500" />
                                        </div>
                                      )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <h5 className="font-medium text-gray-800 text-sm truncate mb-1">{doc.name}</h5>
                                      <div className="flex items-center gap-2 text-xs text-gray-500">
                                        <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium capitalize">
                                          {doc.type.replace(/([A-Z])/g, ' $1').trim()}
                                        </span>
                                        <span>{(doc.size / 1024 / 1024).toFixed(1)} MB</span>
                                      </div>
                                    </div>
                                  </div>
                                  <div className="text-xs text-gray-400 mb-3 text-center">
                                    Uploaded: {new Date(doc.uploadDate).toLocaleDateString()}
                                  </div>
                                  <div className="grid grid-cols-2 gap-2">
                                    <button 
                                      onClick={() => openDocumentViewer(doc)}
                                      className="px-3 py-2 text-xs bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center justify-center gap-1 font-medium"
                                    >
                                      <Eye size={14} /> View
                                    </button>
                                    <button 
                                      onClick={() => {
                                        const link = document.createElement('a');
                                        link.href = `data:${doc.contentType};base64,${doc.data}`;
                                        link.download = doc.name;
                                        link.click();
                                      }}
                                      className="px-3 py-2 text-xs bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center justify-center gap-1 font-medium"
                                    >
                                      Download
                                    </button>
                                  </div>
                                </div>

                                {/* Desktop Layout */}
                                <div className="hidden sm:flex items-center gap-4">
                                  <div className="flex-shrink-0 cursor-pointer" onClick={() => openDocumentViewer(doc)}>
                                    {doc.contentType.startsWith('image/') ? (
                                      <img 
                                        src={`data:${doc.contentType};base64,${doc.data}`}
                                        alt={doc.name} 
                                        className="w-16 h-16 lg:w-20 lg:h-20 object-cover rounded-lg border-2 border-gray-200 hover:border-blue-300 transition-colors"
                                      />
                                    ) : (
                                      <div className="w-16 h-16 lg:w-20 lg:h-20 bg-red-50 rounded-lg border-2 border-red-200 flex items-center justify-center hover:bg-red-100 transition-colors">
                                        <FileText className="w-8 h-8 lg:w-10 lg:h-10 text-red-500" />
                                      </div>
                                    )}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <h5 className="font-medium text-gray-800 truncate mb-1 text-sm lg:text-base">{doc.name}</h5>
                                    <div className="flex flex-wrap items-center gap-3 text-xs lg:text-sm text-gray-600">
                                      <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium capitalize">
                                        {doc.type.replace(/([A-Z])/g, ' $1').trim()}
                                      </span>
                                      <span>{(doc.size / 1024 / 1024).toFixed(2)} MB</span>
                                      <span>Uploaded: {new Date(doc.uploadDate).toLocaleDateString()}</span>
                                    </div>
                                  </div>
                                  <div className="flex gap-2">
                                    <button 
                                      onClick={() => openDocumentViewer(doc)}
                                      className="px-3 py-2 text-xs lg:text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-1 font-medium"
                                    >
                                      <Eye size={14} className="lg:w-4 lg:h-4" /> View
                                    </button>
                                    <button 
                                      onClick={() => {
                                        const link = document.createElement('a');
                                        link.href = `data:${doc.contentType};base64,${doc.data}`;
                                        link.download = doc.name;
                                        link.click();
                                      }}
                                      className="px-3 py-2 text-xs lg:text-sm bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center gap-1 font-medium"
                                    >
                                      Download
                                    </button>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-8 sm:py-12">
                            <FileText className="w-12 h-12 sm:w-16 sm:h-16 text-gray-300 mx-auto mb-3" />
                            <p className="text-gray-500 text-sm sm:text-base">No documents uploaded</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Document Viewer Modal */}
          {documentViewerOpen && viewingDocument && (
            <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-[60] p-4">
              <div className="bg-white rounded-xl w-full max-w-4xl max-h-[95vh] overflow-hidden">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center p-4 border-b bg-gray-50 gap-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold text-gray-800 truncate">{viewingDocument.name}</h3>
                    <p className="text-sm text-gray-600">
                      {viewingDocument.type !== 'passport' && (
                        <span className="capitalize">{viewingDocument.type.replace(/([A-Z])/g, ' $1').trim()} • </span>
                      )}
                      {viewingDocument.contentType}
                    </p>
                  </div>
                  <button 
                    onClick={() => setDocumentViewerOpen(false)}
                    className="text-gray-500 hover:text-gray-700 p-2 rounded-full hover:bg-gray-200 transition-all flex-shrink-0"
                  >
                    <X size={24} />
                  </button>
                </div>
                <div className="p-4 max-h-[calc(95vh-180px)] overflow-auto">
                  {viewingDocument.contentType.startsWith('image/') ? (
                    <div className="flex justify-center">
                      <img 
                        src={`data:${viewingDocument.contentType};base64,${viewingDocument.data}`}
                        alt={viewingDocument.name}
                        className="max-w-full max-h-full object-contain rounded-lg shadow-lg"
                      />
                    </div>
                  ) : viewingDocument.contentType === 'application/pdf' ? (
                    <div className="w-full h-[400px] sm:h-[600px]">
                      <iframe
                        src={`data:${viewingDocument.contentType};base64,${viewingDocument.data}`}
                        className="w-full h-full border rounded-lg"
                        title={viewingDocument.name}
                      />
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600 mb-4">Cannot preview this file type</p>
                      <button 
                        onClick={() => {
                          const link = document.createElement('a');
                          link.href = `data:${viewingDocument.contentType};base64,${viewingDocument.data}`;
                          link.download = viewingDocument.name;
                          link.click();
                        }}
                        className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                      >
                        Download File
                      </button>
                    </div>
                  )}
                </div>
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center p-4 border-t bg-gray-50 gap-3">
                  <div className="text-sm text-gray-600">
                    {viewingDocument.size && (
                      <span>Size: {(viewingDocument.size / 1024 / 1024).toFixed(2)} MB</span>
                    )}
                    {viewingDocument.uploadDate && (
                      <span className={viewingDocument.size ? 'ml-4' : ''}>Uploaded: {new Date(viewingDocument.uploadDate).toLocaleDateString()}</span>
                    )}
                  </div>
                  <button 
                    onClick={() => {
                      const link = document.createElement('a');
                      link.href = `data:${viewingDocument.contentType};base64,${viewingDocument.data}`;
                      link.download = viewingDocument.name;
                      link.click();
                    }}
                    className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center justify-center gap-2 w-full sm:w-auto"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Download
                  </button>
                </div>
              </div>
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
      </div>
    </div>
  )
};

export default AdminStaff;
