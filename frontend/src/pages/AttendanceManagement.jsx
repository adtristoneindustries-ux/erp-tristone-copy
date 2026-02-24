import { useState } from 'react';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import StudentAttendanceTab from '../components/attendanceManagement/StudentAttendanceTab';
import StaffAttendanceTab from '../components/attendanceManagement/StaffAttendanceTab';

const AttendanceManagement = () => {
  const [activeTab, setActiveTab] = useState('student');

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 lg:ml-64 transition-all duration-300">
        <Navbar />
        <div className="p-3 sm:p-4 lg:p-6">
          <div className="mb-4 lg:mb-6">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">Attendance Management</h1>
            <p className="text-gray-600 mt-1 text-xs sm:text-sm lg:text-base">Manage student and staff attendance</p>
          </div>

          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="border-b border-gray-200">
              <div className="flex">
                <button
                  onClick={() => setActiveTab('student')}
                  className={`flex-1 px-3 sm:px-4 lg:px-6 py-3 lg:py-4 text-center text-sm lg:text-base font-medium transition-colors ${
                    activeTab === 'student'
                      ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  Student Attendance
                </button>
                <button
                  onClick={() => setActiveTab('staff')}
                  className={`flex-1 px-3 sm:px-4 lg:px-6 py-3 lg:py-4 text-center text-sm lg:text-base font-medium transition-colors ${
                    activeTab === 'staff'
                      ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  Staff Attendance
                </button>
              </div>
            </div>

            <div>
              {activeTab === 'student' && <StudentAttendanceTab />}
              {activeTab === 'staff' && <StaffAttendanceTab />}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AttendanceManagement;
