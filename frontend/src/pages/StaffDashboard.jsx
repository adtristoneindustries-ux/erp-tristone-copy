import { useContext, useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import Card from "../components/Card";
import {
  ClipboardList,
  Award,
  FileText,
  Calendar,
  Clock,
  Users,
  CheckCircle,
  AlertTriangle,
  Bell,
  BookOpen,
  UserCheck,
  FileUp,
  Plus,
  Eye,
  UserX,
  Edit2,
  Trash2,
} from "lucide-react";
import { Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import {
  timetableAPI,
  staffAttendanceAPI,
  leaveRequestAPI,
  announcementAPI,
  materialAPI,
  markAPI,
  attendanceAPI,
  examAPI,
  dashboardAPI,} from "../services/api";
import { toast } from 'react-hot-toast';

const StaffDashboard = () => {
  const { user } = useContext(AuthContext);

  // State for dashboard data
  const [todayClasses, setTodayClasses] = useState(0);
  const [attendanceStatus, setAttendanceStatus] = useState({
    status: "Not Marked",
    time: null,
  });
  const [pendingLeaves, setPendingLeaves] = useState(0);
  const [recentAnnouncements, setRecentAnnouncements] = useState([]);
  const [materialsUploaded, setMaterialsUploaded] = useState(0);
  const [monthlyAttendance, setMonthlyAttendance] = useState(0);
  const [averageClassStrength, setAverageClassStrength] = useState(0);
  const [recentMarkUpdates, setRecentMarkUpdates] = useState([]);
  const [myExamSchedules, setMyExamSchedules] = useState([]);
  const [todaySchedule, setTodaySchedule] = useState([]);


  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch staff dashboard stats from API
      const dashboardRes = await dashboardAPI.getStaffStats();
      const dashboardData = dashboardRes.data;

      setTodayClasses(dashboardData.todayClasses || 0);
      setPendingLeaves(dashboardData.pendingLeaves || 0);
      setMaterialsUploaded(dashboardData.materialsUploaded || 0);
      setMonthlyAttendance(dashboardData.monthlyAttendancePercentage || 0);
      setRecentMarkUpdates(dashboardData.recentMarkUpdates || []);

      // Fetch today's attendance status using the same API as My Attendance module
      try {
        const attendanceRes = await staffAttendanceAPI.getTodayAttendance();
        const attendance = attendanceRes.data.attendance;
        const onLeave = attendanceRes.data.onLeave;

        if (onLeave) {
          setAttendanceStatus({ status: "On Leave", time: null });
        } else if (!attendance) {
          setAttendanceStatus({ status: "Not Checked In", time: null });
        } else if (!attendance.outTime) {
          setAttendanceStatus({ status: "Present", time: attendance.inTime });
        } else {
          setAttendanceStatus({ status: "Completed", time: attendance.inTime });
        }
      } catch (error) {
        console.error("Error fetching attendance status:", error);
        setAttendanceStatus({ status: "Not Marked", time: null });
      }

      const today = new Date().toISOString().split("T")[0];
      const currentDay = new Date()
        .toLocaleDateString("en-US", { weekday: "long" })
        .toLowerCase();

      // Fetch today's schedule from timetable
      try {
        const timetableRes = await timetableAPI.getTimetable({
          teacherId: user?.id,
          day: currentDay,
        });
        const classes = timetableRes.data.timetable || [];
        setTodaySchedule(classes.slice(0, 5)); // Show first 5 classes
      } catch (error) {
        console.error("Error fetching timetable:", error);
      }

      // Fetch recent announcements for staff
      try {
        const announcementsRes = await announcementAPI.getAnnouncements({
          targetRole: "staff",
          limit: 3,
        });
        setRecentAnnouncements(announcementsRes.data.announcements || []);
      } catch (error) {
        console.error("Error fetching announcements:", error);
      }

      // Fetch my exam schedules (only created by current user)
      try {
        const examsRes = await examAPI.getExams();
        const exams = examsRes.data;
        
        const grouped = {};
        exams.forEach(exam => {
          // Show all exams, not just current user's
          if (!grouped[exam.examName]) {
            grouped[exam.examName] = {
              examName: exam.examName,
              exams: [],
              startDate: exam.date,
              endDate: exam.date,
              class: exam.class,
              createdBy: exam.createdBy
            };
          }
          grouped[exam.examName].exams.push(exam);
          
          const examDate = new Date(exam.date);
          if (examDate < new Date(grouped[exam.examName].startDate)) {
            grouped[exam.examName].startDate = exam.date;
          }
          if (examDate > new Date(grouped[exam.examName].endDate)) {
            grouped[exam.examName].endDate = exam.date;
          }
        });

        const schedules = Object.values(grouped).sort((a, b) => {
          const aTime = Math.max(...a.exams.map(e => new Date(e.updatedAt || e.createdAt).getTime()));
          const bTime = Math.max(...b.exams.map(e => new Date(e.updatedAt || e.createdAt).getTime()));
          return bTime - aTime;
        }).slice(0, 3);
        
        setMyExamSchedules(schedules);
      } catch (error) {
        console.error("Error fetching exam schedules:", error);
      }
      try {
        const attendanceRes = await attendanceAPI.getAttendance({
          teacherId: user?.id,
          limit: 10,
        });
        const attendanceRecords = attendanceRes.data.attendance || [];
        if (attendanceRecords.length > 0) {
          const totalStrength = attendanceRecords.reduce((sum, record) => {
            return sum + (record.presentCount || 0) + (record.absentCount || 0);
          }, 0);
          setAverageClassStrength(
            Math.round(totalStrength / attendanceRecords.length)
          );
        }
      } catch (error) {
        console.error("Error calculating class strength:", error);
      }


    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      // Set default values on error
      setTodayClasses(0);
      setAttendanceStatus({ status: "Not Marked", time: null });
      setPendingLeaves(0);
      setMaterialsUploaded(0);
      setMonthlyAttendance(0);
      setAverageClassStrength(0);
      setRecentMarkUpdates([]);
    }
  };



  const handleEditSchedule = (schedule) => {
    window.location.href = '/staff/exam-schedule';
  };

  const handleDeleteSchedule = async (schedule) => {
    if (!window.confirm(`Delete ${schedule.examName}?`)) return;

    try {
      for (const exam of schedule.exams) {
        await examAPI.deleteExam(exam._id);
      }
      toast.success('Schedule deleted successfully');
      fetchDashboardData();
    } catch (error) {
      toast.error('Failed to delete schedule');
    }
  };


  const quickActions = [
    {
      title: "Mark Attendance",
      icon: ClipboardList,
      link: "/staff/attendance",
      color: "bg-blue-500",
    },
    {
      title: "Update Marks",
      icon: Award,
      link: "/staff/marks",
      color: "bg-green-500",
    },
    {
      title: "Upload Materials",
      icon: FileText,
      link: "/staff/materials",
      color: "bg-purple-500",
    },
    {
      title: "Exam Schedule",
      icon: Calendar,
      link: "/staff/exam-schedule",
      color: "bg-orange-500",
    },
  ];

  const quickShortcuts = [
    {
      title: "My Attendance",
      icon: Clock,
      link: "/staff/my-attendance",
      color: "blue",
    },
    {
      title: "Apply Leave",
      icon: Plus,
      link: "/staff/my-attendance",
      color: "orange",
    },
    {
      title: "My Timetable",
      icon: Eye,
      link: "/staff/timetable",
      color: "green",
    },
  ];

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 lg:ml-64 transition-all duration-300">
        <Navbar />
        <div className="p-4 lg:p-6">
          <div className="mb-4 lg:mb-6">
            <h1 className="text-xl lg:text-2xl font-bold">
              Welcome, {user?.name}!
            </h1>
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mt-2 text-sm lg:text-base text-gray-600">
              <span className="truncate">ID: {user?.employeeId}</span>
              <span className="truncate">Dept: {user?.department}</span>
              <span className="truncate">{user?.email}</span>
            </div>
          </div>

          {/* New Dashboard Insights */}
          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-4">Today's Overview</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              <Card
                title="Today's Classes"
                value={todayClasses}
                icon={Calendar}
                color="blue"
              />
              <Card
                title="Attendance Status"
                value={attendanceStatus.status}
                icon={
                  attendanceStatus.status === "Present"
                    ? CheckCircle
                    : attendanceStatus.status === "Completed"
                    ? CheckCircle
                    : attendanceStatus.status === "On Leave"
                    ? UserX
                    : Clock
                }
                color={
                  attendanceStatus.status === "Present"
                    ? "green"
                    : attendanceStatus.status === "Completed"
                    ? "blue"
                    : attendanceStatus.status === "On Leave"
                    ? "purple"
                    : "orange"
                }
              />
              <Card
                title="Pending Leaves"
                value={pendingLeaves}
                icon={AlertTriangle}
                color="orange"
              />
              <Card
                title="Recent Announcements"
                value={recentAnnouncements.length}
                icon={Bell}
                color="purple"
              />
              <Card
                title="Materials Uploaded"
                value={materialsUploaded}
                icon={FileUp}
                color="green"
              />
            </div>
          </div>

          {/* Analytics Section */}
          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-4">Analytics</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Card
                title="Monthly Attendance"
                value={`${monthlyAttendance}%`}
                icon={UserCheck}
                color="blue"
              />
              <Card
                title="Avg Class Strength"
                value={averageClassStrength}
                icon={Users}
                color="green"
              />
              <Card
                title="Recent Updates"
                value={recentMarkUpdates.length}
                icon={BookOpen}
                color="purple"
              />
            </div>
          </div>

          {/* My Exam Schedules Section */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Exam Schedules ({myExamSchedules.length})</h2>
            </div>
            <div className="bg-white rounded-lg shadow-md p-4">
              {myExamSchedules.length > 0 ? (
                <div className="space-y-4">
                  {myExamSchedules.map((schedule, idx) => (
                    <div key={idx} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-800">{schedule.examName}</h3>
                          <p className="text-sm text-gray-600 mt-1">
                            Class {schedule.class?.className || 'N/A'} - {schedule.class?.section || 'N/A'}
                          </p>
                          <p className="text-sm text-gray-500 mt-1">
                            {new Date(schedule.startDate).toLocaleDateString()} - {new Date(schedule.endDate).toLocaleDateString()}
                          </p>
                          <span className={`inline-block text-xs px-2 py-1 rounded-full mt-2 ${
                            schedule.createdBy?._id === user?.id 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-blue-100 text-blue-800'
                          }`}>
                            Created by {schedule.createdBy?._id === user?.id ? 'me (Staff)' : `${schedule.createdBy?.name || 'Unknown'} (${schedule.createdBy?.role === 'admin' ? 'Admin' : 'Staff'})`}
                          </span>
                        </div>
                        {schedule.createdBy?._id === user?.id && (
                          <div className="flex gap-2 ml-4">
                            <button
                              onClick={() => handleEditSchedule(schedule)}
                              className="flex items-center gap-1 bg-green-500 hover:bg-green-600 text-white px-3 py-1.5 rounded text-sm transition-colors"
                            >
                              <Edit2 size={14} />
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteSchedule(schedule)}
                              className="flex items-center gap-1 bg-red-500 hover:bg-red-600 text-white px-3 py-1.5 rounded text-sm transition-colors"
                            >
                              <Trash2 size={14} />
                              Delete
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Calendar size={48} className="mx-auto text-gray-400 mb-3" />
                  <p className="text-gray-500">No exam schedules created yet</p>
                  <Link
                    to="/staff/exam-schedule"
                    className="inline-block mt-2 text-blue-600 hover:text-blue-800 text-sm"
                  >
                    Create your first schedule
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Today's Schedule */}
          {todaySchedule.length > 0 && (
            <div className="mb-6">
              <h2 className="text-lg font-semibold mb-4">Today's Schedule</h2>
              <div className="bg-white rounded-lg shadow-md p-4">
                <div className="space-y-3">
                  {todaySchedule.map((schedule, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0"
                    >
                      <div className="flex items-center">
                        <Clock size={16} className="text-gray-400 mr-3" />
                        <div>
                          <span className="font-medium">
                            {schedule.subject}
                          </span>
                          <span className="text-sm text-gray-500 ml-2">
                            Class {schedule.class}
                          </span>
                        </div>
                      </div>
                      <span className="text-sm text-gray-600">
                        {schedule.time}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Recent Activity Log */}
          {recentMarkUpdates.length > 0 && (
            <div className="mb-6">
              <h2 className="text-lg font-semibold mb-4">
                Recent Mark Updates
              </h2>
              <div className="bg-white rounded-lg shadow-md p-4">
                <div className="space-y-3">
                  {recentMarkUpdates.map((update, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0"
                    >
                      <div className="flex items-center">
                        <Award size={16} className="text-green-500 mr-3" />
                        <div>
                          <span className="font-medium">{update.subject}</span>
                          <span className="text-sm text-gray-500 ml-2">
                            {update.studentName}
                          </span>
                        </div>
                      </div>
                      <span className="text-sm text-gray-600">
                        {new Date(update.updatedAt).toLocaleDateString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Recent Announcements */}
          {recentAnnouncements.length > 0 && (
            <div className="mb-6">
              <h2 className="text-lg font-semibold mb-4">
                Recent Announcements
              </h2>
              <div className="bg-white rounded-lg shadow-md p-4">
                <div className="space-y-3">
                  {recentAnnouncements.map((announcement, idx) => (
                    <div
                      key={idx}
                      className="py-3 border-b border-gray-100 last:border-b-0"
                    >
                      <div className="flex items-start">
                        <Bell size={16} className="text-purple-500 mr-3 mt-1" />
                        <div className="flex-1">
                          <h4 className="font-medium">{announcement.title}</h4>
                          <p className="text-sm text-gray-600 mt-1">
                            {announcement.content}
                          </p>
                          <span className="text-xs text-gray-400 mt-2 block">
                            {new Date(
                              announcement.createdAt
                            ).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Original Quick Actions - Maintained */}
          <div>
            <h2 className="text-lg font-semibold mb-4">Main Actions</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
              {quickActions.map((action, idx) => (
                <Link
                  key={idx}
                  to={action.link}
                  className={`${action.color} text-white rounded-lg shadow-lg p-4 lg:p-6 hover:opacity-90 transition-all duration-200 flex flex-col items-center text-center`}
                >
                  <action.icon
                    size={32}
                    className="mb-3 lg:mb-4 lg:w-12 lg:h-12"
                  />
                  <h3 className="text-lg lg:text-xl font-bold">
                    {action.title}
                  </h3>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StaffDashboard;
