import { useState, useEffect } from 'react';
import { X, User, Calendar, BookOpen, TrendingUp, Award, Clock } from 'lucide-react';
import { markAPI, attendanceAPI } from '../services/api';

const StudentDetailsModal = ({ student, isOpen, onClose }) => {
  const [studentMarks, setStudentMarks] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && student) {
      fetchStudentData();
    }
  }, [isOpen, student]);

  const fetchStudentData = async () => {
    setLoading(true);
    try {
      const [marksRes, attendanceRes] = await Promise.all([
        markAPI.getMarks({ student: student._id }),
        attendanceAPI.getAttendance({ student: student._id })
      ]);
      setStudentMarks(marksRes.data);
      setAttendance(attendanceRes.data);
    } catch (error) {
      console.error('Error fetching student data:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = () => {
    if (studentMarks.length === 0) return { avgScore: 0, totalExams: 0, highestScore: 0 };
    
    const scores = studentMarks.map(m => (m.marks / m.totalMarks) * 100);
    const avgScore = scores.reduce((a, b) => a + b, 0) / scores.length;
    const highestScore = Math.max(...scores);
    
    return {
      avgScore: Math.round(avgScore),
      totalExams: studentMarks.length,
      highestScore: Math.round(highestScore)
    };
  };

  const calculateAttendanceRate = () => {
    if (attendance.length === 0) return 0;
    const presentDays = attendance.filter(a => a.status === 'present').length;
    return Math.round((presentDays / attendance.length) * 100);
  };

  if (!isOpen || !student) return null;

  const stats = calculateStats();
  const attendanceRate = calculateAttendanceRate();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                <User size={32} />
              </div>
              <div>
                <h2 className="text-2xl font-bold">{student.name}</h2>
                <p className="text-blue-100">
                  Class {student.class} - Section {student.section}
                  {student.rollNumber && ` • Roll: ${student.rollNumber}`}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:bg-white hover:bg-opacity-20 p-2 rounded-full transition-colors"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              <span className="ml-3 text-gray-600">Loading student data...</span>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Quick Stats */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-blue-50 rounded-lg p-4 text-center">
                  <TrendingUp className="mx-auto text-blue-500 mb-2" size={24} />
                  <div className="text-2xl font-bold text-blue-600">{stats.avgScore}%</div>
                  <div className="text-sm text-gray-600">Average Score</div>
                </div>
                <div className="bg-green-50 rounded-lg p-4 text-center">
                  <BookOpen className="mx-auto text-green-500 mb-2" size={24} />
                  <div className="text-2xl font-bold text-green-600">{stats.totalExams}</div>
                  <div className="text-sm text-gray-600">Total Exams</div>
                </div>
                <div className="bg-purple-50 rounded-lg p-4 text-center">
                  <Award className="mx-auto text-purple-500 mb-2" size={24} />
                  <div className="text-2xl font-bold text-purple-600">{stats.highestScore}%</div>
                  <div className="text-sm text-gray-600">Highest Score</div>
                </div>
                <div className="bg-orange-50 rounded-lg p-4 text-center">
                  <Clock className="mx-auto text-orange-500 mb-2" size={24} />
                  <div className="text-2xl font-bold text-orange-600">{attendanceRate}%</div>
                  <div className="text-sm text-gray-600">Attendance</div>
                </div>
              </div>

              {/* Student Info */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <User size={20} />
                  Student Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div><span className="font-medium">Name:</span> {student.name}</div>
                  <div><span className="font-medium">Email:</span> {student.email}</div>
                  <div><span className="font-medium">Class:</span> {student.class}</div>
                  <div><span className="font-medium">Section:</span> {student.section}</div>
                  {student.rollNumber && <div><span className="font-medium">Roll Number:</span> {student.rollNumber}</div>}
                  {student.phone && <div><span className="font-medium">Phone:</span> {student.phone}</div>}
                </div>
              </div>

              {/* Recent Marks */}
              <div>
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <BookOpen size={20} />
                  Recent Exam Results ({studentMarks.length})
                </h3>
                {studentMarks.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    No exam records found
                  </div>
                ) : (
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {studentMarks.slice(0, 10).map((mark, index) => (
                      <div key={index} className="bg-white border rounded-lg p-4">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <div className="font-medium">{mark.subject?.name}</div>
                            <div className="text-sm text-gray-500">{mark.examType}</div>
                          </div>
                          <div className="text-right">
                            <div className="font-semibold">{mark.marks}/{mark.totalMarks}</div>
                            <div className="text-sm text-gray-500">
                              {((mark.marks/mark.totalMarks)*100).toFixed(1)}%
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="w-full bg-gray-200 rounded-full h-2 mr-3">
                            <div 
                              className={`h-2 rounded-full ${
                                (mark.marks/mark.totalMarks)*100 >= 90 ? 'bg-green-500' :
                                (mark.marks/mark.totalMarks)*100 >= 75 ? 'bg-blue-500' :
                                (mark.marks/mark.totalMarks)*100 >= 60 ? 'bg-yellow-500' :
                                'bg-red-500'
                              }`}
                              style={{ width: `${(mark.marks/mark.totalMarks)*100}%` }}
                            ></div>
                          </div>
                          {mark.grade && (
                            <span className={`px-2 py-1 rounded text-xs font-medium ${
                              mark.grade === 'A' || mark.grade === 'A+' ? 'bg-green-100 text-green-800' :
                              mark.grade === 'B' || mark.grade === 'B+' ? 'bg-blue-100 text-blue-800' :
                              mark.grade === 'C' || mark.grade === 'C+' ? 'bg-yellow-100 text-yellow-800' :
                              mark.grade === 'D' ? 'bg-orange-100 text-orange-800' :
                              mark.grade === 'F' ? 'bg-red-100 text-red-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {mark.grade}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Recent Attendance */}
              <div>
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <Calendar size={20} />
                  Recent Attendance ({attendance.length} days)
                </h3>
                {attendance.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    No attendance records found
                  </div>
                ) : (
                  <div className="grid grid-cols-7 gap-2 max-h-32 overflow-y-auto">
                    {attendance.slice(-21).map((att, index) => (
                      <div
                        key={index}
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium ${
                          att.status === 'present' ? 'bg-green-100 text-green-800' :
                          att.status === 'absent' ? 'bg-red-100 text-red-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}
                        title={`${new Date(att.date).toLocaleDateString()} - ${att.status}`}
                      >
                        {att.status === 'present' ? 'P' : att.status === 'absent' ? 'A' : 'L'}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentDetailsModal;