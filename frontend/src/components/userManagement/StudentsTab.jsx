import { useState, useEffect } from 'react';
import { Edit, Trash2, Plus, Search, Filter } from 'lucide-react';
import Modal from '../Modal';
import StudentDetailsModal from '../StudentDetailsModal';
import { userAPI, classAPI } from '../../services/api';

const StudentsTab = () => {
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [selectedClassName, setSelectedClassName] = useState('');
  const [availableSections, setAvailableSections] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [isStudentModalOpen, setIsStudentModalOpen] = useState(false);
  const [filterClass, setFilterClass] = useState('');
  const [filterSection, setFilterSection] = useState('');
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [formData, setFormData] = useState({
    name: '', email: '', password: '', profilePhoto: '', dateOfBirth: '', gender: '', bloodGroup: '',
    aadhaarNumber: '', emisNumber: '', nationality: 'Indian', religion: '', casteCategory: '',
    community: '', motherTongue: '', identificationMark1: '', identificationMark2: '',
    class: '', section: '', rollNumber: '', admissionNumber: '', admissionDate: '', academicYear: '',
    stream: '', previousSchool: '', previousClass: '', mediumOfInstruction: '', secondLanguage: '',
    transportRequired: false, scholarshipCategory: '', feeConcessionDetails: '',
    // Parent Details
    fatherName: '', fatherOccupation: '', fatherQualification: '', fatherIncome: '', fatherContact: '', fatherEmail: '', fatherAadhaar: '',
    motherName: '', motherOccupation: '', motherQualification: '', motherIncome: '', motherContact: '', motherEmail: '', motherAadhaar: '',
    guardianName: '', guardianRelationship: '', guardianContact: '', guardianOccupation: '',
    // Contact Info
    studentPhone: '', studentEmail: '', emergencyContactName: '', emergencyContactNumber: '', alternateContact: '',
    // Address
    permanentAddress: '', currentAddress: '', sameAsPermanent: false, city: '', district: '', state: '', pincode: '', country: 'India',
    // Medical
    medicalConditions: '', allergies: '', disability: false, disabilityDetails: '', height: '', weight: '', vaccinationStatus: '',
    doctorName: '', doctorContact: '', healthInsurance: '',
    // Hostel
    hostelRequired: false, hostelName: '', roomNumber: '', bedNumber: '', wardenName: '', wardenContact: '',
    roomType: '', messPlan: '', hostelAdmissionDate: '', hostelFee: '',
    // Transport
    routeNumber: '', pickupPoint: '', driverName: '', driverContact: '', busNumber: '', transportFee: '',
    // Documents
    documents: {},
    // Bank
    bankName: '', accountHolder: '', accountNumber: '', ifscCode: '', branchName: '', upiId: ''
  });
  const [photoPreview, setPhotoPreview] = useState(null);
  const [studentId, setStudentId] = useState('');

  useEffect(() => {
    fetchStudents();
    fetchClasses();
    generateStudentId();
  }, [search]);

  const generateStudentId = () => {
    const year = new Date().getFullYear();
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    setStudentId(`STU${year}${random}`);
  };

  useEffect(() => {
    applyFilters();
  }, [students, filterClass, filterSection]);

  const applyFilters = () => {
    let filtered = students;
    if (filterClass) filtered = filtered.filter(s => s.class === filterClass);
    if (filterSection) filtered = filtered.filter(s => s.section === filterSection);
    setFilteredStudents(filtered);
  };

  const fetchClasses = async () => {
    try {
      const res = await classAPI.getClasses();
      setClasses(res.data);
    } catch (error) {
      console.error('Error fetching classes:', error);
    }
  };

  const fetchStudents = () => {
    userAPI.getUsers({ role: 'student', search }).then(res => {
      setStudents(res.data);
      setFilteredStudents(res.data);
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingStudent) {
        await userAPI.updateUser(editingStudent._id, formData);
      } else {
        await userAPI.createUser({ ...formData, role: 'student' });
      }
      fetchStudents();
      setIsModalOpen(false);
      resetForm();
    } catch (error) {
      alert(error.response?.data?.message || 'Operation failed');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this student?')) {
      await userAPI.deleteUser(id);
      fetchStudents();
    }
  };

  const resetForm = () => {
    setFormData({
      name: '', email: '', password: '', profilePhoto: '', dateOfBirth: '', gender: '', bloodGroup: '',
      aadhaarNumber: '', emisNumber: '', nationality: 'Indian', religion: '', casteCategory: '',
      community: '', motherTongue: '', identificationMark1: '', identificationMark2: '',
      class: '', section: '', rollNumber: '', admissionNumber: '', admissionDate: '', academicYear: '',
      stream: '', previousSchool: '', previousClass: '', mediumOfInstruction: '', secondLanguage: '',
      transportRequired: false, scholarshipCategory: '', feeConcessionDetails: '',
      fatherName: '', fatherOccupation: '', fatherQualification: '', fatherIncome: '', fatherContact: '', fatherEmail: '', fatherAadhaar: '',
      motherName: '', motherOccupation: '', motherQualification: '', motherIncome: '', motherContact: '', motherEmail: '', motherAadhaar: '',
      guardianName: '', guardianRelationship: '', guardianContact: '', guardianOccupation: '',
      studentPhone: '', studentEmail: '', emergencyContactName: '', emergencyContactNumber: '', alternateContact: '',
      permanentAddress: '', currentAddress: '', sameAsPermanent: false, city: '', district: '', state: '', pincode: '', country: 'India',
      medicalConditions: '', allergies: '', disability: false, disabilityDetails: '', height: '', weight: '', vaccinationStatus: '',
      doctorName: '', doctorContact: '', healthInsurance: '',
      hostelRequired: false, hostelName: '', roomNumber: '', bedNumber: '', wardenName: '', wardenContact: '',
      roomType: '', messPlan: '', hostelAdmissionDate: '', hostelFee: '',
      routeNumber: '', pickupPoint: '', driverName: '', driverContact: '', busNumber: '', transportFee: '',
      documents: {},
      bankName: '', accountHolder: '', accountNumber: '', ifscCode: '', branchName: '', upiId: ''
    });
    setPhotoPreview(null);
    setSelectedClassName('');
    setAvailableSections([]);
    setEditingStudent(null);
    generateStudentId();
  };

  const handleClassNameSelection = (className) => {
    setSelectedClassName(className);
    setFormData(prev => ({ ...prev, class: className, section: '' }));
    const classesForName = classes.filter(cls => cls.className === className);
    const sections = classesForName.map(cls => cls.section).filter(Boolean);
    const uniqueSections = [...new Set(sections)].sort();
    setAvailableSections(uniqueSections);
  };

  const openEditModal = (student) => {
    setEditingStudent(student);
    setFormData(student);
    setPhotoPreview(student.profilePhoto || null);
    if (student.class) {
      setSelectedClassName(student.class);
      const classesForName = classes.filter(cls => cls.className === student.class);
      const sections = classesForName.map(cls => cls.section).filter(Boolean);
      const uniqueSections = [...new Set(sections)].sort();
      setAvailableSections(uniqueSections);
    }
    setIsModalOpen(true);
  };

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert('File size should be less than 2MB');
        return;
      }
      if (!['image/jpeg', 'image/png'].includes(file.type)) {
        alert('Only JPG and PNG formats are allowed');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result);
        setFormData(prev => ({ ...prev, profilePhoto: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDocumentUpload = (e, docType) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('File size should be less than 5MB');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({
          ...prev,
          documents: { ...prev.documents, [docType]: reader.result }
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const openStudentDetails = (student) => {
    setSelectedStudent(student);
    setIsStudentModalOpen(true);
  };

  const getUniqueClasses = () => [...new Set(students.map(s => s.class).filter(Boolean))].sort();
  const getUniqueSections = () => [...new Set(students.map(s => s.section).filter(Boolean))].sort();

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 gap-3">
        <h2 className="text-xl font-semibold text-gray-800">Students Management</h2>
        <button
          onClick={() => { resetForm(); setIsModalOpen(true); }}
          className="bg-blue-500 text-white px-6 py-3 min-h-[48px] rounded-lg flex items-center justify-center gap-2 hover:bg-blue-600 transition-colors w-full sm:w-auto"
        >
          <Plus size={20} /> Add Student
        </button>
      </div>

      <div className="mb-6 relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
        <input
          type="text"
          placeholder="Search by name, email, or roll number..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-12 pr-4 py-3 min-h-[48px] border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Filter size={20} className="text-gray-600" />
          <h3 className="text-lg font-semibold text-gray-800">Filter by Class & Section</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Class</label>
            <select
              value={filterClass}
              onChange={(e) => setFilterClass(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Classes</option>
              {getUniqueClasses().map(cls => (
                <option key={cls} value={cls}>Class {cls}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Section</label>
            <select
              value={filterSection}
              onChange={(e) => setFilterSection(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Sections</option>
              {getUniqueSections().map(section => (
                <option key={section} value={section}>Section {section}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">&nbsp;</label>
            <button
              onClick={() => { setFilterClass(''); setFilterSection(''); }}
              className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Clear Filters
            </button>
          </div>
        </div>
        <div className="mt-4 text-sm text-gray-600">
          Showing {filteredStudents.length} of {students.length} students
          {(filterClass || filterSection) && <span className="ml-2 text-blue-600 font-medium">(Filtered)</span>}
        </div>
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block bg-white rounded-lg shadow-md overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Class</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Section</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Roll No</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredStudents.length === 0 ? (
              <tr>
                <td colSpan="6" className="px-4 py-8 text-center text-gray-500">
                  {(filterClass || filterSection) ? 'No students match the selected filters' : 'No students found'}
                </td>
              </tr>
            ) : (
              filteredStudents.map((student) => (
                <tr key={student._id} className="hover:bg-gray-50">
                  <td className="px-4 py-4 text-sm font-medium">
                    <button
                      onClick={() => openStudentDetails(student)}
                      className="text-blue-600 hover:text-blue-800 hover:underline"
                    >
                      {student.name}
                    </button>
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-500">{student.email}</td>
                  <td className="px-4 py-4 text-sm text-gray-500">{student.class || 'N/A'}</td>
                  <td className="px-4 py-4 text-sm text-gray-500">{student.section || 'N/A'}</td>
                  <td className="px-4 py-4 text-sm text-gray-500">{student.rollNumber || 'N/A'}</td>
                  <td className="px-4 py-4 text-sm">
                    <div className="flex gap-2">
                      <button onClick={() => openEditModal(student)} className="text-blue-500 hover:text-blue-700 p-2 rounded hover:bg-blue-50">
                        <Edit size={18} />
                      </button>
                      <button onClick={() => handleDelete(student._id)} className="text-red-500 hover:text-red-700 p-2 rounded hover:bg-red-50">
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden space-y-4">
        {filteredStudents.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-6 text-center text-gray-500">
            {(filterClass || filterSection) ? 'No students match the selected filters' : 'No students found'}
          </div>
        ) : (
          filteredStudents.map((student) => (
            <div key={student._id} className="bg-white rounded-lg shadow-md p-4">
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                  <button
                    onClick={() => openStudentDetails(student)}
                    className="text-lg font-semibold text-blue-600 hover:text-blue-800 hover:underline mb-1 text-left"
                  >
                    {student.name}
                  </button>
                  <p className="text-sm text-gray-600 mb-2">{student.email}</p>
                </div>
                <div className="flex gap-2 ml-4">
                  <button onClick={() => openEditModal(student)} className="text-blue-500 p-3 min-w-[48px] min-h-[48px] rounded-lg hover:bg-blue-50">
                    <Edit size={20} />
                  </button>
                  <button onClick={() => handleDelete(student._id)} className="text-red-500 p-3 min-w-[48px] min-h-[48px] rounded-lg hover:bg-red-50">
                    <Trash2 size={20} />
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div><span className="font-medium">Class:</span> {student.class || 'N/A'}</div>
                <div><span className="font-medium">Section:</span> {student.section || 'N/A'}</div>
                <div className="col-span-2"><span className="font-medium">Roll:</span> {student.rollNumber || 'N/A'}</div>
              </div>
            </div>
          ))
        )}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingStudent ? 'Edit Student' : 'Add Student'}>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="max-h-[70vh] overflow-y-auto px-1">
          
          {/* Section 1: Basic Information */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="text-lg font-bold text-blue-800 mb-4">1. Basic Student Information</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium mb-2">Full Name (As per Aadhaar) *</label>
                <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500" required />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Profile Photo (JPG/PNG)</label>
                <input type="file" accept="image/jpeg,image/png" onChange={handlePhotoUpload} className="w-full px-4 py-2.5 border rounded-lg" />
                {photoPreview && <img src={photoPreview} alt="Preview" className="mt-2 w-16 h-16 rounded-lg object-cover" />}
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Date of Birth *</label>
                <input type="date" value={formData.dateOfBirth} onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })} className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500" required />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Gender *</label>
                <select value={formData.gender} onChange={(e) => setFormData({ ...formData, gender: e.target.value })} className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500" required>
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Blood Group *</label>
                <select value={formData.bloodGroup} onChange={(e) => setFormData({ ...formData, bloodGroup: e.target.value })} className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500" required>
                  <option value="">Select Blood Group</option>
                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="O+">O+</option>
                  <option value="O-">O-</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB-</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Aadhaar Number (12 Digits) *</label>
                <input type="text" value={formData.aadhaarNumber} onChange={(e) => setFormData({ ...formData, aadhaarNumber: e.target.value })} placeholder="XXXX XXXX XXXX" maxLength="14" className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500" required />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">EMIS Number</label>
                <input type="text" value={formData.emisNumber} onChange={(e) => setFormData({ ...formData, emisNumber: e.target.value })} className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Nationality *</label>
                <input type="text" value={formData.nationality} onChange={(e) => setFormData({ ...formData, nationality: e.target.value })} className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500" required />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Religion</label>
                <select value={formData.religion} onChange={(e) => setFormData({ ...formData, religion: e.target.value })} className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500">
                  <option value="">Select Religion</option>
                  <option value="Hindu">Hindu</option>
                  <option value="Muslim">Muslim</option>
                  <option value="Christian">Christian</option>
                  <option value="Sikh">Sikh</option>
                  <option value="Buddhist">Buddhist</option>
                  <option value="Jain">Jain</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Caste Category</label>
                <select value={formData.casteCategory} onChange={(e) => setFormData({ ...formData, casteCategory: e.target.value })} className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500">
                  <option value="">Select Category</option>
                  <option value="OC">OC</option>
                  <option value="BC">BC</option>
                  <option value="MBC">MBC</option>
                  <option value="SC">SC</option>
                  <option value="ST">ST</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Community</label>
                <input type="text" value={formData.community} onChange={(e) => setFormData({ ...formData, community: e.target.value })} className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Mother Tongue</label>
                <input type="text" value={formData.motherTongue} onChange={(e) => setFormData({ ...formData, motherTongue: e.target.value })} className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Identification Mark 1</label>
                <input type="text" value={formData.identificationMark1} onChange={(e) => setFormData({ ...formData, identificationMark1: e.target.value })} className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Identification Mark 2</label>
                <input type="text" value={formData.identificationMark2} onChange={(e) => setFormData({ ...formData, identificationMark2: e.target.value })} className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Student ID (Auto Generated)</label>
                <input type="text" value={studentId} className="w-full px-4 py-2.5 border rounded-lg bg-gray-100 cursor-not-allowed" readOnly />
              </div>
            </div>
          </div>

          {/* Section 2: Academic Information */}
          <div className="bg-green-50 p-4 rounded-lg">
            <h3 className="text-lg font-bold text-green-800 mb-4">2. Academic Information</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Class *</label>
                <select value={selectedClassName} onChange={(e) => handleClassNameSelection(e.target.value)} className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500" required>
                  <option value="">Select Class</option>
                  {[...new Set(classes.map(cls => cls.className).filter(Boolean))].sort().map(className => (
                    <option key={className} value={className}>Class {className}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Section *</label>
                <select value={formData.section} onChange={(e) => setFormData({ ...formData, section: e.target.value })} className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500" required disabled={!selectedClassName}>
                  <option value="">Select Section</option>
                  {availableSections.map(section => (
                    <option key={section} value={section}>Section {section}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Roll Number</label>
                <input type="number" value={formData.rollNumber} onChange={(e) => setFormData({ ...formData, rollNumber: e.target.value })} className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Admission Number</label>
                <input type="text" value={formData.admissionNumber} onChange={(e) => setFormData({ ...formData, admissionNumber: e.target.value })} className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Admission Date</label>
                <input type="date" value={formData.admissionDate} onChange={(e) => setFormData({ ...formData, admissionDate: e.target.value })} className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Academic Year</label>
                <select value={formData.academicYear} onChange={(e) => setFormData({ ...formData, academicYear: e.target.value })} className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500">
                  <option value="">Select Academic Year</option>
                  <option value="2023-2024">2023-2024</option>
                  <option value="2024-2025">2024-2025</option>
                  <option value="2025-2026">2025-2026</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Stream</label>
                <select value={formData.stream} onChange={(e) => setFormData({ ...formData, stream: e.target.value })} className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500">
                  <option value="">Select Stream</option>
                  <option value="Science">Science</option>
                  <option value="Commerce">Commerce</option>
                  <option value="Arts">Arts</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Previous School Name</label>
                <input type="text" value={formData.previousSchool} onChange={(e) => setFormData({ ...formData, previousSchool: e.target.value })} className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Previous Class</label>
                <input type="text" value={formData.previousClass} onChange={(e) => setFormData({ ...formData, previousClass: e.target.value })} className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Medium of Instruction</label>
                <select value={formData.mediumOfInstruction} onChange={(e) => setFormData({ ...formData, mediumOfInstruction: e.target.value })} className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500">
                  <option value="">Select Medium</option>
                  <option value="English">English</option>
                  <option value="Hindi">Hindi</option>
                  <option value="Tamil">Tamil</option>
                  <option value="Telugu">Telugu</option>
                  <option value="Malayalam">Malayalam</option>
                  <option value="Kannada">Kannada</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Second Language</label>
                <select value={formData.secondLanguage} onChange={(e) => setFormData({ ...formData, secondLanguage: e.target.value })} className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500">
                  <option value="">Select Second Language</option>
                  <option value="Hindi">Hindi</option>
                  <option value="Tamil">Tamil</option>
                  <option value="Sanskrit">Sanskrit</option>
                  <option value="French">French</option>
                  <option value="German">German</option>
                  <option value="Spanish">Spanish</option>
                </select>
              </div>
              <div className="flex items-center pt-6">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" checked={formData.transportRequired} onChange={(e) => setFormData({ ...formData, transportRequired: e.target.checked })} className="w-5 h-5 text-blue-500 border-gray-300 rounded focus:ring-2 focus:ring-blue-500" />
                  <span className="text-sm font-medium">Transport Required</span>
                </label>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Scholarship Category</label>
                <input type="text" value={formData.scholarshipCategory} onChange={(e) => setFormData({ ...formData, scholarshipCategory: e.target.value })} placeholder="e.g., Merit, Sports" className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500" />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium mb-2">Fee Concession Details</label>
                <textarea value={formData.feeConcessionDetails} onChange={(e) => setFormData({ ...formData, feeConcessionDetails: e.target.value })} rows="2" className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500" />
              </div>
            </div>
          </div>

          {/* Section 3: Parent/Guardian Information */}
          <div className="bg-yellow-50 p-4 rounded-lg">
            <h3 className="text-lg font-bold text-yellow-800 mb-4">3. Parent / Guardian Information</h3>
            <div className="space-y-4">
              <h4 className="font-semibold text-gray-700">Father's Details</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <input type="text" placeholder="Father's Name" value={formData.fatherName} onChange={(e) => setFormData({ ...formData, fatherName: e.target.value })} className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500" />
                <input type="text" placeholder="Occupation" value={formData.fatherOccupation} onChange={(e) => setFormData({ ...formData, fatherOccupation: e.target.value })} className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500" />
                <input type="text" placeholder="Qualification" value={formData.fatherQualification} onChange={(e) => setFormData({ ...formData, fatherQualification: e.target.value })} className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500" />
                <input type="text" placeholder="Annual Income" value={formData.fatherIncome} onChange={(e) => setFormData({ ...formData, fatherIncome: e.target.value })} className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500" />
                <input type="tel" placeholder="Contact Number" value={formData.fatherContact} onChange={(e) => setFormData({ ...formData, fatherContact: e.target.value })} className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500" />
                <input type="email" placeholder="Email" value={formData.fatherEmail} onChange={(e) => setFormData({ ...formData, fatherEmail: e.target.value })} className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500" />
                <input type="text" placeholder="Aadhaar Number" value={formData.fatherAadhaar} onChange={(e) => setFormData({ ...formData, fatherAadhaar: e.target.value })} className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500" />
              </div>
              <h4 className="font-semibold text-gray-700 mt-4">Mother's Details</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <input type="text" placeholder="Mother's Name" value={formData.motherName} onChange={(e) => setFormData({ ...formData, motherName: e.target.value })} className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500" />
                <input type="text" placeholder="Occupation" value={formData.motherOccupation} onChange={(e) => setFormData({ ...formData, motherOccupation: e.target.value })} className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500" />
                <input type="text" placeholder="Qualification" value={formData.motherQualification} onChange={(e) => setFormData({ ...formData, motherQualification: e.target.value })} className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500" />
                <input type="text" placeholder="Annual Income" value={formData.motherIncome} onChange={(e) => setFormData({ ...formData, motherIncome: e.target.value })} className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500" />
                <input type="tel" placeholder="Contact Number" value={formData.motherContact} onChange={(e) => setFormData({ ...formData, motherContact: e.target.value })} className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500" />
                <input type="email" placeholder="Email" value={formData.motherEmail} onChange={(e) => setFormData({ ...formData, motherEmail: e.target.value })} className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500" />
                <input type="text" placeholder="Aadhaar Number" value={formData.motherAadhaar} onChange={(e) => setFormData({ ...formData, motherAadhaar: e.target.value })} className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500" />
              </div>
              <h4 className="font-semibold text-gray-700 mt-4">Guardian (Optional)</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <input type="text" placeholder="Guardian Name" value={formData.guardianName} onChange={(e) => setFormData({ ...formData, guardianName: e.target.value })} className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500" />
                <input type="text" placeholder="Relationship" value={formData.guardianRelationship} onChange={(e) => setFormData({ ...formData, guardianRelationship: e.target.value })} className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500" />
                <input type="tel" placeholder="Contact Number" value={formData.guardianContact} onChange={(e) => setFormData({ ...formData, guardianContact: e.target.value })} className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500" />
                <input type="text" placeholder="Occupation" value={formData.guardianOccupation} onChange={(e) => setFormData({ ...formData, guardianOccupation: e.target.value })} className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500" />
              </div>
            </div>
          </div>

          {/* Section 4: Contact Information */}
          <div className="bg-indigo-50 p-4 rounded-lg">
            <h3 className="text-lg font-bold text-indigo-800 mb-4">4. Contact Information</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <input type="tel" placeholder="Student Phone" value={formData.studentPhone} onChange={(e) => setFormData({ ...formData, studentPhone: e.target.value })} className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500" />
              <input type="email" placeholder="Student Email" value={formData.studentEmail} onChange={(e) => setFormData({ ...formData, studentEmail: e.target.value })} className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500" />
              <input type="text" placeholder="Emergency Contact Name" value={formData.emergencyContactName} onChange={(e) => setFormData({ ...formData, emergencyContactName: e.target.value })} className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500" />
              <input type="tel" placeholder="Emergency Contact Number" value={formData.emergencyContactNumber} onChange={(e) => setFormData({ ...formData, emergencyContactNumber: e.target.value })} className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500" />
              <input type="tel" placeholder="Alternate Contact Number" value={formData.alternateContact} onChange={(e) => setFormData({ ...formData, alternateContact: e.target.value })} className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>

          {/* Section 5: Address Information */}
          <div className="bg-pink-50 p-4 rounded-lg">
            <h3 className="text-lg font-bold text-pink-800 mb-4">5. Address Information</h3>
            <div className="grid grid-cols-1 gap-4">
              <textarea placeholder="Permanent Address" value={formData.permanentAddress} onChange={(e) => setFormData({ ...formData, permanentAddress: e.target.value })} rows="2" className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500" />
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={formData.sameAsPermanent} onChange={(e) => setFormData({ ...formData, sameAsPermanent: e.target.checked, currentAddress: e.target.checked ? formData.permanentAddress : '' })} className="w-4 h-4" />
                <span className="text-sm">Same as Permanent Address</span>
              </label>
              {!formData.sameAsPermanent && (
                <textarea placeholder="Current Address" value={formData.currentAddress} onChange={(e) => setFormData({ ...formData, currentAddress: e.target.value })} rows="2" className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500" />
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <input type="text" placeholder="City" value={formData.city} onChange={(e) => setFormData({ ...formData, city: e.target.value })} className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500" />
                <input type="text" placeholder="District" value={formData.district} onChange={(e) => setFormData({ ...formData, district: e.target.value })} className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500" />
                <input type="text" placeholder="State" value={formData.state} onChange={(e) => setFormData({ ...formData, state: e.target.value })} className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500" />
                <input type="text" placeholder="Pincode" value={formData.pincode} onChange={(e) => setFormData({ ...formData, pincode: e.target.value })} className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500" />
                <input type="text" placeholder="Country" value={formData.country} onChange={(e) => setFormData({ ...formData, country: e.target.value })} className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500" />
              </div>
            </div>
          </div>

          {/* Section 6: Medical & Health Information */}
          <div className="bg-red-50 p-4 rounded-lg">
            <h3 className="text-lg font-bold text-red-800 mb-4">6. Medical & Health Information</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <textarea placeholder="Medical Conditions" value={formData.medicalConditions} onChange={(e) => setFormData({ ...formData, medicalConditions: e.target.value })} rows="2" className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500" />
              <textarea placeholder="Allergies" value={formData.allergies} onChange={(e) => setFormData({ ...formData, allergies: e.target.value })} rows="2" className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500" />
              <div>
                <label className="flex items-center gap-2 mb-2">
                  <input type="checkbox" checked={formData.disability} onChange={(e) => setFormData({ ...formData, disability: e.target.checked })} className="w-4 h-4" />
                  <span className="text-sm font-medium">Disability</span>
                </label>
                {formData.disability && (
                  <input type="text" placeholder="Disability Details" value={formData.disabilityDetails} onChange={(e) => setFormData({ ...formData, disabilityDetails: e.target.value })} className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500" />
                )}
              </div>
              <input type="text" placeholder="Height (cm)" value={formData.height} onChange={(e) => setFormData({ ...formData, height: e.target.value })} className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500" />
              <input type="text" placeholder="Weight (kg)" value={formData.weight} onChange={(e) => setFormData({ ...formData, weight: e.target.value })} className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500" />
              <input type="text" placeholder="Vaccination Status" value={formData.vaccinationStatus} onChange={(e) => setFormData({ ...formData, vaccinationStatus: e.target.value })} className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500" />
              <input type="text" placeholder="Doctor Name" value={formData.doctorName} onChange={(e) => setFormData({ ...formData, doctorName: e.target.value })} className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500" />
              <input type="tel" placeholder="Doctor Contact" value={formData.doctorContact} onChange={(e) => setFormData({ ...formData, doctorContact: e.target.value })} className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500" />
              <input type="text" placeholder="Health Insurance Details" value={formData.healthInsurance} onChange={(e) => setFormData({ ...formData, healthInsurance: e.target.value })} className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>

          {/* Section 7: Hostel Details */}
          <div className="bg-orange-50 p-4 rounded-lg">
            <h3 className="text-lg font-bold text-orange-800 mb-4">7. Hostel Details</h3>
            <label className="flex items-center gap-2 mb-4">
              <input type="checkbox" checked={formData.hostelRequired} onChange={(e) => setFormData({ ...formData, hostelRequired: e.target.checked })} className="w-4 h-4" />
              <span className="text-sm font-medium">Hostel Required</span>
            </label>
            {formData.hostelRequired && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <input type="text" placeholder="Hostel Name" value={formData.hostelName} onChange={(e) => setFormData({ ...formData, hostelName: e.target.value })} className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500" />
                <input type="text" placeholder="Room Number" value={formData.roomNumber} onChange={(e) => setFormData({ ...formData, roomNumber: e.target.value })} className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500" />
                <input type="text" placeholder="Bed Number" value={formData.bedNumber} onChange={(e) => setFormData({ ...formData, bedNumber: e.target.value })} className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500" />
                <input type="text" placeholder="Warden Name" value={formData.wardenName} onChange={(e) => setFormData({ ...formData, wardenName: e.target.value })} className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500" />
                <input type="tel" placeholder="Warden Contact" value={formData.wardenContact} onChange={(e) => setFormData({ ...formData, wardenContact: e.target.value })} className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500" />
                <select value={formData.roomType} onChange={(e) => setFormData({ ...formData, roomType: e.target.value })} className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500">
                  <option value="">Room Type</option>
                  <option value="AC">AC</option>
                  <option value="Non-AC">Non-AC</option>
                </select>
                <input type="text" placeholder="Mess Plan" value={formData.messPlan} onChange={(e) => setFormData({ ...formData, messPlan: e.target.value })} className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500" />
                <input type="date" placeholder="Hostel Admission Date" value={formData.hostelAdmissionDate} onChange={(e) => setFormData({ ...formData, hostelAdmissionDate: e.target.value })} className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500" />
                <input type="text" placeholder="Hostel Fee Details" value={formData.hostelFee} onChange={(e) => setFormData({ ...formData, hostelFee: e.target.value })} className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500" />
              </div>
            )}
          </div>

          {/* Section 8: Transport Details */}
          <div className="bg-teal-50 p-4 rounded-lg">
            <h3 className="text-lg font-bold text-teal-800 mb-4">8. Transport Details</h3>
            <label className="flex items-center gap-2 mb-4">
              <input type="checkbox" checked={formData.transportRequired} onChange={(e) => setFormData({ ...formData, transportRequired: e.target.checked })} className="w-4 h-4" />
              <span className="text-sm font-medium">Transport Required</span>
            </label>
            {formData.transportRequired && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <input type="text" placeholder="Route Number" value={formData.routeNumber} onChange={(e) => setFormData({ ...formData, routeNumber: e.target.value })} className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500" />
                <input type="text" placeholder="Pickup Point" value={formData.pickupPoint} onChange={(e) => setFormData({ ...formData, pickupPoint: e.target.value })} className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500" />
                <input type="text" placeholder="Driver Name" value={formData.driverName} onChange={(e) => setFormData({ ...formData, driverName: e.target.value })} className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500" />
                <input type="tel" placeholder="Driver Contact" value={formData.driverContact} onChange={(e) => setFormData({ ...formData, driverContact: e.target.value })} className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500" />
                <input type="text" placeholder="Bus Number" value={formData.busNumber} onChange={(e) => setFormData({ ...formData, busNumber: e.target.value })} className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500" />
                <input type="text" placeholder="Transport Fee" value={formData.transportFee} onChange={(e) => setFormData({ ...formData, transportFee: e.target.value })} className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500" />
              </div>
            )}
          </div>

          {/* Section 9: Documents Upload */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-bold text-gray-800 mb-4">9. Important Documents Upload</h3>
            <div className="space-y-3">
              <p className="text-sm font-semibold text-gray-700">Mandatory Documents:</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {['aadhaarCard', 'communityCert', 'residentialCert', 'previousTC', 'passportPhoto'].map(doc => (
                  <div key={doc}>
                    <label className="block text-xs mb-1 capitalize">{doc.replace(/([A-Z])/g, ' $1')}</label>
                    <input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={(e) => handleDocumentUpload(e, doc)} className="w-full text-sm border rounded-lg p-2" />
                  </div>
                ))}
              </div>
              <p className="text-sm font-semibold text-gray-700 mt-4">Optional Documents:</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {['panCard', 'bankPassbook', 'marksheet10', 'marksheet12', 'birthCert', 'incomeCert', 'scholarshipDocs', 'transferCert', 'migrationCert'].map(doc => (
                  <div key={doc}>
                    <label className="block text-xs mb-1 capitalize">{doc.replace(/([A-Z])/g, ' $1')}</label>
                    <input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={(e) => handleDocumentUpload(e, doc)} className="w-full text-sm border rounded-lg p-2" />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Section 10: Bank Details */}
          <div className="bg-cyan-50 p-4 rounded-lg">
            <h3 className="text-lg font-bold text-cyan-800 mb-4">10. Bank Details</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <input type="text" placeholder="Bank Name" value={formData.bankName} onChange={(e) => setFormData({ ...formData, bankName: e.target.value })} className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500" />
              <input type="text" placeholder="Account Holder Name" value={formData.accountHolder} onChange={(e) => setFormData({ ...formData, accountHolder: e.target.value })} className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500" />
              <input type="text" placeholder="Account Number" value={formData.accountNumber} onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })} className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500" />
              <input type="text" placeholder="IFSC Code" value={formData.ifscCode} onChange={(e) => setFormData({ ...formData, ifscCode: e.target.value })} className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500" />
              <input type="text" placeholder="Branch Name" value={formData.branchName} onChange={(e) => setFormData({ ...formData, branchName: e.target.value })} className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500" />
              <input type="text" placeholder="UPI ID (Optional)" value={formData.upiId} onChange={(e) => setFormData({ ...formData, upiId: e.target.value })} className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>

          {/* Section 11: Login Credentials */}
          <div className="bg-purple-50 p-4 rounded-lg">
            <h3 className="text-lg font-bold text-purple-800 mb-4">11. Login Credentials</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Email Address *</label>
                <input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500" required />
              </div>
              {!editingStudent && (
                <div>
                  <label className="block text-sm font-medium mb-2">Password *</label>
                  <input type="password" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} minLength="6" className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500" required />
                </div>
              )}
            </div>
          </div>
          </div>
          
          {/* Fixed Buttons */}
          <div className="sticky bottom-0 bg-white pt-4 pb-2 border-t flex gap-3">
            <button type="submit" className="flex-1 bg-blue-500 text-white py-3 min-h-[48px] rounded-lg hover:bg-blue-600">
              {editingStudent ? 'Update Student' : 'Create Student'}
            </button>
            <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 bg-gray-300 text-gray-700 py-3 min-h-[48px] rounded-lg hover:bg-gray-400">
              Cancel
            </button>
          </div>
        </form>
      </Modal>

      <StudentDetailsModal
        student={selectedStudent}
        isOpen={isStudentModalOpen}
        onClose={() => setIsStudentModalOpen(false)}
      />
    </div>
  );
};

export default StudentsTab;
