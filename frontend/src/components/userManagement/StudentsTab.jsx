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
    setFormData({ name: '', email: '', password: '', phone: '', class: '', section: '', rollNumber: '' });
    setSelectedClassName('');
    setAvailableSections([]);
    setEditingStudent(null);
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
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Full Name *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-3 min-h-[48px] border rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Email *</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-4 py-3 min-h-[48px] border rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          {!editingStudent && (
            <div>
              <label className="block text-sm font-medium mb-2">Password *</label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full px-4 py-3 min-h-[48px] border rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          )}
          <div>
            <label className="block text-sm font-medium mb-2">Phone</label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full px-4 py-3 min-h-[48px] border rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Class *</label>
              <select
                value={selectedClassName}
                onChange={(e) => handleClassNameSelection(e.target.value)}
                className="w-full px-4 py-3 min-h-[48px] border rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Select Class</option>
                {[...new Set(classes.map(cls => cls.className).filter(Boolean))].sort().map(className => (
                  <option key={className} value={className}>Class {className}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Section *</label>
              <select
                value={formData.section}
                onChange={(e) => setFormData({ ...formData, section: e.target.value })}
                className="w-full px-4 py-3 min-h-[48px] border rounded-lg focus:ring-2 focus:ring-blue-500"
                required
                disabled={!selectedClassName}
              >
                <option value="">Select Section</option>
                {availableSections.map(section => (
                  <option key={section} value={section}>Section {section}</option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Roll Number</label>
            <input
              type="text"
              value={formData.rollNumber}
              onChange={(e) => setFormData({ ...formData, rollNumber: e.target.value })}
              className="w-full px-4 py-3 min-h-[48px] border rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex gap-3 pt-4">
            <button type="submit" className="flex-1 bg-blue-500 text-white py-3 min-h-[48px] rounded-lg hover:bg-blue-600">
              {editingStudent ? 'Update' : 'Create'}
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
