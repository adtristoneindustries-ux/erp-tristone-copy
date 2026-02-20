import { useState, useEffect } from 'react';
import { Calendar, Users, Check, X } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import { attendanceAPI, userAPI } from '../services/api';

const StaffStudentAttendance = () => {
  const [students, setStudents] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedClass, setSelectedClass] = useState('10A');
  const [attendance, setAttendance] = useState({});
  const [attendanceRecords, setAttendanceRecords] = useState({});
  const [loading, setLoading] = useState(false);

  const classes = ['10A', '10B'];

  useEffect(() => {
    fetchStudents();
    fetchAttendance();
  }, [selectedClass, selectedDate]);

  const fetchStudents = async () => {
    try {
      const res = await userAPI.getUsers({ role: 'student' });
      const [classNum, section] = selectedClass.split('');
      const classStudents = res.data.filter(student => 
        student.class === classNum && student.section === section
      );
      setStudents(classStudents);
    } catch (error) {
      console.error('Error fetching students:', error);
    }
  };

  const fetchAttendance = async () => {
    try {
      const res = await attendanceAPI.getAttendance({ 
        date: selectedDate 
      });
      
      const attendanceMap = {};
      const recordMap = {};
      res.data.forEach(record => {
        if (record.studentClass === selectedClass) {
          const studentId = record.student._id || record.student;
          attendanceMap[studentId] = record.status;
          recordMap[studentId] = record._id;
        }
      });
      setAttendance(attendanceMap);
      setAttendanceRecords(recordMap);
    } catch (error) {
      console.error('Error fetching attendance:', error);
    }
  };

  const markAttendance = async (studentId, status) => {
    const today = new Date().toISOString().split('T')[0];
    if (selectedDate < today) {
      alert('Cannot edit attendance for previous days');
      return;
    }
    
    setLoading(true);
    try {
      if (attendanceRecords[studentId]) {
        await attendanceAPI.updateAttendance(attendanceRecords[studentId], { status });
      } else {
        const student = students.find(s => s._id === studentId);
        const newRecord = await attendanceAPI.createAttendance({
          student: studentId,
          studentName: student?.name,
          studentEmail: student?.email,
          studentClass: selectedClass,
          date: selectedDate,
          status: status
        });
        setAttendanceRecords(prev => ({ ...prev, [studentId]: newRecord.data._id }));
      }
      
      setAttendance(prev => ({ ...prev, [studentId]: status }));
    } catch (error) {
      alert('Error marking attendance: ' + (error.response?.data?.message || error.message));
    }
    setLoading(false);
  };

  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1 ml-64">
        <Navbar />
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Users className="text-blue-600" />
              Student Attendance
            </h1>
          </div>

          {/* Date and Class Selection */}
          <div className="bg-white rounded-lg shadow-md p-4 mb-6">
            <div className="flex items-center gap-4 mb-4">
              <Calendar className="text-gray-500" />
              <label className="font-medium">Select Date:</label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="px-4 py-2 border rounded-lg"
              />
            </div>
            <div className="flex items-center gap-4">
              <Users className="text-gray-500" />
              <label className="font-medium">Select Class:</label>
              <select
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                className="px-4 py-2 border rounded-lg"
              >
                {classes.map(cls => (
                  <option key={cls} value={cls}>Class {cls}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Student Attendance Grid */}
          <div className="bg-white rounded-lg shadow-md">
            <div className="p-4 border-b">
              <h2 className="text-lg font-semibold">
                Class {selectedClass} Attendance for {new Date(selectedDate).toLocaleDateString()}
              </h2>
            </div>
            
            <div className="p-4">
              {students.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No students found in Class {selectedClass}
                </div>
              ) : (
                <div className="grid gap-4">
                  {students.map(student => (
                    <div key={student._id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-blue-600 font-semibold">
                            {student.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <h3 className="font-semibold">{student.name}</h3>
                          <p className="text-sm text-gray-600">{student.email}</p>
                          <p className="text-sm text-gray-500">Class: {student.class}{student.section}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {(() => {
                          const today = new Date().toISOString().split('T')[0];
                          const isPastDate = selectedDate < today;
                          
                          if (isPastDate) {
                            return (
                              <div className="px-4 py-2 rounded-lg bg-gray-100 text-gray-600">
                                {attendance[student._id] ? (
                                  <span className={`px-3 py-1 rounded-full text-sm ${
                                    attendance[student._id] === 'present' ? 'bg-green-100 text-green-800' :
                                    attendance[student._id] === 'absent' ? 'bg-red-100 text-red-800' :
                                    'bg-yellow-100 text-yellow-800'
                                  }`}>
                                    {attendance[student._id].charAt(0).toUpperCase() + attendance[student._id].slice(1)}
                                  </span>
                                ) : (
                                  <span className="text-gray-500">Not Marked</span>
                                )}
                              </div>
                            );
                          }
                          
                          return (
                            <>
                              <button
                                onClick={() => markAttendance(student._id, 'present')}
                                disabled={loading}
                                className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors ${
                                  attendance[student._id] === 'present'
                                    ? 'bg-green-500 text-white'
                                    : 'bg-gray-200 text-gray-700 hover:bg-green-100'
                                }`}
                              >
                                <Check size={16} />
                                Present
                              </button>
                              <button
                                onClick={() => markAttendance(student._id, 'absent')}
                                disabled={loading}
                                className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors ${
                                  attendance[student._id] === 'absent'
                                    ? 'bg-red-500 text-white'
                                    : 'bg-gray-200 text-gray-700 hover:bg-red-100'
                                }`}
                              >
                                <X size={16} />
                                Absent
                              </button>
                            </>
                          );
                        })()}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StaffStudentAttendance;