import { useState, useEffect } from 'react';
import { Edit, Trash2, Plus, Search, Filter } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import Table from '../components/Table';
import Modal from '../components/Modal';
import StudentDetailsModal from '../components/StudentDetailsModal';
import { userAPI, classAPI } from '../services/api';

const AdminStudents = () => {
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
    name: '', email: '', password: '', phone: '', class: '', section: '', rollNumber: ''
  });

  useEffect(() => {
    fetchStudents();
    fetchClasses();
  }, [search]);

  useEffect(() => {
    applyFilters();
  }, [students, filterClass, filterSection]);

  const applyFilters = () => {
    let filtered = students;
    
    if (filterClass) {
      filtered = filtered.filter(student => student.class === filterClass);
    }
    
    if (filterSection) {
      filtered = filtered.filter(student => student.section === filterSection);
    }
    
    setFilteredStudents(filtered);
  };

  const fetchClasses = async () => {
    try {
      const res = await classAPI.getClasses();
      // Store raw class data for section filtering
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
    setFormData({ name: '', email: '', password: '', phone: '', class: '', section: '', rollNumber: '' });
    setSelectedClassName('');
    setAvailableSections([]);
    setEditingStudent(null);
  };

  const handleClassNameSelection = (className) => {
    setSelectedClassName(className);
    setFormData(prev => ({ ...prev, class: className, section: '' }));
    
    // Get available sections for this class from individual class records
    const classesForName = classes.filter(cls => cls.className === className);
    const sections = classesForName.map(cls => cls.section).filter(Boolean);
    const uniqueSections = [...new Set(sections)].sort();
    setAvailableSections(uniqueSections);
    
    console.log('Selected class:', className);
    console.log('Available classes:', classesForName);
    console.log('Available sections:', uniqueSections);
  };

  const handleSectionSelection = (section) => {
    setFormData(prev => ({ ...prev, section }));
  };

  const openEditModal = (student) => {
    setEditingStudent(student);
    setFormData(student);
    
    // Set class name and available sections
    if (student.class) {
      setSelectedClassName(student.class);
      const classesForName = classes.filter(cls => cls.className === student.class);
      const sections = classesForName.map(cls => cls.section).filter(Boolean);
      const uniqueSections = [...new Set(sections)].sort();
      setAvailableSections(uniqueSections);
    }
    
    setIsModalOpen(true);
  };

  const openStudentDetails = (student) => {
    setSelectedStudent(student);
    setIsStudentModalOpen(true);
  };

  const getUniqueClasses = () => {
    return [...new Set(students.map(s => s.class).filter(Boolean))].sort();
  };

  const getUniqueSections = () => {
    return [...new Set(students.map(s => s.section).filter(Boolean))].sort();
  };

  const clearFilters = () => {
    setFilterClass('');
    setFilterSection('');
  };

  const columns = [
    { header: 'Name', accessor: 'name' },
    { header: 'Email', accessor: 'email' },
    { header: 'Class', accessor: 'class' },
    { header: 'Section', accessor: 'section' },
    { header: 'Roll No', accessor: 'rollNumber' }
  ];

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 lg:ml-64 transition-all duration-300">
        <Navbar />
        <div className="p-4 lg:p-6">

          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 gap-3">
            <h1 className="text-2xl font-bold">Students Management</h1>
            <button
              onClick={() => { resetForm(); setIsModalOpen(true); }}
              className="bg-blue-500 text-white px-6 py-3 min-h-[48px] rounded-lg flex items-center justify-center gap-2 hover:bg-blue-600 active:bg-blue-700 transition-colors w-full sm:w-auto text-base font-medium"
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
              className="w-full pl-12 pr-4 py-3 min-h-[48px] text-base border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Filter Section */}
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
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                  onClick={clearFilters}
                  className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Clear Filters
                </button>
              </div>
            </div>
            
            <div className="mt-4 text-sm text-gray-600">
              Showing {filteredStudents.length} of {students.length} students
              {(filterClass || filterSection) && (
                <span className="ml-2 text-blue-600 font-medium">(Filtered)</span>
              )}
            </div>
          </div>

          {/* Desktop Table View */}
          <div className="hidden md:block bg-white rounded-lg shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Class</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Section</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Roll No</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredStudents.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="px-4 py-8 text-center text-gray-500">
                        {(filterClass || filterSection) ? 'No students match the selected filters' : 'No students found'}
                      </td>
                    </tr>
                  ) : (
                    filteredStudents.map((student) => (
                      <tr key={student._id} className="hover:bg-gray-50">
                        <td className="px-4 py-4 text-sm font-medium text-gray-900">
                          <button
                            onClick={() => openStudentDetails(student)}
                            className="text-blue-600 hover:text-blue-800 hover:underline cursor-pointer"
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
                            <button 
                              onClick={() => openEditModal(student)} 
                              className="text-blue-500 hover:text-blue-700 p-2 rounded hover:bg-blue-50 transition-colors"
                              aria-label="Edit student"
                            >
                              <Edit size={18} />
                            </button>
                            <button 
                              onClick={() => handleDelete(student._id)} 
                              className="text-red-500 hover:text-red-700 p-2 rounded hover:bg-red-50 transition-colors"
                              aria-label="Delete student"
                            >
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
          </div>

          {/* Mobile Card View */}
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
                        className="text-lg font-semibold text-blue-600 hover:text-blue-800 hover:underline cursor-pointer mb-1 text-left"
                      >
                        {student.name}
                      </button>
                      <p className="text-sm text-gray-600 mb-2">{student.email}</p>
                    </div>
                    <div className="flex gap-2 ml-4">
                      <button 
                        onClick={() => openEditModal(student)} 
                        className="text-blue-500 hover:text-blue-700 p-3 min-w-[48px] min-h-[48px] rounded-lg hover:bg-blue-50 active:bg-blue-100 transition-colors flex items-center justify-center"
                        aria-label="Edit student"
                      >
                        <Edit size={20} />
                      </button>
                      <button 
                        onClick={() => handleDelete(student._id)} 
                        className="text-red-500 hover:text-red-700 p-3 min-w-[48px] min-h-[48px] rounded-lg hover:bg-red-50 active:bg-red-100 transition-colors flex items-center justify-center"
                        aria-label="Delete student"
                      >
                        <Trash2 size={20} />
                      </button>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="font-medium text-gray-700">Class:</span>
                      <span className="ml-2 text-gray-600">{student.class || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Section:</span>
                      <span className="ml-2 text-gray-600">{student.section || 'N/A'}</span>
                    </div>
                    <div className="col-span-2">
                      <span className="font-medium text-gray-700">Roll Number:</span>
                      <span className="ml-2 text-gray-600">{student.rollNumber || 'N/A'}</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingStudent ? 'Edit Student' : 'Add Student'}>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Full Name *</label>
                <input
                  type="text"
                  placeholder="Enter student name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 min-h-[48px] text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email Address *</label>
                <input
                  type="email"
                  placeholder="Enter email address"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-3 min-h-[48px] text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              
              {!editingStudent && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Password *</label>
                  <input
                    type="password"
                    placeholder="Enter password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full px-4 py-3 min-h-[48px] text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
              )}
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                <input
                  type="tel"
                  placeholder="Enter phone number"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-4 py-3 min-h-[48px] text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Class *</label>
                  <select
                    value={selectedClassName}
                    onChange={(e) => handleClassNameSelection(e.target.value)}
                    className="w-full px-4 py-3 min-h-[48px] text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    <option value="">Select Class</option>
                    {[...new Set(classes.map(cls => cls.className).filter(Boolean))].sort().map(className => (
                      <option key={className} value={className}>
                        Class {className}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Section *</label>
                  <select
                    value={formData.section}
                    onChange={(e) => handleSectionSelection(e.target.value)}
                    className="w-full px-4 py-3 min-h-[48px] text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                    required
                    disabled={!selectedClassName}
                  >
                    <option value="">Select Section</option>
                    {availableSections.map(section => (
                      <option key={section} value={section}>
                        Section {section}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Roll Number</label>
                <input
                  type="text"
                  placeholder="Enter roll number"
                  value={formData.rollNumber}
                  onChange={(e) => setFormData({ ...formData, rollNumber: e.target.value })}
                  className="w-full px-4 py-3 min-h-[48px] text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <button 
                  type="submit" 
                  className="flex-1 bg-blue-500 text-white py-3 min-h-[48px] text-base font-medium rounded-lg hover:bg-blue-600 active:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  {editingStudent ? 'Update Student' : 'Create Student'}
                </button>
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 sm:flex-none sm:px-6 bg-gray-300 text-gray-700 py-3 min-h-[48px] text-base font-medium rounded-lg hover:bg-gray-400 active:bg-gray-500 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                >
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
      </div>
    </div>
  );
};

export default AdminStudents;