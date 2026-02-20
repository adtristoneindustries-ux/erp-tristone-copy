import { useState, useEffect, useContext } from 'react';
import { Check, X, Edit, Calendar } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import Modal from '../components/Modal';
import { attendanceAPI, userAPI, classAPI } from '../services/api';
import { AuthContext } from '../context/AuthContext';

const StaffAttendance = () => {
  const { user } = useContext(AuthContext);
  const [classes, setClasses] = useState([]);
  const [students, setStudents] = useState([]);
  const [attendance, setAttendance] = useState({});
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSection, setSelectedSection] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const currentDate = new Date().toISOString().split('T')[0];
  const [sections, setSections] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchClasses();
  }, []);

  useEffect(() => {
    if (selectedClass) {
      const classSections = classes
        .filter(cls => cls.className === selectedClass)
        .map(cls => cls.section);
      setSections([...new Set(classSections)]);
      setSelectedSection('');
      setStudents([]);
    }
  }, [selectedClass, classes]);

  useEffect(() => {
    if (selectedClass && selectedSection) {
      fetchStudents();
    }
  }, [selectedClass, selectedSection]);

  useEffect(() => {
    if (students.length > 0) {
      fetchAttendance();
    }
  }, [students]);

  const fetchClasses = async () => {
    try {
      const response = await classAPI.getClasses();
      setClasses(response.data || []);
      console.log('Classes loaded:', response.data?.length || 0);
    } catch (error) {
      console.error('Failed to fetch classes:', error);
      setClasses([]);
    }
  };

  const fetchStudents = async () => {
    try {
      // First get all students
      const response = await userAPI.getUsers({ role: 'student' });
      
      // Filter students by class and section on frontend
      const filteredStudents = (response.data || []).filter(student => 
        student.class === selectedClass && student.section === selectedSection
      );
      
      setStudents(filteredStudents);
      console.log(`Students loaded for ${selectedClass}-${selectedSection}:`, filteredStudents.length);
    } catch (error) {
      console.error('Failed to fetch students:', error);
      setStudents([]);
    }
  };

  const fetchAttendance = async () => {
    try {
      const response = await attendanceAPI.getAttendance({
        date: currentDate,
        class: selectedClass,
        section: selectedSection
      });
      
      const attendanceMap = {};
      response.data.forEach(record => {
        const userId = record.user?._id || record.user || record.student?._id || record.student;
        if (userId) {
          attendanceMap[userId] = record.status;
        }
      });
      setAttendance(attendanceMap);
    } catch (error) {
      console.error('Failed to fetch attendance:', error);
    }
  };

  const markAttendance = async (studentId, status) => {
    try {
      setLoading(true);
      
      // Check if attendance already exists for this student and date
      const existingAttendance = await attendanceAPI.getAttendance({
        user: studentId,
        date: currentDate
      });
      
      if (existingAttendance.data.length > 0) {
        // Update existing attendance
        await attendanceAPI.updateAttendance(existingAttendance.data[0]._id, {
          status: status
        });
      } else {
        // Create new attendance
        await attendanceAPI.createAttendance({
          user: studentId,
          userType: 'student',
          date: currentDate,
          status: status
        });
      }
      
      setAttendance(prev => ({
        ...prev,
        [studentId]: status
      }));
    } catch (error) {
      console.error('Failed to mark attendance:', error);
      alert('Failed to mark attendance: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  const markAllPresent = async () => {
    try {
      setLoading(true);
      const attendanceData = students.map(student => ({
        user: student._id,
        userType: 'student',
        date: currentDate,
        status: 'present'
      }));

      await attendanceAPI.markBulkAttendance(attendanceData);
      
      const newAttendance = {};
      students.forEach(student => {
        newAttendance[student._id] = 'present';
      });
      setAttendance(newAttendance);
    } catch (error) {
      console.error('Failed to mark all present:', error);
      alert('Failed to mark all present');
    } finally {
      setLoading(false);
    }
  };

  const editAttendance = async (newStatus) => {
    if (!editingStudent) return;
    
    try {
      setLoading(true);
      
      // Find existing attendance record
      const existingAttendance = await attendanceAPI.getAttendance({
        user: editingStudent.studentId,
        date: currentDate
      });
      
      if (existingAttendance.data.length > 0) {
        // Update existing attendance
        await attendanceAPI.updateAttendance(existingAttendance.data[0]._id, {
          status: newStatus
        });
      } else {
        // Create new attendance
        await attendanceAPI.createAttendance({
          user: editingStudent.studentId,
          userType: 'student',
          date: currentDate,
          status: newStatus
        });
      }
      
      // Update local state
      setAttendance(prev => ({
        ...prev,
        [editingStudent.studentId]: newStatus
      }));
      
      // Close modal and reset
      setIsModalOpen(false);
      setEditingStudent(null);
      
      // Show success message
      alert(`Attendance updated to ${newStatus.toUpperCase()} successfully!`);
      
    } catch (error) {
      console.error('Failed to update attendance:', error);
      alert('Failed to update attendance: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  const openEditModal = (student) => {
    setEditingStudent({
      studentId: student._id,
      studentName: student.name,
      currentStatus: attendance[student._id] || 'absent'
    });
    setIsModalOpen(true);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'present': return 'bg-green-100 text-green-800 border-green-200';
      case 'absent': return 'bg-red-100 text-red-800 border-red-200';
      case 'late': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 lg:ml-64 transition-all duration-300">
        <Navbar />
        <div className="p-4 lg:p-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Mark Student Attendance</h1>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-md p-4 lg:p-6 mb-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Class</label>
              <select
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg text-sm lg:text-base"
              >
                <option value="">Select Class</option>
                {[...new Set(classes.map(cls => cls.className))].sort().map(className => (
                  <option key={className} value={className}>Class {className}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Section</label>
              <select
                value={selectedSection}
                onChange={(e) => setSelectedSection(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg text-sm lg:text-base"
                disabled={!selectedClass}
              >
                <option value="">Select Section</option>
                {sections.sort().map(section => (
                  <option key={section} value={section}>Section {section}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Date</label>
              <input
                type="date"
                value={currentDate}
                readOnly
                className="w-full px-3 py-2 border rounded-lg text-sm lg:text-base bg-gray-100 cursor-not-allowed"
                title="Attendance can only be marked for today"
              />
            </div>

            <div className="flex items-end">
              <button
                onClick={markAllPresent}
                disabled={!students.length || loading}
                className="w-full bg-green-500 text-white py-2 px-4 rounded-lg hover:bg-green-600 disabled:opacity-50 text-sm lg:text-base"
              >
                Mark All Present
              </button>
            </div>
          </div>
        </div>

        {/* Students List */}
        {students.length > 0 ? (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="p-4 bg-gray-50 border-b">
              <h3 className="font-semibold">
                Students in Class {selectedClass}-{selectedSection} ({students.length} students)
              </h3>
            </div>
            
            <div className="divide-y divide-gray-200">
              {students.map((student) => {
                const status = attendance[student._id];
                return (
                  <div key={student._id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="font-medium">{student.name}</div>
                      <div className="text-sm text-gray-500">Roll No: {student.rollNumber}</div>
                      {status && (
                        <span className={`inline-block mt-1 px-2 py-1 rounded-full text-xs border ${getStatusColor(status)}`}>
                          {status.toUpperCase()}
                        </span>
                      )}
                    </div>
                    
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => markAttendance(student._id, 'present')}
                        disabled={loading}
                        className={`px-3 py-1 rounded-lg text-sm flex items-center gap-1 transition-all ${
                          status === 'present' 
                            ? 'bg-green-500 text-white shadow-md' 
                            : 'bg-green-100 text-green-700 hover:bg-green-200 hover:shadow-sm'
                        }`}
                      >
                        <Check size={14} /> Present
                      </button>
                      
                      <button
                        onClick={() => markAttendance(student._id, 'absent')}
                        disabled={loading}
                        className={`px-3 py-1 rounded-lg text-sm flex items-center gap-1 transition-all ${
                          status === 'absent' 
                            ? 'bg-red-500 text-white shadow-md' 
                            : 'bg-red-100 text-red-700 hover:bg-red-200 hover:shadow-sm'
                        }`}
                      >
                        <X size={14} /> Absent
                      </button>
                      
                      <button
                        onClick={() => markAttendance(student._id, 'late')}
                        disabled={loading}
                        className={`px-3 py-1 rounded-lg text-sm transition-all ${
                          status === 'late' 
                            ? 'bg-yellow-500 text-white shadow-md' 
                            : 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200 hover:shadow-sm'
                        }`}
                      >
                        Late
                      </button>
                      
                      <button
                        onClick={() => openEditModal(student)}
                        className="px-3 py-1 text-blue-600 hover:bg-blue-100 rounded-lg text-sm flex items-center gap-1 transition-all hover:shadow-sm"
                        title="Edit Attendance"
                      >
                        <Edit size={14} /> Edit
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : selectedClass && selectedSection ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <p className="text-gray-500">No students found in Class {selectedClass}-{selectedSection}</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <p className="text-gray-500">Please select a class and section to view students</p>
          </div>
        )}

        {/* Edit Modal */}
        <Modal isOpen={isModalOpen} onClose={() => !loading && setIsModalOpen(false)} title="Edit Attendance">
          {editingStudent && (
            <div className="space-y-4">
              <div className="bg-blue-50 p-3 rounded-lg">
                <p className="text-sm text-gray-700">
                  Editing attendance for: <strong className="text-blue-800">{editingStudent.studentName}</strong>
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  Date: <strong>{new Date(currentDate).toLocaleDateString()}</strong>
                </p>
              </div>
              
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-sm text-gray-600">
                  Current Status: <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(editingStudent.currentStatus)}`}>
                    {editingStudent.currentStatus.toUpperCase()}
                  </span>
                </p>
              </div>
              
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-700">Select new status:</p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <button
                    onClick={() => editAttendance('present')}
                    disabled={loading}
                    className="bg-green-500 text-white py-3 px-4 rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                  >
                    <Check size={16} />
                    {loading ? 'Updating...' : 'Present'}
                  </button>
                  <button
                    onClick={() => editAttendance('absent')}
                    disabled={loading}
                    className="bg-red-500 text-white py-3 px-4 rounded-lg hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                  >
                    <X size={16} />
                    {loading ? 'Updating...' : 'Absent'}
                  </button>
                  <button
                    onClick={() => editAttendance('late')}
                    disabled={loading}
                    className="bg-yellow-500 text-white py-3 px-4 rounded-lg hover:bg-yellow-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
                  >
                    {loading ? 'Updating...' : 'Late'}
                  </button>
                </div>
              </div>
              
              <div className="pt-2">
                <button
                  onClick={() => setIsModalOpen(false)}
                  disabled={loading}
                  className="w-full bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </Modal>
        </div>
      </div>
    </div>
  );
};

export default StaffAttendance;