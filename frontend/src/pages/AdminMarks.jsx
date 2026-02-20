import { useState, useEffect } from 'react';
import { Search, Filter, Users, BookOpen } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import Table from '../components/Table';
import StudentDetailsModal from '../components/StudentDetailsModal';
import { markAPI, userAPI, subjectAPI } from '../services/api';

const AdminMarks = () => {
  const [marks, setMarks] = useState([]);
  const [students, setStudents] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [filteredMarks, setFilteredMarks] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterClass, setFilterClass] = useState('');
  const [filterSection, setFilterSection] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [showTable, setShowTable] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [isStudentModalOpen, setIsStudentModalOpen] = useState(false);

  useEffect(() => {
    userAPI.getUsers({ role: 'student' }).then(res => setStudents(res.data));
    subjectAPI.getSubjects().then(res => setSubjects(res.data));
  }, []);

  // Auto-search with debounce effect
  useEffect(() => {
    if (filterClass || filterSection || searchTerm || selectedSubject) {
      const timeoutId = setTimeout(() => {
        handleSearch();
      }, 500);
      return () => clearTimeout(timeoutId);
    }
  }, [filterClass, filterSection, searchTerm, selectedSubject]);

  const fetchMarks = (params = {}) => {
    markAPI.getMarks(params).then(res => {
      setMarks(res.data);
      setFilteredMarks(res.data);
      setShowTable(true);
    });
  };

  const handleSearch = () => {
    const params = {};
    if (filterClass) params.class = filterClass;
    if (filterSection) params.section = filterSection;
    if (selectedSubject) params.subject = selectedSubject;
    if (searchTerm) params.search = searchTerm;
    
    fetchMarks(params);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setFilterClass('');
    setFilterSection('');
    setSelectedSubject('');
    setShowTable(false);
    setMarks([]);
    setFilteredMarks([]);
  };

  const getUniqueClasses = () => {
    return [...new Set(students.map(s => s.class).filter(Boolean))].sort();
  };

  const getUniqueSections = () => {
    return [...new Set(students.map(s => s.section).filter(Boolean))].sort();
  };

  const openStudentDetails = (student) => {
    setSelectedStudent(student);
    setIsStudentModalOpen(true);
  };

  const columns = [
    { header: 'Student', render: (row) => (
      <div>
        <button
          onClick={() => openStudentDetails(row.student)}
          className="font-medium text-blue-600 hover:text-blue-800 hover:underline cursor-pointer"
        >
          {row.student?.name}
        </button>
        <div className="text-sm text-gray-500">
          Class {row.student?.class} - {row.student?.section}
          {row.student?.rollNumber && ` • Roll: ${row.student.rollNumber}`}
        </div>
      </div>
    )},
    { header: 'Subject', render: (row) => row.subject?.name },
    { header: 'Exam Type', accessor: 'examType' },
    { header: 'Marks', render: (row) => (
      <div className="text-center">
        <span className="font-semibold">{row.marks}/{row.totalMarks}</span>
        <div className="text-sm text-gray-500">{((row.marks/row.totalMarks)*100).toFixed(1)}%</div>
      </div>
    )},
    { header: 'Grade', render: (row) => (
      <span className={`px-2 py-1 rounded text-sm font-medium ${
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
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 lg:ml-64 transition-all duration-300">
        <Navbar />
        <div className="p-4 lg:p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold">Marks Overview</h1>
            <p className="text-base text-gray-600">View and monitor all student marks by class and section</p>
          </div>

          {/* Search and Filter Section */}
          <div className="bg-white rounded-lg shadow-md p-4 mb-6">
            <div className="flex items-center gap-2 mb-4">
              <Filter size={20} className="text-gray-600" />
              <h3 className="text-lg font-semibold text-gray-800">Search by Classification</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              {/* Class Filter */}
              <div>
                <label className="block text-sm font-medium mb-2">Class *</label>
                <select
                  value={filterClass}
                  onChange={(e) => setFilterClass(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select Class</option>
                  {getUniqueClasses().map(cls => (
                    <option key={cls} value={cls}>Class {cls}</option>
                  ))}
                </select>
              </div>

              {/* Section Filter */}
              <div>
                <label className="block text-sm font-medium mb-2">Section</label>
                <select
                  value={filterSection}
                  onChange={(e) => setFilterSection(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={!filterClass}
                >
                  <option value="">All Sections</option>
                  {getUniqueSections().map(section => (
                    <option key={section} value={section}>Section {section}</option>
                  ))}
                </select>
              </div>

              {/* Subject Filter */}
              <div>
                <label className="block text-sm font-medium mb-2">Subject</label>
                <select
                  value={selectedSubject}
                  onChange={(e) => setSelectedSubject(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">All Subjects</option>
                  {subjects.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
                </select>
              </div>

              {/* Search Input */}
              <div>
                <label className="block text-sm font-medium mb-2">Search</label>
                <div className="relative">
                  <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Student name, exam type..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Clear Filters Button */}
              <div>
                <label className="block text-sm font-medium mb-2">&nbsp;</label>
                <button
                  onClick={clearFilters}
                  className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Clear All
                </button>
              </div>
            </div>

            {/* Results Summary */}
            <div className="mt-4 flex items-center justify-between text-sm text-gray-600">
              <span>
                {showTable ? `Showing ${filteredMarks.length} marks` : 'Select class to view marks'}
                {(filterClass || filterSection || searchTerm || selectedSubject) && showTable && (
                  <span className="ml-2 text-blue-600 font-medium">
                    (Filtered)
                  </span>
                )}
              </span>
              {filterClass && (
                <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                  Class {filterClass}
                  {filterSection && ` - Section ${filterSection}`}
                </span>
              )}
            </div>
          </div>

          {/* Quick Stats */}
          {showTable && filteredMarks.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
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

          {/* Table Section */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            {!showTable ? (
              <div className="text-center py-12">
                <BookOpen size={48} className="mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Select Class to View Marks</h3>
                <p className="text-gray-500 mb-4">
                  Choose a class from the filters above to view student marks and performance data.
                </p>
              </div>
            ) : filteredMarks.length === 0 ? (
              <div className="text-center py-12">
                <Users size={48} className="mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No marks found</h3>
                <p className="text-gray-500 mb-4">
                  No marks match your current filters. Try adjusting your search criteria.
                </p>
                <button
                  onClick={clearFilters}
                  className="text-blue-500 hover:text-blue-700 font-medium"
                >
                  Clear all filters
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table columns={columns} data={filteredMarks} />
              </div>
            )}
          </div>

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

export default AdminMarks;
