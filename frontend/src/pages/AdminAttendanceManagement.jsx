import { useState, useEffect } from 'react';
import { Calendar, Filter, Users, Download, ClipboardList, Search } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import { attendanceAPI, staffAttendanceAPI, classAPI, userAPI } from '../services/api';

const AdminAttendanceManagement = () => {
  const [activeTab, setActiveTab] = useState('students');
  
  // Student Attendance State
  const [studentAttendance, setStudentAttendance] = useState([]);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [classes, setClasses] = useState([]);
  const [selectedClassSection, setSelectedClassSection] = useState('');
  const [downloading, setDownloading] = useState(false);
  
  // Staff Attendance State
  const [staff, setStaff] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [staffAttendance, setStaffAttendance] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchClasses();
    fetchStaff();
  }, []);

  useEffect(() => {
    if (activeTab === 'students') {
      fetchStudentAttendance();
    } else {
      fetchStaffAttendance();
    }
  }, [activeTab, selectedDate]);

  const fetchClasses = async () => {
    try {
      const response = await classAPI.getClasses();
      setClasses(response.data || []);
    } catch (error) {
      console.error('Failed to fetch classes:', error);
    }
  };

  const fetchStaff = async () => {
    try {
      const res = await userAPI.getUsers({ role: 'staff' });
      setStaff(res.data || []);
    } catch (error) {
      console.error('Error fetching staff:', error);
    }
  };

  const fetchStudentAttendance = async () => {
    setLoading(true);
    try {
      const params = {};
      if (selectedClassSection) {
        const [className, section] = selectedClassSection.split(' - ');
        params.class = className;
        params.section = section;
      }
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;
      
      const res = await attendanceAPI.getAttendance(params);
      setStudentAttendance(res.data || []);
    } catch (error) {
      console.error('Error fetching student attendance:', error);
      setStudentAttendance([]);
    }
    setLoading(false);
  };

  const fetchStaffAttendance = async () => {
    try {
      const res = await staffAttendanceAPI.getStaffAttendance({ date: selectedDate });
      setStaffAttendance(res.data.attendance || []);
    } catch (error) {
      console.error('Error fetching staff attendance:', error);
      setStaffAttendance([]);
    }
  };

  const downloadAttendanceData = async (downloadAll = false) => {
    setDownloading(true);
    try {
      const params = {};
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;
      
      if (!downloadAll && selectedClassSection) {
        const [className, section] = selectedClassSection.split(' - ');
        params.class = className;
        params.section = section;
      }
      
      const response = await attendanceAPI.downloadAttendance(params);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      
      let dateRange = startDate && endDate ? `_${startDate}_to_${endDate}` : `_${new Date().toISOString().split('T')[0]}`;
      const filename = downloadAll 
        ? `all_classes_attendance${dateRange}.csv`
        : `${(selectedClassSection || 'attendance').replace(' - ', '_')}${dateRange}.csv`;
      
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download failed:', error);
      alert('Failed to download attendance data');
    }
    setDownloading(false);
  };

  const getStudentStats = () => {
    if (!selectedClassSection || studentAttendance.length === 0) return null;
    const present = studentAttendance.filter(r => r.status === 'present').length;
    const absent = studentAttendance.filter(r => r.status === 'absent').length;
    const late = studentAttendance.filter(r => r.status === 'late').length;
    return { present, absent, late, total: studentAttendance.length };
  };

  const getStaffStats = () => {
    const present = staffAttendance.filter(r => r.status === 'present').length;
    const absent = staff.length - present;
    return { present, absent, total: staff.length };
  };

  const getStaffAttendanceRecord = (staffId) => {
    return staffAttendance.find(record => record.staff && record.staff._id === staffId);
  };

  const filteredStaff = staff.filter(member =>
    member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 lg:ml-64">
        <Navbar />
        <div className="p-4 lg:p-6">
          <h1 className="text-2xl font-bold mb-6">Attendance Management</h1>

          {/* Tabs */}
          <div className="bg-white rounded-lg shadow-md mb-6">
            <div className="flex border-b">
              <button
                onClick={() => setActiveTab('students')}
                className={`px-6 py-3 font-medium transition-colors ${
                  activeTab === 'students'
                    ? 'border-b-2 border-blue-600 text-blue-600'
                    : 'text-gray-600 hover:text-blue-600'
                }`}
              >
                Students
              </button>
              <button
                onClick={() => setActiveTab('staff')}
                className={`px-6 py-3 font-medium transition-colors ${
                  activeTab === 'staff'
                    ? 'border-b-2 border-blue-600 text-blue-600'
                    : 'text-gray-600 hover:text-blue-600'
                }`}
              >
                Staff
              </button>
            </div>
          </div>

          {/* Student Attendance Tab */}
          {activeTab === 'students' && (
            <>
              <div className="bg-white rounded-lg shadow-md p-4 mb-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 items-end">
                  <div>
                    <label className="block text-sm font-medium mb-2">Class & Section</label>
                    <select
                      value={selectedClassSection}
                      onChange={(e) => setSelectedClassSection(e.target.value)}
                      className="w-full px-4 py-2 border rounded-lg"
                    >
                      <option value="">Select Class & Section</option>
                      {classes.map(cls => (
                        <option key={`${cls.className}-${cls.section}`} value={`${cls.className} - ${cls.section}`}>
                          {cls.className} - {cls.section}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Start Date</label>
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full px-4 py-2 border rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">End Date</label>
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="w-full px-4 py-2 border rounded-lg"
                    />
                  </div>
                  <button
                    onClick={fetchStudentAttendance}
                    disabled={loading}
                    className="bg-purple-500 text-white px-6 py-2 rounded-lg hover:bg-purple-600 flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    <Search size={16} />
                    {loading ? 'Loading...' : 'Search'}
                  </button>
                </div>
                
                <div className="mt-4 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-3">
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded flex-1 w-full flex items-center gap-2">
                    <ClipboardList size={16} className="text-blue-600" />
                    <p className="text-blue-800 text-xs lg:text-sm font-medium">View Only - Attendance records are managed by staff</p>
                  </div>
                  <div className="flex flex-wrap gap-4 text-sm">
                    {selectedClassSection && getStudentStats() && (
                      <>
                        <div className="text-green-600">
                          Present: <span className="font-semibold">{getStudentStats().present}</span>
                        </div>
                        <div className="text-red-600">
                          Absent: <span className="font-semibold">{getStudentStats().absent}</span>
                        </div>
                        {getStudentStats().late > 0 && (
                          <div className="text-yellow-600">
                            Late: <span className="font-semibold">{getStudentStats().late}</span>
                          </div>
                        )}
                      </>
                    )}
                    <div className="text-gray-600">
                      Total Records: <span className="font-semibold">{studentAttendance.length}</span>
                    </div>
                  </div>
                </div>
                
                <div className="mt-4 flex flex-wrap gap-3">
                  {selectedClassSection && (
                    <button
                      onClick={() => downloadAttendanceData(false)}
                      disabled={downloading || studentAttendance.length === 0}
                      className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 flex items-center gap-2 disabled:opacity-50 text-sm"
                    >
                      <Download size={16} />
                      {downloading ? 'Downloading...' : `Download ${selectedClassSection}`}
                    </button>
                  )}
                  <button
                    onClick={() => downloadAttendanceData(true)}
                    disabled={downloading}
                    className="bg-purple-500 text-white px-4 py-2 rounded-lg hover:bg-purple-600 flex items-center gap-2 disabled:opacity-50 text-sm"
                  >
                    <Download size={16} />
                    {downloading ? 'Downloading...' : 'Download All Classes'}
                  </button>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                {loading ? (
                  <div className="p-8 text-center text-gray-500">Loading student attendance records...</div>
                ) : (
                  <>
                    <div className="hidden lg:block overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Student</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Class & Section</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Remarks</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {studentAttendance.map((record, index) => (
                            <tr key={index} className="hover:bg-gray-50">
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div>
                                  <div className="font-medium">{record.user?.name || record.student?.name || 'N/A'}</div>
                                  <div className="text-sm text-gray-500">{record.user?.email || record.student?.email || 'N/A'}</div>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm">
                                  {record.user?.class || record.student?.class || 'N/A'} - {record.user?.section || record.student?.section || 'N/A'}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm">
                                {new Date(record.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                                  record.status === 'present' ? 'bg-green-100 text-green-800' :
                                  record.status === 'absent' ? 'bg-red-100 text-red-800' :
                                  'bg-yellow-100 text-yellow-800'
                                }`}>
                                  {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                                </span>
                              </td>
                              <td className="px-6 py-4 text-sm">{record.remarks || '-'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    
                    {studentAttendance.length === 0 && (
                      <div className="text-center py-8 text-gray-500">
                        No attendance records found. Select a class and date range to view records.
                      </div>
                    )}
                  </>
                )}
              </div>
            </>
          )}

          {/* Staff Attendance Tab */}
          {activeTab === 'staff' && (
            <>
              <div className="bg-white rounded-lg shadow-md p-4 mb-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
                  <div className="flex items-center gap-4">
                    <Calendar className="text-gray-500" />
                    <label className="font-medium">Select Date:</label>
                    <input
                      type="date"
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="relative w-full sm:w-64">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                    <input
                      type="text"
                      placeholder="Search staff..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="bg-blue-50 p-3 rounded-lg text-center">
                    <div className="text-2xl font-bold text-blue-600">{getStaffStats().total}</div>
                    <div className="text-sm text-blue-800">Total Staff</div>
                  </div>
                  <div className="bg-green-50 p-3 rounded-lg text-center">
                    <div className="text-2xl font-bold text-green-600">{getStaffStats().present}</div>
                    <div className="text-sm text-green-800">Present</div>
                  </div>
                  <div className="bg-red-50 p-3 rounded-lg text-center">
                    <div className="text-2xl font-bold text-red-600">{getStaffStats().absent}</div>
                    <div className="text-sm text-red-800">Absent</div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="p-4 border-b">
                  <h2 className="text-lg font-semibold">
                    Staff Attendance for {new Date(selectedDate).toLocaleDateString('en-US', {
                      year: 'numeric', month: 'long', day: 'numeric'
                    })}
                  </h2>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Staff Name</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Email</th>
                        <th className="px-4 py-3 text-center text-sm font-medium text-gray-700">Status</th>
                        <th className="px-4 py-3 text-center text-sm font-medium text-gray-700">In Time</th>
                        <th className="px-4 py-3 text-center text-sm font-medium text-gray-700">Out Time</th>
                        <th className="px-4 py-3 text-center text-sm font-medium text-gray-700">Total Hours</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {filteredStaff.map(member => {
                        const attendanceRecord = getStaffAttendanceRecord(member._id);
                        return (
                          <tr key={member._id} className="hover:bg-gray-50">
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                  <span className="text-blue-600 font-semibold text-sm">
                                    {member.name.charAt(0).toUpperCase()}
                                  </span>
                                </div>
                                <div>
                                  <div className="font-medium">{member.name}</div>
                                  <div className="text-sm text-gray-500">{member.subject || 'N/A'}</div>
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-600">{member.email}</td>
                            <td className="px-4 py-3 text-center">
                              {attendanceRecord ? (
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                  attendanceRecord.status === 'present' ? 'bg-green-100 text-green-800' :
                                  attendanceRecord.status === 'absent' ? 'bg-red-100 text-red-800' :
                                  'bg-yellow-100 text-yellow-800'
                                }`}>
                                  {attendanceRecord.status.charAt(0).toUpperCase() + attendanceRecord.status.slice(1)}
                                </span>
                              ) : (
                                <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium">
                                  Absent
                                </span>
                              )}
                            </td>
                            <td className="px-4 py-3 text-center text-sm">{attendanceRecord?.inTime || '--'}</td>
                            <td className="px-4 py-3 text-center text-sm">{attendanceRecord?.outTime || '--'}</td>
                            <td className="px-4 py-3 text-center text-sm font-medium">{attendanceRecord?.totalHours || '--'}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                  
                  {filteredStaff.length === 0 && (
                    <div className="text-center py-8 text-gray-500">No staff members found</div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminAttendanceManagement;
