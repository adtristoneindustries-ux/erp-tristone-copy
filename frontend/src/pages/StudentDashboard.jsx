import { useState, useEffect, useContext } from 'react';
import { Award, Calendar, TrendingUp, User, Clock, BookOpen, FileText, Bell, Download, Send, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import Card from '../components/Card';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import { dashboardAPI, timetableAPI, materialAPI, announcementAPI, attendanceAPI, markAPI, leaveRequestAPI } from '../services/api';
import { SocketContext } from '../context/SocketContext';
import { AuthContext } from '../context/AuthContext';
import { Link } from 'react-router-dom';
const StudentDashboard = () => {
  const [stats, setStats] = useState({});
  const [todaySchedule, setTodaySchedule] = useState([]);
  const [upcomingClasses, setUpcomingClasses] = useState([]);
  const [recentMaterials, setRecentMaterials] = useState([]);
  const [importantAnnouncements, setImportantAnnouncements] = useState([]);
  const [todayAttendance, setTodayAttendance] = useState(null);
  const [marksHistory, setMarksHistory] = useState([]);
  const [attendanceHistory, setAttendanceHistory] = useState([]);
  const [activityLog, setActivityLog] = useState([]);
  const [pendingAssignments, setPendingAssignments] = useState(0);
  const socket = useContext(SocketContext);
  const { user } = useContext(AuthContext);

  useEffect(() => {
    fetchStats();
    fetchEnhancedData();
  }, []);

  const fetchEnhancedData = async () => {
    try {
      // Fetch today's schedule
      const today = new Date().toLocaleDateString('en-CA');
      const dayName = new Date().toLocaleDateString('en-US', { weekday: 'long' });
      const timetableRes = await timetableAPI.getTimetable({ class: user?.class, day: dayName });
      setTodaySchedule(timetableRes.data || []);
      
      // Get upcoming classes (next 2 periods)
      const currentTime = new Date();
      const currentHour = currentTime.getHours();
      const upcoming = (timetableRes.data || []).filter(period => {
        if (!period.startTime) return false;
        const [startHour] = period.startTime.split(':').map(Number);
        return startHour > currentHour;
      }).slice(0, 2);
      setUpcomingClasses(upcoming);

      // Fetch recent materials
      const materialsRes = await materialAPI.getMaterials({ limit: 3 });
      setRecentMaterials(materialsRes.data || []);

      // Fetch important announcements
      const announcementsRes = await announcementAPI.getAnnouncements({ limit: 3, priority: 'high' });
      setImportantAnnouncements(announcementsRes.data || []);

      // Fetch today's attendance status
      const attendanceRes = await attendanceAPI.getAttendance({ 
        student: user?.id, 
        date: today 
      });
      setTodayAttendance(attendanceRes.data?.[0] || null);

      // Fetch marks history for trend
      const marksRes = await markAPI.getMarks({ student: user?.id, limit: 5 });
      const marksData = (marksRes.data || []).map(mark => ({
        subject: mark.subject?.name || 'Unknown',
        marks: mark.marks,
        date: new Date(mark.createdAt).toLocaleDateString()
      }));
      setMarksHistory(marksData);

      // Fetch attendance history for last 7 days
      const last7Days = Array.from({ length: 7 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - i);
        return date.toLocaleDateString('en-CA');
      }).reverse();
      
      const attendanceHistoryRes = await attendanceAPI.getAttendance({ 
        student: user?.id, 
        dateRange: last7Days 
      });
      const attendanceData = last7Days.map(date => {
        const record = (attendanceHistoryRes.data || []).find(a => 
          new Date(a.date).toLocaleDateString('en-CA') === date
        );
        return {
          date: new Date(date).toLocaleDateString('en-US', { weekday: 'short' }),
          status: record ? (record.status === 'present' ? 1 : 0) : 0
        };
      });
      setAttendanceHistory(attendanceData);

      // Mock activity log (in real app, this would come from backend)
      setActivityLog([
        { type: 'attendance', message: 'Attendance marked for Math', time: '2 hours ago' },
        { type: 'material', message: 'Downloaded Physics Notes', time: '1 day ago' },
        { type: 'result', message: 'Chemistry test result published', time: '2 days ago' }
      ]);

      // Mock pending assignments count
      setPendingAssignments(3);
    } catch (error) {
      console.error('Error fetching enhanced data:', error);
    }
  };

  useEffect(() => {
    if (socket) {
      socket.on('markUpdate', () => {
        fetchStats();
        fetchEnhancedData();
      });
      socket.on('attendanceUpdate', () => {
        fetchStats();
        fetchEnhancedData();
      });
      socket.on('studentUpdate', (data) => {
        if (data.studentId === user?.id) {
          // Refresh user data when admin updates this student's profile
          window.location.reload();
        }
      });
      return () => {
        socket.off('markUpdate');
        socket.off('attendanceUpdate');
        socket.off('studentUpdate');
      };
    }
  }, [socket, user]);

  const fetchStats = () => {
    dashboardAPI.getStudentStats().then(res => setStats(res.data));
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 lg:ml-64 transition-all duration-300">
        <Navbar />
        <div className="p-4 lg:p-6">
          <div className="mb-4 lg:mb-6">
            <h1 className="text-xl lg:text-2xl font-bold">Welcome, {user?.name}!</h1>
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mt-2 text-sm lg:text-base text-gray-600">
              <span className="truncate">Class: {user?.class} - {user?.section}</span>
              <span className="truncate">Roll: {user?.rollNumber}</span>
              <span className="truncate">{user?.email}</span>
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6 mb-6 lg:mb-8">
            <Card title="Attendance" value={`${stats.attendancePercentage || 0}%`} icon={Calendar} color="blue" />
            <Card title="Average Marks" value={`${stats.averageMarks || 0}%`} icon={Award} color="green" />
            <Card title="Total Subjects" value={stats.totalSubjects || 0} icon={TrendingUp} color="purple" />
          </div>

          {/* Enhanced Dashboard Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-6 lg:mb-8">
            <Card 
              title="Today's Status" 
              value={todayAttendance ? (todayAttendance.status === 'present' ? 'Present' : todayAttendance.status === 'late' ? 'Late' : 'Absent') : 'Not Marked'} 
              icon={todayAttendance?.status === 'present' ? CheckCircle : todayAttendance?.status === 'late' ? AlertCircle : XCircle} 
              color={todayAttendance?.status === 'present' ? 'green' : todayAttendance?.status === 'late' ? 'orange' : 'blue'} 
            />
            <Card title="Upcoming Classes" value={upcomingClasses.length} icon={Clock} color="purple" />
            <Card title="Pending Materials" value={pendingAssignments} icon={FileText} color="orange" />
            <Card title="New Announcements" value={importantAnnouncements.length} icon={Bell} color="blue" />
          </div>

          {/* Today's Schedule */}
          <div className="bg-white rounded-lg shadow-md p-4 lg:p-6 mb-6 lg:mb-8">
            <h2 className="text-lg lg:text-xl font-bold mb-4 flex items-center gap-2">
              <Clock className="text-blue-600" />
              Today's Schedule
            </h2>
            {todaySchedule.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {todaySchedule.map((period, index) => (
                  <div key={index} className="border rounded-lg p-3 hover:bg-gray-50">
                    <div className="flex justify-between items-start mb-2">
                      <span className="font-medium text-blue-600">{period.subject?.name || 'Unknown Subject'}</span>
                      <span className="text-sm text-gray-500">{period.startTime} - {period.endTime}</span>
                    </div>
                    <p className="text-sm text-gray-600">Teacher: {period.teacher?.name || 'TBA'}</p>
                    <p className="text-xs text-gray-500 mt-1">Period {period.period}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">No classes scheduled for today</p>
            )}
          </div>

          {/* Analytics Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6 lg:mb-8">
            {/* Marks Trend */}
            <div className="bg-white rounded-lg shadow-md p-4 lg:p-6">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <TrendingUp className="text-green-600" />
                Recent Marks Trend
              </h3>
              {marksHistory.length > 0 ? (
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={marksHistory}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="subject" fontSize={12} />
                    <YAxis fontSize={12} />
                    <Tooltip />
                    <Line type="monotone" dataKey="marks" stroke="#10b981" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-gray-500 text-center py-8">No marks data available</p>
              )}
            </div>

            {/* Attendance Trend */}
            <div className="bg-white rounded-lg shadow-md p-4 lg:p-6">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <Calendar className="text-blue-600" />
                Last 7 Days Attendance
              </h3>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={attendanceHistory}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" fontSize={12} />
                  <YAxis fontSize={12} />
                  <Tooltip formatter={(value) => [value === 1 ? 'Present' : 'Absent', 'Status']} />
                  <Bar dataKey="status" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Quick Info Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6 lg:mb-8">
            {/* Upcoming Classes */}
            <div className="bg-white rounded-lg shadow-md p-4 lg:p-6">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <Clock className="text-purple-600" />
                Next Classes
              </h3>
              {upcomingClasses.length > 0 ? (
                <div className="space-y-3">
                  {upcomingClasses.map((cls, index) => (
                    <div key={index} className="flex justify-between items-center p-2 bg-purple-50 rounded">
                      <div>
                        <p className="font-medium text-sm">{cls.subject?.name}</p>
                        <p className="text-xs text-gray-600">{cls.teacher?.name}</p>
                      </div>
                      <span className="text-sm text-purple-600 font-medium">{cls.startTime}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-sm">No upcoming classes today</p>
              )}
            </div>

            {/* Recent Materials */}
            <div className="bg-white rounded-lg shadow-md p-4 lg:p-6">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <BookOpen className="text-orange-600" />
                Recent Materials
              </h3>
              {recentMaterials.length > 0 ? (
                <div className="space-y-3">
                  {recentMaterials.slice(0, 3).map((material, index) => (
                    <div key={index} className="p-2 bg-orange-50 rounded">
                      <p className="font-medium text-sm truncate">{material.title}</p>
                      <p className="text-xs text-gray-600">{material.subject?.name}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-sm">No recent materials</p>
              )}
            </div>

            {/* Important Announcements */}
            <div className="bg-white rounded-lg shadow-md p-4 lg:p-6">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <Bell className="text-red-600" />
                Important Notices
              </h3>
              {importantAnnouncements.length > 0 ? (
                <div className="space-y-3">
                  {importantAnnouncements.slice(0, 3).map((announcement, index) => (
                    <div key={index} className="p-2 bg-red-50 rounded">
                      <p className="font-medium text-sm truncate">{announcement.title}</p>
                      <p className="text-xs text-gray-600">
                        {new Date(announcement.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-sm">No important announcements</p>
              )}
            </div>
          </div>

          {/* Activity Log */}
          <div className="bg-white rounded-lg shadow-md p-4 lg:p-6 mb-6 lg:mb-8">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <User className="text-gray-600" />
              Recent Activity
            </h3>
            <div className="space-y-3">
              {activityLog.map((activity, index) => (
                <div key={index} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded">
                  <div className={`w-2 h-2 rounded-full ${
                    activity.type === 'attendance' ? 'bg-green-500' :
                    activity.type === 'material' ? 'bg-blue-500' : 'bg-orange-500'
                  }`}></div>
                  <div className="flex-1">
                    <p className="text-sm">{activity.message}</p>
                    <p className="text-xs text-gray-500">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Enhanced Quick Links */}
          <div className="bg-white rounded-lg shadow-md p-4 lg:p-6">
            <h2 className="text-lg lg:text-xl font-bold mb-4">Quick Links</h2>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4 mb-4">
              <Link to="/student/marks" className="p-3 lg:p-4 bg-blue-50 rounded-lg text-center hover:bg-blue-100 transition">
                <Award className="mx-auto mb-2" size={24} />
                <p className="font-medium text-sm lg:text-base">My Marks</p>
              </Link>
              <Link to="/student/attendance" className="p-3 lg:p-4 bg-green-50 rounded-lg text-center hover:bg-green-100 transition">
                <Calendar className="mx-auto mb-2" size={24} />
                <p className="font-medium text-sm lg:text-base">Attendance</p>
              </Link>
              <Link to="/student/timetable" className="p-3 lg:p-4 bg-purple-50 rounded-lg text-center hover:bg-purple-100 transition">
                <Calendar className="mx-auto mb-2" size={24} />
                <p className="font-medium text-sm lg:text-base">Timetable</p>
              </Link>
              <Link to="/student/materials" className="p-3 lg:p-4 bg-orange-50 rounded-lg text-center hover:bg-orange-100 transition">
                <TrendingUp className="mx-auto mb-2" size={24} />
                <p className="font-medium text-sm lg:text-base">Materials</p>
              </Link>
            </div>
            
            {/* New Quick Links */}
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 lg:gap-4">
              <Link to="/student/leave-request" className="p-3 lg:p-4 bg-red-50 rounded-lg text-center hover:bg-red-100 transition">
                <Send className="mx-auto mb-2" size={24} />
                <p className="font-medium text-sm lg:text-base">Apply Leave</p>
              </Link>
              <Link to="/student/announcements" className="p-3 lg:p-4 bg-yellow-50 rounded-lg text-center hover:bg-yellow-100 transition">
                <Bell className="mx-auto mb-2" size={24} />
                <p className="font-medium text-sm lg:text-base">Announcements</p>
              </Link>
              <Link to="/student/materials" className="p-3 lg:p-4 bg-indigo-50 rounded-lg text-center hover:bg-indigo-100 transition">
                <Download className="mx-auto mb-2" size={24} />
                <p className="font-medium text-sm lg:text-base">Download Materials</p>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
