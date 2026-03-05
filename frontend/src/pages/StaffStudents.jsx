import { useState, useEffect, useContext } from 'react';
import { Search, Filter, Eye, Users, BookOpen, Phone } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import StudentDetailsModal from '../components/StudentDetailsModal';
import { userAPI, classAPI } from '../services/api';
import { AuthContext } from '../context/AuthContext';

const StaffStudents = () => {
  const { user } = useContext(AuthContext);
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [search, setSearch] = useState('');
  const [filterClass, setFilterClass] = useState('');
  const [filterSection, setFilterSection] = useState('');
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  useEffect(() => {
    fetchStudents();
    fetchClasses();
  }, [search]);

  useEffect(() => {
    applyFilters();
  }, [students, filterClass, filterSection]);

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
      const res = await userAPI.getUsers({ role: 'student', search });
      const studentData = res.data.data || res.data || [];
      setStudents(Array.isArray(studentData) ? studentData : []);
      setFilteredStudents(Array.isArray(studentData) ? studentData : []);
    } catch (error) {
      console.error('Error fetching students:', error);
      setStudents([]);
      setFilteredStudents([]);
    }
  };

  const applyFilters = () => {
    if (!Array.isArray(students)) return;
    let filtered = students;
    if (filterClass) filtered = filtered.filter(student => student.class === filterClass);
    if (filterSection) filtered = filtered.filter(student => student.section === filterSection);
    setFilteredStudents(filtered);
  };

  const getUniqueClasses = () => {
    if (!Array.isArray(students)) return [];
    return [...new Set(students.map(s => s.class).filter(Boolean))].sort();
  };
  const getUniqueSections = () => {
    if (!Array.isArray(students)) return [];
    return [...new Set(students.map(s => s.section).filter(Boolean))].sort();
  };

  const openStudentDetails = (student) => {
    setSelectedStudent(student);
    setIsDetailModalOpen(true);
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 lg:ml-64 transition-all duration-300">
        <Navbar />
        <div className="p-4 lg:p-6">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 gap-3">
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <Users className="text-blue-600" size={28} />
                My Students
              </h1>
              <p className="text-gray-600 mt-1">View and manage student information</p>
            </div>
          </div>

          <div className="mb-6 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search by name, email, roll number..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-3 min-h-[48px] text-base border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                <select value={filterClass} onChange={(e) => setFilterClass(e.target.value)} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500">
                  <option value="">All Classes</option>
                  {getUniqueClasses().map(cls => <option key={cls} value={cls}>Class {cls}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Section</label>
                <select value={filterSection} onChange={(e) => setFilterSection(e.target.value)} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500">
                  <option value="">All Sections</option>
                  {getUniqueSections().map(section => <option key={section} value={section}>Section {section}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">&nbsp;</label>
                <button onClick={() => { setFilterClass(''); setFilterSection(''); }} className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200">
                  Clear Filters
                </button>
              </div>
            </div>
            <div className="mt-4 text-sm text-gray-600">
              Showing {filteredStudents.length} of {students.length} students
              {(filterClass || filterSection) && <span className="ml-2 text-blue-600 font-medium">(Filtered)</span>}
            </div>
          </div>

          <div className="hidden md:block bg-white rounded-lg shadow-md overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Student</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Class & Section</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Roll No</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Parent Contact</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredStudents.length === 0 ? (
                  <tr><td colSpan="5" className="px-4 py-8 text-center text-gray-500">{(filterClass || filterSection) ? 'No students match filters' : 'No students found'}</td></tr>
                ) : (
                  filteredStudents.map((student) => (
                    <tr key={student._id} className="hover:bg-gray-50">
                      <td className="px-4 py-4">
                        <div className="flex items-center">
                          {student.profilePhoto ? (
                            <img src={student.profilePhoto} alt={student.name} className="w-10 h-10 rounded-full object-cover mr-3" />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                              <span className="text-blue-600 font-semibold text-sm">{student.name?.charAt(0)?.toUpperCase()}</span>
                            </div>
                          )}
                          <div>
                            <div className="text-sm font-medium text-gray-900">{student.name}</div>
                            <div className="text-sm text-gray-500">{student.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-500">
                        <div className="flex items-center gap-2">
                          <BookOpen size={16} className="text-blue-500" />
                          <span>Class {student.class || 'N/A'} - {student.section || 'N/A'}</span>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-500">{student.rollNumber || 'N/A'}</td>
                      <td className="px-4 py-4 text-sm text-gray-500">
                        {student.fatherContact && (
                          <div className="flex items-center gap-1">
                            <Phone size={14} />
                            <span>{student.fatherContact}</span>
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-4 text-sm">
                        <button onClick={() => openStudentDetails(student)} className="text-blue-500 hover:text-blue-700 p-2 rounded hover:bg-blue-50 flex items-center gap-1">
                          <Eye size={16} />
                          <span>View</span>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="md:hidden space-y-4">
            {filteredStudents.length === 0 ? (
              <div className="bg-white rounded-lg shadow-md p-6 text-center text-gray-500">{(filterClass || filterSection) ? 'No students match filters' : 'No students found'}</div>
            ) : (
              filteredStudents.map((student) => (
                <div key={student._id} className="bg-white rounded-lg shadow-md p-4">
                  <div className="flex items-start gap-3 mb-3">
                    {student.profilePhoto ? (
                      <img src={student.profilePhoto} alt={student.name} className="w-12 h-12 rounded-full object-cover" />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                        <span className="text-blue-600 font-semibold">{student.name?.charAt(0)?.toUpperCase()}</span>
                      </div>
                    )}
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900">{student.name}</h3>
                      <p className="text-sm text-gray-600">{student.email}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <BookOpen size={14} className="text-blue-500" />
                        <span className="text-sm text-gray-600">Class {student.class || 'N/A'} - {student.section || 'N/A'}</span>
                      </div>
                    </div>
                  </div>
                  <button onClick={() => openStudentDetails(student)} className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 flex items-center justify-center gap-2">
                    <Eye size={16} />
                    View Full Details
                  </button>
                </div>
              ))
            )}
          </div>

          <StudentDetailsModal student={selectedStudent} isOpen={isDetailModalOpen} onClose={() => setIsDetailModalOpen(false)} />
        </div>
      </div>
    </div>
  );
};

export default StaffStudents;
