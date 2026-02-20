import { useState, useEffect } from 'react';
import { Edit, Trash2, Plus, Users, Search, Filter } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import Modal from '../components/Modal';
import { userAPI, classAPI } from '../services/api';

const AdminClasses = () => {
  const [classes, setClasses] = useState([]);
  const [students, setStudents] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isStudentModalOpen, setIsStudentModalOpen] = useState(false);
  const [editingClass, setEditingClass] = useState(null);
  const [selectedClassStudents, setSelectedClassStudents] = useState([]);
  const [viewingClass, setViewingClass] = useState(null);
  
  // Filters
  const [classFilter, setClassFilter] = useState('');
  const [sectionFilter, setSectionFilter] = useState('');
  const [searchFilter, setSearchFilter] = useState('');
  
  const [formData, setFormData] = useState({ 
    className: '', 
    classCode: '', 
    sections: [], 
    classTeacher: ''
  });

  useEffect(() => {
    fetchClasses();
    fetchStudents();
    fetchTeachers();
  }, []);

  const fetchClasses = async () => {
    try {
      const res = await classAPI.getClasses();
      setClasses(res.data);
    } catch (error) {
      console.error('Error fetching classes:', error);
    }
  };

  const fetchStudents = async () => {
    try {
      const res = await userAPI.getUsers({ role: 'student' });
      setStudents(res.data);
    } catch (error) {
      console.error('Error fetching students:', error);
    }
  };

  const fetchTeachers = async () => {
    try {
      const res = await userAPI.getUsers({ role: 'staff' });
      setTeachers(res.data);
    } catch (error) {
      console.error('Error fetching teachers:', error);
    }
  };

  const getStudentCount = (className, section) => {
    return students.filter(student => 
      student.class === className && student.section === section
    ).length;
  };

  const viewClassStudents = (classItem) => {
    const classStudents = students.filter(student => 
      student.class === classItem.className && student.section === classItem.section
    );
    setSelectedClassStudents(classStudents);
    setViewingClass(classItem);
    setIsStudentModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.sections.length === 0) {
      alert('Please select at least one section');
      return;
    }
    
    try {
      if (editingClass) {
        const updateData = {
          className: formData.className,
          classCode: `${formData.classCode}${formData.sections[0]}`,
          section: formData.sections[0],
          classTeacher: formData.classTeacher
        };
        await classAPI.updateClass(editingClass._id, updateData);
      } else {
        const classPromises = formData.sections.map(section => {
          const classData = {
            className: formData.className,
            classCode: `${formData.classCode}${section}`,
            section: section,
            classTeacher: formData.classTeacher
          };
          return classAPI.createClass(classData);
        });
        
        await Promise.all(classPromises);
      }
      
      await fetchClasses();
      setIsModalOpen(false);
      resetForm();
      
    } catch (error) {
      console.error('Error:', error);
      alert(error.response?.data?.message || 'Operation failed');
    }
  };

  const handleDelete = async (classItem) => {
    if (window.confirm(`Delete class ${classItem.className}-${classItem.section}?`)) {
      try {
        await classAPI.deleteClass(classItem._id);
        fetchClasses();
      } catch (error) {
        alert('Error deleting class: ' + error.message);
      }
    }
  };

  const resetForm = () => {
    setFormData({ className: '', classCode: '', sections: [], classTeacher: '' });
    setEditingClass(null);
  };

  const openEditModal = (classItem) => {
    setEditingClass(classItem);
    const baseClassCode = classItem.classCode.replace(/[A-H]$/, '');
    setFormData({
      className: classItem.className,
      classCode: baseClassCode,
      sections: [classItem.section],
      classTeacher: classItem.classTeacher?._id || ''
    });
    setIsModalOpen(true);
  };

  const handleSectionSelection = (section) => {
    setFormData(prev => ({
      ...prev,
      sections: prev.sections.includes(section)
        ? prev.sections.filter(s => s !== section)
        : [...prev.sections, section]
    }));
  };

  // Filter classes based on filters
  const filteredClasses = classes.filter(cls => {
    const matchesClass = !classFilter || cls.className === classFilter;
    const matchesSection = !sectionFilter || cls.section === sectionFilter;
    const matchesSearch = !searchFilter || 
      cls.className.toLowerCase().includes(searchFilter.toLowerCase()) ||
      cls.classCode.toLowerCase().includes(searchFilter.toLowerCase()) ||
      cls.classTeacher?.name.toLowerCase().includes(searchFilter.toLowerCase());
    
    return matchesClass && matchesSection && matchesSearch;
  });

  // Get unique class names and sections for filters
  const uniqueClassNames = [...new Set(classes.map(cls => cls.className))].sort();
  const uniqueSections = [...new Set(classes.map(cls => cls.section))].sort();

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 lg:ml-64 transition-all duration-300">
        <Navbar />
        <div className="p-4 lg:p-6">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 gap-3">
            <h1 className="text-2xl font-bold">Class Management</h1>
            <button
              onClick={() => { resetForm(); setIsModalOpen(true); }}
              className="bg-blue-500 text-white px-6 py-3 min-h-[48px] rounded-lg flex items-center justify-center gap-2 hover:bg-blue-600 active:bg-blue-700 transition-colors w-full sm:w-auto text-base font-medium"
            >
              <Plus size={20} /> Add Class
            </button>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-lg shadow-md p-4 mb-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <div>
                <label className="block text-sm font-medium mb-1">Filter by Class</label>
                <select
                  value={classFilter}
                  onChange={(e) => setClassFilter(e.target.value)}
                  className="w-full px-4 py-3 min-h-[48px] text-base border rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Classes</option>
                  {uniqueClassNames.map(className => (
                    <option key={className} value={className}>Class {className}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Filter by Section</label>
                <select
                  value={sectionFilter}
                  onChange={(e) => setSectionFilter(e.target.value)}
                  className="w-full px-4 py-3 min-h-[48px] text-base border rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Sections</option>
                  {uniqueSections.map(section => (
                    <option key={section} value={section}>Section {section}</option>
                  ))}
                </select>
              </div>
              
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium mb-1">Search</label>
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="text"
                    placeholder="Search by class, code, or teacher..."
                    value={searchFilter}
                    onChange={(e) => setSearchFilter(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 min-h-[48px] text-base border rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            {/* Desktop Table View */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Class Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Section</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Class Code</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Class Teacher</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Students</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredClasses.map((classItem) => (
                    <tr key={classItem._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{classItem.className}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{classItem.section}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{classItem.classCode}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{classItem.classTeacher?.name || 'Not Assigned'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <button 
                          onClick={() => viewClassStudents(classItem)}
                          className="bg-blue-500 text-white px-3 py-1 rounded-full hover:bg-blue-600 flex items-center gap-1"
                        >
                          <Users size={14} />
                          {getStudentCount(classItem.className, classItem.section)}
                        </button>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex gap-2">
                          <button 
                            onClick={() => openEditModal(classItem)} 
                            className="text-blue-500 hover:text-blue-700 p-2 min-w-[44px] min-h-[44px] rounded hover:bg-blue-50 active:bg-blue-100 transition-colors flex items-center justify-center"
                            aria-label="Edit class"
                          >
                            <Edit size={18} />
                          </button>
                          <button 
                            onClick={() => handleDelete(classItem)} 
                            className="text-red-500 hover:text-red-700 p-2 min-w-[44px] min-h-[44px] rounded hover:bg-red-50 active:bg-red-100 transition-colors flex items-center justify-center"
                            aria-label="Delete class"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View */}
            <div className="lg:hidden divide-y divide-gray-200">
              {filteredClasses.map((classItem) => (
                <div key={classItem._id} className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="font-medium text-lg">Class {classItem.className} - Section {classItem.section}</h3>
                      <p className="text-sm text-gray-600">{classItem.classCode}</p>
                    </div>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => openEditModal(classItem)} 
                        className="text-blue-500 hover:text-blue-700 p-2 min-w-[44px] min-h-[44px] rounded hover:bg-blue-50 active:bg-blue-100 transition-colors flex items-center justify-center"
                        aria-label="Edit class"
                      >
                        <Edit size={18} />
                      </button>
                      <button 
                        onClick={() => handleDelete(classItem)} 
                        className="text-red-500 hover:text-red-700 p-2 min-w-[44px] min-h-[44px] rounded hover:bg-red-50 active:bg-red-100 transition-colors flex items-center justify-center"
                        aria-label="Delete class"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Class Teacher:</span>
                      <span className="text-sm font-medium">{classItem.classTeacher?.name || 'Not Assigned'}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500">Total Students:</span>
                      <button 
                        onClick={() => viewClassStudents(classItem)}
                        className="bg-blue-500 text-white px-3 py-1 rounded-full hover:bg-blue-600 flex items-center gap-1 text-sm"
                      >
                        <Users size={14} />
                        {getStudentCount(classItem.className, classItem.section)}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {filteredClasses.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No classes found
              </div>
            )}
          </div>

          {/* Add/Edit Class Modal */}
          <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingClass ? 'Edit Class' : 'Add Class'}>
            <form onSubmit={handleSubmit}>
              <input
                type="text"
                placeholder="Class Name (e.g., 10, 11, 12)"
                value={formData.className}
                onChange={(e) => setFormData({ ...formData, className: e.target.value })}
                className="w-full mb-3 px-4 py-3 min-h-[48px] text-base border rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              />
              <input
                type="text"
                placeholder="Class Code (e.g., CLS10, CLS11)"
                value={formData.classCode}
                onChange={(e) => setFormData({ ...formData, classCode: e.target.value })}
                className="w-full mb-3 px-4 py-3 min-h-[48px] text-base border rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              />
              <div className="mb-3">
                <label className="block text-sm font-medium mb-2">Select Sections *</label>
                <div className="grid grid-cols-4 gap-3 p-4 border rounded-lg">
                  {['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'].map(section => (
                    <label key={section} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.sections.includes(section)}
                        onChange={() => handleSectionSelection(section)}
                        className="w-5 h-5 rounded cursor-pointer"
                      />
                      <span className="text-base font-medium">{section}</span>
                    </label>
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-1">Selected: {formData.sections.join(', ') || 'None'}</p>
              </div>
              <select
                value={formData.classTeacher}
                onChange={(e) => setFormData({ ...formData, classTeacher: e.target.value })}
                className="w-full mb-3 px-4 py-3 min-h-[48px] text-base border rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Select Class Teacher *</option>
                {teachers.map(t => <option key={t._id} value={t._id}>{t.name}</option>)}
              </select>

              <button type="submit" className="w-full bg-blue-500 text-white py-3 min-h-[48px] text-base font-medium rounded-lg hover:bg-blue-600 active:bg-blue-700 transition-colors">
                {editingClass ? 'Update' : 'Create'}
              </button>
            </form>
          </Modal>

          {/* Student List Modal */}
          <Modal 
            isOpen={isStudentModalOpen} 
            onClose={() => setIsStudentModalOpen(false)} 
            title={`Students in Class ${viewingClass?.className} - Section ${viewingClass?.section}`}
          >
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">
                  Total Students: {selectedClassStudents.length}
                </h3>
                <div className="text-sm text-gray-500">
                  Class Teacher: {viewingClass?.classTeacher?.name || 'Not Assigned'}
                </div>
              </div>
              
              {selectedClassStudents.length === 0 ? (
                <div className="text-center py-8">
                  <Users size={48} className="mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-500">No students assigned to this class yet.</p>
                </div>
              ) : (
                <div className="max-h-96 overflow-y-auto">
                  {/* Desktop Table View */}
                  <div className="hidden lg:block">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Roll No</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Phone</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Admission Date</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {selectedClassStudents.map((student) => (
                          <tr key={student._id} className="hover:bg-gray-50">
                            <td className="px-4 py-3 text-sm font-medium">{student.name}</td>
                            <td className="px-4 py-3 text-sm">{student.rollNumber}</td>
                            <td className="px-4 py-3 text-sm">{student.email}</td>
                            <td className="px-4 py-3 text-sm">{student.phone}</td>
                            <td className="px-4 py-3 text-sm">{new Date(student.createdAt).toLocaleDateString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  
                  {/* Mobile Card View */}
                  <div className="lg:hidden divide-y divide-gray-200">
                    {selectedClassStudents.map((student) => (
                      <div key={student._id} className="p-3">
                        <h4 className="font-medium text-base mb-2">{student.name}</h4>
                        <div className="space-y-1 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-500">Roll No:</span>
                            <span className="font-medium">{student.rollNumber}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-500">Email:</span>
                            <span className="font-medium">{student.email}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-500">Phone:</span>
                            <span className="font-medium">{student.phone}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-500">Admission Date:</span>
                            <span className="font-medium">{new Date(student.createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </Modal>
        </div>
      </div>
    </div>
  );
};

export default AdminClasses;