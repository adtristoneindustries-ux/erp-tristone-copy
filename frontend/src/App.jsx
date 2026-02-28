import { useContext, useEffect } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import { AuthContext } from "./context/AuthContext";
import Login from "./pages/Login";
import AdminDashboard from "./pages/AdminDashboard";
import AdminStudents from "./pages/AdminStudents";
import AdminStaff from "./pages/AdminStaff";
import AdminSubjects from "./pages/AdminSubjects";
import AdminStudentAttendance from "./pages/AdminStudentAttendance";
import AdminStaffAttendance from "./pages/AdminStaffAttendance";
import AdminClasses from "./pages/AdminClasses";
import AdminMarks from "./pages/AdminMarks";
import AdminAnnouncements from "./pages/AdminAnnouncements";
import AdminLeaves from "./pages/AdminLeaves";
import AdminFeedback from "./pages/AdminFeedback";
import StaffStudents from "./pages/StaffStudents";
import StaffDashboard from "./pages/StaffDashboard";
import StaffMarks from "./pages/StaffMarks";
import StaffAttendance from "./pages/StaffAttendance";
import StaffMyAttendance from "./pages/StaffMyAttendance";
import StaffAnnouncements from "./pages/StaffAnnouncements";
import StaffLeaves from "./pages/StaffLeaves";
import StaffStudentLeaves from "./pages/StaffStudentLeaves";
import StudentLeaveRequests from "./pages/StudentLeaveRequests";
import StudentLeaveRequest from "./pages/StudentLeaveRequest";
import StaffHomework from "./pages/StaffHomework";
import StudentHomework from "./pages/StudentHomework";
import StaffFeedback from "./pages/StaffFeedback";
import StaffDigitalClassroom from "./pages/StaffDigitalClassroom";
import StudentDigitalClassroom from "./pages/StudentDigitalClassroom";

import StudentDashboard from "./pages/StudentDashboard";
import StudentProfile from "./pages/StudentProfile";
import StudentMarks from "./pages/StudentMarks";
import StudentAttendance from "./pages/StudentAttendance";
import StudentTimetable from "./pages/StudentTimetable";
import StudentAnnouncements from "./pages/StudentAnnouncements";
import StudentCafeteria from "./pages/StudentCafeteria";
import StudentTransport from "./pages/StudentTransport";
import StudentHostel from "./pages/StudentHostel";
import StudentMedicalReports from "./pages/StudentMedicalReports";
import StudentFeedback from "./pages/StudentFeedback";
import AdminTimetable from "./pages/AdminTimetable";
import AdminStudentTimetable from "./pages/AdminStudentTimetable";
import AdminStaffTimetable from "./pages/AdminStaffTimetable";
import StaffTimetable from "./pages/StaffTimetable";
import TimetableModule from "./pages/TimetableModule";
import AdminExamSchedule from "./pages/AdminExamSchedule";
import StaffExamSchedule from "./pages/StaffExamSchedule";
import StudentExamSchedule from "./pages/StudentExamSchedule";
import NotFound from "./pages/NotFound";

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useContext(AuthContext);

  if (loading)
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );

  if (!user || !localStorage.getItem('token')) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

