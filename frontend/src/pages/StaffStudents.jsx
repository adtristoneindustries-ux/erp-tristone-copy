import { useState, useEffect, useContext } from 'react';
import { Search, Filter, Eye, Users, BookOpen, Phone, Mail, MapPin } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
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
      setStudents(res.data);
      setFilteredStudents(res.data);
    } catch (error) {
      console.error('Error fetching students:', error);
    }
  };

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

  const openStudentDetails = (student) => {
    setSelectedStudent(student);
    setIsDetailModalOpen(true);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-IN');
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
              placeholder="Search by name, email, roll number, or admission number..."
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
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Class & Section</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Roll No</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Parent Contact</th>
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
                        <td className="px-4 py-4">
                          <div className="flex items-center">
                            {student.profilePicture ? (
                              <img 
                                src={student.profilePicture} 
                                alt={student.name}
                                className="w-10 h-10 rounded-full object-cover mr-3"
                              />
                            ) : (
                              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                                <span className="text-blue-600 font-semibold text-sm">
                                  {student.name?.charAt(0)?.toUpperCase()}
                                </span>
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
                          {student.phone && (
                            <div className="flex items-center gap-1">
                              <Phone size={14} />
                              <span>{student.phone}</span>
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-4 text-sm text-gray-500">
                          {student.fatherPhone && (
                            <div className="flex items-center gap-1">
                              <Phone size={14} />
                              <span>{student.fatherPhone}</span>
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-4 text-sm">
                          <button 
                            onClick={() => openStudentDetails(student)} 
                            className="text-blue-500 hover:text-blue-700 p-2 rounded hover:bg-blue-50 transition-colors flex items-center gap-1"
                          >
                            <Eye size={16} />
                            <span>View Details</span>
                          </button>
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
                  <div className="flex items-start gap-3 mb-3">
                    {student.profilePicture ? (
                      <img 
                        src={student.profilePicture} 
                        alt={student.name}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                        <span className="text-blue-600 font-semibold">
                          {student.name?.charAt(0)?.toUpperCase()}
                        </span>
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
                  
                  <div className="grid grid-cols-2 gap-3 text-sm mb-3">
                    <div>
                      <span className="font-medium text-gray-700">Roll No:</span>
                      <span className="ml-2 text-gray-600">{student.rollNumber || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Admission No:</span>
                      <span className="ml-2 text-gray-600">{student.admissionNumber || 'N/A'}</span>
                    </div>
                  </div>
                  
                  {student.fatherPhone && (
                    <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                      <Phone size={14} />
                      <span>Father: {student.fatherPhone}</span>
                    </div>
                  )}
                  
                  <button 
                    onClick={() => openStudentDetails(student)} 
                    className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition-colors flex items-center justify-center gap-2"
                  >
                    <Eye size={16} />
                    View Full Details
                  </button>
                </div>
              ))
            )}
          </div>

          {/* Student Details Modal */}
          {isDetailModalOpen && selectedStudent && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
                  <h2 className="text-2xl font-bold">Student Details</h2>
                  <button 
                    onClick={() => setIsDetailModalOpen(false)} 
                    className="text-3xl text-gray-500 hover:text-gray-700"
                  >
                    ×
                  </button>
                </div>

                <div className="p-6 space-y-6">
                  {/* Basic Information */}
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h3 className="text-lg font-bold text-blue-800 mb-4 flex items-center gap-2">
                      📋 Basic Information
                    </h3>
                    <div className="flex items-start gap-4 mb-4">
                      {selectedStudent.profilePicture ? (
                        <img 
                          src={selectedStudent.profilePicture} 
                          alt={selectedStudent.name}
                          className="w-20 h-20 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-20 h-20 rounded-full bg-blue-100 flex items-center justify-center">
                          <span className="text-blue-600 font-semibold text-xl">
                            {selectedStudent.name?.charAt(0)?.toUpperCase()}
                          </span>
                        </div>
                      )}
                      <div>
                        <h4 className="text-xl font-semibold">{selectedStudent.name}</h4>
                        <p className="text-gray-600">{selectedStudent.email}</p>
                        <p className="text-sm text-gray-500">Student ID: {selectedStudent.studentId || 'Auto-generated'}</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Date of Birth</label>
                        <p className="text-gray-900">{formatDate(selectedStudent.dateOfBirth)}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Gender</label>
                        <p className="text-gray-900">{selectedStudent.gender || 'N/A'}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Blood Group</label>
                        <p className="text-gray-900">{selectedStudent.bloodGroup || 'N/A'}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Aadhaar Number</label>
                        <p className="text-gray-900">{selectedStudent.aadhaarNumber || 'N/A'}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Nationality</label>
                        <p className="text-gray-900">{selectedStudent.nationality || 'N/A'}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Religion</label>
                        <p className="text-gray-900">{selectedStudent.religion || 'N/A'}</p>
                      </div>
                    </div>
                  </div>

                  {/* Academic Information */}
                  <div className="bg-indigo-50 p-4 rounded-lg">
                    <h3 className="text-lg font-bold text-indigo-800 mb-4 flex items-center gap-2">
                      🎓 Academic Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Class</label>
                        <p className="text-gray-900">Class {selectedStudent.class || 'N/A'}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Section</label>
                        <p className="text-gray-900">Section {selectedStudent.section || 'N/A'}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Roll Number</label>
                        <p className="text-gray-900">{selectedStudent.rollNumber || 'N/A'}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Admission Number</label>
                        <p className="text-gray-900">{selectedStudent.admissionNumber || 'N/A'}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Admission Date</label>
                        <p className="text-gray-900">{formatDate(selectedStudent.admissionDate)}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Previous School</label>
                        <p className="text-gray-900">{selectedStudent.previousSchool || 'N/A'}</p>
                      </div>
                    </div>
                  </div>

                  {/* Parent/Guardian Information */}
                  <div className="bg-yellow-50 p-4 rounded-lg">
                    <h3 className="text-lg font-bold text-yellow-800 mb-4 flex items-center gap-2">
                      👨‍👩‍👧‍👦 Parent/Guardian Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-semibold text-gray-700 mb-2">Father's Details</h4>
                        <div className="space-y-2">
                          <div>
                            <label className="block text-sm font-medium text-gray-700">Name</label>
                            <p className="text-gray-900">{selectedStudent.fatherName || 'N/A'}</p>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700">Occupation</label>
                            <p className="text-gray-900">{selectedStudent.fatherOccupation || 'N/A'}</p>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700">Phone</label>
                            <p className="text-gray-900 flex items-center gap-1">
                              {selectedStudent.fatherPhone && <Phone size={14} />}
                              {selectedStudent.fatherPhone || 'N/A'}
                            </p>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700">Email</label>
                            <p className="text-gray-900 flex items-center gap-1">
                              {selectedStudent.fatherEmail && <Mail size={14} />}
                              {selectedStudent.fatherEmail || 'N/A'}
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="font-semibold text-gray-700 mb-2">Mother's Details</h4>
                        <div className="space-y-2">
                          <div>
                            <label className="block text-sm font-medium text-gray-700">Name</label>
                            <p className="text-gray-900">{selectedStudent.motherName || 'N/A'}</p>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700">Occupation</label>
                            <p className="text-gray-900">{selectedStudent.motherOccupation || 'N/A'}</p>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700">Phone</label>
                            <p className="text-gray-900 flex items-center gap-1">
                              {selectedStudent.motherPhone && <Phone size={14} />}
                              {selectedStudent.motherPhone || 'N/A'}
                            </p>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700">Email</label>
                            <p className="text-gray-900 flex items-center gap-1">
                              {selectedStudent.motherEmail && <Mail size={14} />}
                              {selectedStudent.motherEmail || 'N/A'}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {selectedStudent.emergencyContact && (
                      <div className="mt-4 p-3 bg-red-100 rounded-lg">
                        <label className="block text-sm font-medium text-red-700">Emergency Contact</label>
                        <p className="text-red-900 font-semibold flex items-center gap-1">
                          <Phone size={14} />
                          {selectedStudent.emergencyContact}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Address Information */}
                  <div className="bg-purple-50 p-4 rounded-lg">
                    <h3 className="text-lg font-bold text-purple-800 mb-4 flex items-center gap-2">
                      🏠 Address Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Permanent Address</label>
                        <p className="text-gray-900 flex items-start gap-1">
                          <MapPin size={14} className="mt-1" />
                          {selectedStudent.permanentAddress || selectedStudent.address || 'N/A'}
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Current Address</label>
                        <p className="text-gray-900 flex items-start gap-1">
                          <MapPin size={14} className="mt-1" />
                          {selectedStudent.currentAddress || 'Same as permanent address'}
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">City</label>
                        <p className="text-gray-900">{selectedStudent.city || 'N/A'}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">District</label>
                        <p className="text-gray-900">{selectedStudent.district || 'N/A'}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">State</label>
                        <p className="text-gray-900">{selectedStudent.state || 'N/A'}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Pincode</label>
                        <p className="text-gray-900">{selectedStudent.pincode || 'N/A'}</p>
                      </div>
                    </div>
                  </div>

                  {/* Additional Information */}
                  {(selectedStudent.medicalConditions || selectedStudent.busRoute || selectedStudent.roomNumber) && (
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                        ℹ️ Additional Information
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {selectedStudent.medicalConditions && (
                          <div>
                            <label className="block text-sm font-medium text-gray-700">Medical Conditions</label>
                            <p className="text-gray-900">{selectedStudent.medicalConditions}</p>
                          </div>
                        )}
                        {selectedStudent.busRoute && (
                          <div>
                            <label className="block text-sm font-medium text-gray-700">Bus Route</label>
                            <p className="text-gray-900">{selectedStudent.busRoute}</p>
                          </div>
                        )}
                        {selectedStudent.roomNumber && (
                          <div>
                            <label className="block text-sm font-medium text-gray-700">Room Number</label>
                            <p className="text-gray-900">{selectedStudent.roomNumber}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StaffStudents;