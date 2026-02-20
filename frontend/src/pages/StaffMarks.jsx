import { useState, useEffect } from 'react';
import { Plus, Edit, Users, Search, Filter } from 'lucide-react';
import Layout from '../components/Layout';
import Table from '../components/Table';
import Modal from '../components/Modal';
import StudentDetailsModal from '../components/StudentDetailsModal';
import { markAPI, userAPI, subjectAPI } from '../services/api';

const StaffMarks = () => {
  const [marks, setMarks] = useState([]);
  const [students, setStudents] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMark, setEditingMark] = useState(null);
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSection, setSelectedSection] = useState('');
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterClass, setFilterClass] = useState('');
  const [filterSection, setFilterSection] = useState('');
  const [filteredMarks, setFilteredMarks] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [isStudentModalOpen, setIsStudentModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    student: '', subject: '', examType: '', marks: '', totalMarks: '', grade: ''
  });

  useEffect(() => {
    fetchMarks();
    userAPI.getUsers({ role: 'student' }).then(res => setStudents(res.data));
    subjectAPI.getSubjects().then(res => setSubjects(res.data));
  }, []);

  useEffect(() => {
    if (selectedClass && selectedSection) {
      const filtered = students.filter(student => 
        student.class === selectedClass && student.section === selectedSection
      );
      setFilteredStudents(filtered);
    } else {
      setFilteredStudents([]);
    }
  }, [selectedClass, selectedSection, students]);

  // Auto-search with debounce effect
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      handleSearch();
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [filterClass, filterSection, searchTerm]);

  const fetchMarks = (params = {}) => {
    markAPI.getMarks(params).then(res => {
      setMarks(res.data);
      setFilteredMarks(res.data);
    });
  };

  const handleSearch = () => {
    const params = {};
    if (filterClass) params.class = filterClass;
    if (filterSection) params.section = filterSection;
    if (searchTerm) params.search = searchTerm;
    
    fetchMarks(params);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingMark) {
        await markAPI.updateMark(editingMark._id, formData);
      } else {
        await markAPI.createMark(formData);
      }
      fetchMarks();
      setIsModalOpen(false);
      resetForm();
    } catch (error) {
      alert(error.response?.data?.message || 'Operation failed');
    }
  };

  const resetForm = () => {
    setFormData({ student: '', subject: '', examType: '', marks: '', totalMarks: '', grade: '' });
    setEditingMark(null);
    setSelectedClass('');
    setSelectedSection('');
    setFilteredStudents([]);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setFilterClass('');
    setFilterSection('');
    fetchMarks(); // Fetch all marks without filters
  };

  const getUniqueClasses = () => {
    return [...new Set(students.map(s => s.class).filter(Boolean))].sort();
  };

  const getUniqueSections = () => {
    return [...new Set(students.map(s => s.section).filter(Boolean))].sort();
  };

  const openEditModal = (mark) => {
    setEditingMark(mark);
    setFormData({
      student: mark.student._id,
      subject: mark.subject._id,
      examType: mark.examType,
      marks: mark.marks,
      totalMarks: mark.totalMarks,
      grade: mark.grade
    });
    setIsModalOpen(true);
  };

  const openStudentDetails = (student) => {
    setSelectedStudent(student);
    setIsStudentModalOpen(true);
  };

  const columns = [
    { header: 'Student', render: (row) => (
      <div className="min-w-0">
        <button
          onClick={() => openStudentDetails(row.student)}
          className="font-medium text-blue-600 hover:text-blue-800 text-sm truncate block max-w-[100px] sm:max-w-none"
        >
          {row.student?.name}
        </button>
        <div className="text-xs text-gray-500">
          {row.student?.class}-{row.student?.section}
          {row.student?.rollNumber && (
            <span className="hidden sm:inline"> • {row.student.rollNumber}</span>
          )}
        </div>
      </div>
    )},
    { header: 'Subject', render: (row) => (
      <div className="min-w-0">
        <div className="font-medium text-sm truncate max-w-[80px] sm:max-w-none">{row.subject?.name}</div>
        <div className="text-xs text-gray-500 truncate">{row.examType}</div>
      </div>
    )},
    { header: 'Score', render: (row) => (
      <div className="text-center">
        <div className="font-semibold text-sm">{row.marks}/{row.totalMarks}</div>
        <div className="text-xs text-gray-500">{((row.marks/row.totalMarks)*100).toFixed(1)}%</div>
      </div>
    )},
    { header: 'Grade', render: (row) => (
      <span className={`px-2 py-1 rounded text-xs font-medium ${
        row.grade === 'A' || row.grade === 'A+' ? 'bg-green-100 text-green-800' :
        row.grade === 'B' || row.grade === 'B+' ? 'bg-blue-100 text-blue-800' :
        row.grade === 'C' || row.grade === 'C+' ? 'bg-yellow-100 text-yellow-800' :
        row.grade === 'D' ? 'bg-orange-100 text-orange-800' :
        row.grade === 'F' ? 'bg-red-100 text-red-800' :
        'bg-gray-100 text-gray-800'
      }`}>
        {row.grade || 'N/A'}
      </span>
    )}
  ];

  return (
    <Layout title={<div className="flex items-center gap-2"><Edit className="text-blue-600" />Marks Management</div>}>
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 gap-4">
        <div>
          <p className="text-sm lg:text-base text-gray-600">Add and manage student marks by class and section</p>
        </div>
        <button
          onClick={() => { resetForm(); setIsModalOpen(true); }}
          className="bg-blue-500 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2 hover:bg-blue-600 w-full sm:w-auto"
        >
          <Plus size={20} /> Add Marks
        </button>
      </div>

          {/* Search and Filter Section */}
          <div className="bg-white rounded-lg shadow-md p-4 mb-6">
            <div className="flex items-center gap-2 mb-4">
              <Filter size={16} className="text-gray-600" />
              <h3 className="text-base font-semibold text-gray-800">Search & Filter</h3>
            </div>
            
            <div className="space-y-4">
              {/* Search Input */}
              <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search students, subjects..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Class Filter */}
                <select
                  value={filterClass}
                  onChange={(e) => setFilterClass(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                >
                  <option value="">All Classes</option>
                  {getUniqueClasses().map(cls => (
                    <option key={cls} value={cls}>Class {cls}</option>
                  ))}
                </select>

                {/* Section Filter */}
                <select
                  value={filterSection}
                  onChange={(e) => setFilterSection(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                >
                  <option value="">All Sections</option>
                  {getUniqueSections().map(section => (
                    <option key={section} value={section}>Section {section}</option>
                  ))}
                </select>

                {/* Clear Filters Button */}
                <button
                  onClick={clearFilters}
                  className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm"
                >
                  Clear Filters
                </button>
              </div>
            </div>

            {/* Results Summary */}
            <div className="mt-4 text-sm text-gray-600">
              <span>Showing {filteredMarks.length} marks</span>
              {(filterClass || filterSection || searchTerm) && (
                <span className="ml-2 text-blue-600 font-medium">(Filtered)</span>
              )}
            </div>
          </div>

          {/* Quick Stats */}
          {filteredMarks.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
              <div className="bg-white rounded-lg shadow-md p-4">
                <div className="text-2xl font-bold text-blue-600">
                  {[...new Set(filteredMarks.map(m => m.student?._id))].length}
                </div>
                <div className="text-sm text-gray-600">Students</div>
              </div>
              <div className="bg-white rounded-lg shadow-md p-4">
                <div className="text-2xl font-bold text-green-600">
                  {[...new Set(filteredMarks.map(m => m.subject?._id))].length}
                </div>
                <div className="text-sm text-gray-600">Subjects</div>
              </div>
              <div className="bg-white rounded-lg shadow-md p-4">
                <div className="text-2xl font-bold text-purple-600">
                  {[...new Set(filteredMarks.map(m => m.examType))].length}
                </div>
                <div className="text-sm text-gray-600">Exam Types</div>
              </div>
              <div className="bg-white rounded-lg shadow-md p-4">
                <div className="text-2xl font-bold text-orange-600">
                  {filteredMarks.length > 0 ? 
                    Math.round(filteredMarks.reduce((acc, m) => acc + (m.marks/m.totalMarks)*100, 0) / filteredMarks.length) 
                    : 0}%
                </div>
                <div className="text-sm text-gray-600">Avg Score</div>
              </div>
            </div>
          )}

          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            {filteredMarks.length === 0 ? (
              <div className="text-center py-8 lg:py-12 px-4">
                <Users size={32} lg:size={48} className="mx-auto text-gray-400 mb-4" />
                <h3 className="text-base lg:text-lg font-medium text-gray-900 mb-2">No marks found</h3>
                <p className="text-sm lg:text-base text-gray-500 mb-4">
                  {(filterClass || filterSection || searchTerm) ? 
                    'No marks match your current filters. Try adjusting your search criteria.' :
                    'No marks have been added yet. Click "Add Marks" to get started.'
                  }
                </p>
                {(filterClass || filterSection || searchTerm) && (
                  <button
                    onClick={clearFilters}
                    className="text-blue-500 hover:text-blue-700 font-medium text-sm lg:text-base"
                  >
                    Clear all filters
                  </button>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table
                  columns={columns}
                  data={filteredMarks}
                  actions={(mark) => (
                    <button 
                      onClick={() => openEditModal(mark)} 
                      className="text-blue-500 hover:text-blue-700 p-2 rounded"
                      title="Edit"
                    >
                      <Edit size={16} />
                    </button>
                  )}
                />
              </div>
            )}
          </div>

          <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingMark ? 'Edit Marks' : 'Add Marks'}>
            <form onSubmit={handleSubmit} className="space-y-4">
              {!editingMark && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Class *</label>
                      <select
                        value={selectedClass}
                        onChange={(e) => setSelectedClass(e.target.value)}
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                        required
                      >
                        <option value="">Select Class</option>
                        {getUniqueClasses().map(cls => (
                          <option key={cls} value={cls}>Class {cls}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Section *</label>
                      <select
                        value={selectedSection}
                        onChange={(e) => setSelectedSection(e.target.value)}
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                        required
                        disabled={!selectedClass}
                      >
                        <option value="">Select Section</option>
                        {getUniqueSections().map(section => (
                          <option key={section} value={section}>Section {section}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {filteredStudents.length > 0 && (
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex items-center gap-2 mb-3">
                        <Users size={16} className="text-gray-600" />
                        <span className="text-sm font-medium text-gray-700">
                          Students in Class {selectedClass} - Section {selectedSection} ({filteredStudents.length})
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto">
                        {filteredStudents.map(student => (
                          <div key={student._id} className="text-sm text-gray-600 bg-white p-2 rounded border">
                            {student.name} (Roll: {student.rollNumber})
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}

              <div>
                <label className="block text-sm font-medium mb-2">Student *</label>
                <select
                  value={formData.student}
                  onChange={(e) => setFormData({ ...formData, student: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                  disabled={!editingMark && filteredStudents.length === 0}
                >
                  <option value="">Select Student</option>
                  {(editingMark ? students : filteredStudents).map(s => (
                    <option key={s._id} value={s._id}>
                      {s.name} {s.rollNumber && `(Roll: ${s.rollNumber})`}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Subject *</label>
                <select
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Select Subject</option>
                  {subjects.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Exam Type *</label>
                <input
                  type="text"
                  placeholder="e.g., Midterm, Final, Quiz"
                  value={formData.examType}
                  onChange={(e) => setFormData({ ...formData, examType: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Marks Obtained *</label>
                  <input
                    type="number"
                    placeholder="85"
                    value={formData.marks}
                    onChange={(e) => setFormData({ ...formData, marks: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Total Marks *</label>
                  <input
                    type="number"
                    placeholder="100"
                    value={formData.totalMarks}
                    onChange={(e) => setFormData({ ...formData, totalMarks: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Grade</label>
                <input
                  type="text"
                  placeholder="A, B+, C, etc."
                  value={formData.grade}
                  onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <button 
                type="submit" 
                className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 disabled:opacity-50"
                disabled={!editingMark && (!selectedClass || !selectedSection || filteredStudents.length === 0)}
              >
                {editingMark ? 'Update Marks' : 'Add Marks'}
              </button>
            </form>
          </Modal>

      <StudentDetailsModal
        student={selectedStudent}
        isOpen={isStudentModalOpen}
        onClose={() => setIsStudentModalOpen(false)}
      />
    </Layout>
  );
};

export default StaffMarks;