function App() {
  const { user, loading } = useContext(AuthContext);

  // Show loading screen while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-700 mb-2">
            School ERP System
          </h2>
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <Routes>
        <Route
          path="/login"
          element={<Login />}
        />

        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/students"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminStudents />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/staff"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminStaff />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/subjects"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminSubjects />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/classes"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminClasses />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/attendance"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminStudentAttendance />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/staff-attendance"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminStaffAttendance/>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/marks"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminMarks />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/announcements"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminAnnouncements />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/leaves"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminLeaves />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/student-timetable"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminStudentTimetable />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/staff-timetable"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminStaffTimetable />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/timetable"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <TimetableModule />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/feedback"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminFeedback />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/exam-schedule"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminExamSchedule />
            </ProtectedRoute>
          }
        />

        <Route
          path="/staff"
          element={
            <ProtectedRoute allowedRoles={["staff"]}>
              <StaffDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/staff/students"
          element={
            <ProtectedRoute allowedRoles={["staff"]}>
              <StaffStudents />
            </ProtectedRoute>
          }
        />
        <Route
          path="/staff/marks"
          element={
            <ProtectedRoute allowedRoles={["staff"]}>
              <StaffMarks />
            </ProtectedRoute>
          }
        />
        <Route
          path="/staff/attendance"
          element={
            <ProtectedRoute allowedRoles={["staff"]}>
              <StaffAttendance />
            </ProtectedRoute>
          }
        />
        <Route
          path="/staff/my-attendance"
          element={
            <ProtectedRoute allowedRoles={["staff"]}>
              <StaffMyAttendance />
            </ProtectedRoute>
          }
        />

        <Route
          path="/staff/announcements"
          element={
            <ProtectedRoute allowedRoles={["staff"]}>
              <StaffAnnouncements />
            </ProtectedRoute>
          }
        />
        <Route
          path="/staff/leaves"
          element={
            <ProtectedRoute allowedRoles={["staff"]}>
              <StaffLeaves />
            </ProtectedRoute>
          }
        />
        <Route
          path="/staff/student-leaves"
          element={
            <ProtectedRoute allowedRoles={["staff"]}>
              <StaffStudentLeaves />
            </ProtectedRoute>
          }
        />
        <Route
          path="/staff/timetable"
          element={
            <ProtectedRoute allowedRoles={["staff"]}>
              <StaffTimetable />
            </ProtectedRoute>
          }
        />
        <Route
          path="/staff/homework"
          element={
            <ProtectedRoute allowedRoles={["staff"]}>
              <StaffHomework />
            </ProtectedRoute>
          }
        />
        <Route
          path="/staff/feedback"
          element={
            <ProtectedRoute allowedRoles={["staff"]}>
              <StaffFeedback />
            </ProtectedRoute>
          }
        />
        <Route
          path="/staff/digital-classroom"
          element={
            <ProtectedRoute allowedRoles={["staff"]}>
              <StaffDigitalClassroom />
            </ProtectedRoute>
          }
        />
        <Route
          path="/staff/exam-schedule"
          element={
            <ProtectedRoute allowedRoles={["staff"]}>
              <StaffExamSchedule />
            </ProtectedRoute>
          }
        />

        <Route
          path="/student"
          element={
            <ProtectedRoute allowedRoles={["student"]}>
              <StudentDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/profile"
          element={
            <ProtectedRoute allowedRoles={["student"]}>
              <StudentProfile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/marks"
          element={
            <ProtectedRoute allowedRoles={["student"]}>
              <StudentMarks />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/attendance"
          element={
            <ProtectedRoute allowedRoles={["student"]}>
              <StudentAttendance />
            </ProtectedRoute>
          }
        />

        <Route
          path="/student/timetable"
          element={
            <ProtectedRoute allowedRoles={["student"]}>
              <StudentTimetable />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/leave-request"
          element={
            <ProtectedRoute allowedRoles={["student"]}>
              <StudentLeaveRequest />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/leave-requests"
          element={
            <ProtectedRoute allowedRoles={["student"]}>
              <StudentLeaveRequests />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/announcements"
          element={
            <ProtectedRoute allowedRoles={["student"]}>
              <StudentAnnouncements />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/homework"
          element={
            <ProtectedRoute allowedRoles={["student"]}>
              <StudentHomework />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/cafeteria"
          element={
            <ProtectedRoute allowedRoles={["student"]}>
              <StudentCafeteria />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/transport"
          element={
            <ProtectedRoute allowedRoles={["student"]}>
              <StudentTransport />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/hostel"
          element={
            <ProtectedRoute allowedRoles={["student"]}>
              <StudentHostel />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/medical-reports"
          element={
            <ProtectedRoute allowedRoles={["student"]}>
              <StudentMedicalReports />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/feedback"
          element={
            <ProtectedRoute allowedRoles={["student"]}>
              <StudentFeedback />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/digital-classroom"
          element={
            <ProtectedRoute allowedRoles={["student"]}>
              <StudentDigitalClassroom />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/exam-schedule"
          element={
            <ProtectedRoute allowedRoles={["student"]}>
              <StudentExamSchedule />
            </ProtectedRoute>
          }
        />

        <Route
          path="/"
          element={<Navigate to="/login" replace />}
        />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
