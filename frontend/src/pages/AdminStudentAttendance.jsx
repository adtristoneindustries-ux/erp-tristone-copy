import { useState, useEffect, useContext } from 'react';
import { Calendar, Filter, Users, Download, ClipboardList } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import { attendanceAPI, classAPI, userAPI } from '../services/api';
import { SocketContext } from '../context/SocketContext';

const AdminStudentAttendance = () => {
  const [attendance, setAttendance] = useState([]);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [classes, setClasses] = useState([]);
  const [selectedClassSection, setSelectedClassSection] = useState('');
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    fetchClasses();
  }, []);


  const fetchClasses = async () => {
    try {
      const response = await classAPI.getClasses();
      setClasses(response.data || []);
    } catch (error) {
      console.error('Failed to fetch classes:', error);
    }
  };

  const fetchAttendance = async () => {
    if (!selectedClassSection) {
      // Show all classes by default
      setLoading(true);
      try {
        const params = {};
        if (startDate) params.startDate = startDate;
        if (endDate) params.endDate = endDate;
        
        const res = await attendanceAPI.getAttendance(params);
        setAttendance(res.data);
      } catch (error) {
        console.error('Error fetching attendance:', error);
        setAttendance([]);
      }
      setLoading(false);
      return;
    }
    
    setLoading(true);
    try {
      const [className, section] = selectedClassSection.split(' - ');
      const params = {
        class: className,
        section: section
      };
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;
      
      const res = await attendanceAPI.getAttendance(params);
      setAttendance(res.data);
    } catch (error) {
      console.error('Error fetching attendance:', error);
      setAttendance([]);
    }
    setLoading(false);
  };

  const getAttendanceStats = () => {
    if (!selectedClassSection || attendance.length === 0) return null;
    
    const present = attendance.filter(record => record.status === 'present').length;
    const absent = attendance.filter(record => record.status === 'absent').length;
    const late = attendance.filter(record => record.status === 'late').length;
    
    return { present, absent, late, total: attendance.length };
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
      
      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      
      // Generate filename with date range
      let dateRange = '';
      if (startDate && endDate) {
        dateRange = `_${startDate}_to_${endDate}`;
      } else if (startDate) {
        dateRange = `_from_${startDate}`;
      } else if (endDate) {
        dateRange = `_until_${endDate}`;
      } else {
        dateRange = `_${new Date().toISOString().split('T')[0]}`;
      }
      
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


  useEffect(() => {
    fetchAttendance();
  }, []);

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 lg:ml-64 transition-all duration-300">
        <Navbar />
        <div className="p-4 lg:p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Users className="text-blue-600" size={24} />
              Student Attendance Management
            </h1>
            <p className="text-base text-gray-600">Monitor student attendance records</p>
          </div>

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
                onClick={fetchAttendance}
                disabled={loading}
                className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <Filter size={16} />
                {loading ? 'Loading...' : 'Filter'}
              </button>
            </div>
            <div className="mt-4 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-3">
              <div className="p-3 bg-blue-50 border border-blue-200 rounded flex-1 w-full flex items-center gap-2">
                <ClipboardList size={16} className="text-blue-600" />
                <p className="text-blue-800 text-xs lg:text-sm font-medium">View Only - Attendance records are managed by staff</p>
              </div>
              <div className="flex flex-wrap gap-4 text-sm">
                {selectedClassSection && getAttendanceStats() && (
                  <>
                    <div className="text-green-600">
                      Present: <span className="font-semibold">{getAttendanceStats().present}</span>
                    </div>
                    <div className="text-red-600">
                      Absent: <span className="font-semibold">{getAttendanceStats().absent}</span>
                    </div>
                    {getAttendanceStats().late > 0 && (
                      <div className="text-yellow-600">
                        Late: <span className="font-semibold">{getAttendanceStats().late}</span>
                      </div>
                    )}
                  </>
                )}
                <div className="text-gray-600">
                  Total Records: <span className="font-semibold">{attendance.length}</span>
                </div>
              </div>
            </div>
            
            <div className="mt-4 flex flex-wrap gap-3">
              {selectedClassSection && (
                <button
                  onClick={() => downloadAttendanceData(false)}
                  disabled={downloading || attendance.length === 0}
                  className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 flex items-center gap-2 disabled:opacity-50 text-sm"
                >
                  <Download size={16} />
                  {downloading ? 'Downloading...' : `Download ${selectedClassSection}${startDate || endDate ? ' (Date Range)' : ''}`}
                </button>
              )}
              <button
                onClick={() => downloadAttendanceData(true)}
                disabled={downloading}
                className="bg-purple-500 text-white px-4 py-2 rounded-lg hover:bg-purple-600 flex items-center gap-2 disabled:opacity-50 text-sm"
              >
                <Download size={16} />
                {downloading ? 'Downloading...' : `Download All Classes${startDate || endDate ? ' (Date Range)' : ''}`}
              </button>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            {loading ? (
              <div className="p-8 text-center text-gray-500">
                Loading student attendance records...
              </div>
            ) : (
              <>
                {/* Desktop Table View */}
                <div className="hidden lg:block overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Class & Section</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Remarks</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {attendance.map((record, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="font-medium">{record.user?.name || record.student?.name || record.studentName || 'N/A'}</div>
                              <div className="text-sm text-gray-500">{record.user?.email || record.student?.email || record.studentEmail || 'N/A'}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm">
                              {record.user?.class || record.student?.class || record.studentClass || 'N/A'} - {record.user?.section || record.student?.section || 'N/A'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {new Date(record.date).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric'
                            })}
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
                          <td className="px-6 py-4 text-sm text-gray-900">{record.remarks || '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile Card View */}
                <div className="lg:hidden divide-y divide-gray-200">
                  {attendance.map((record, index) => (
                    <div key={index} className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h3 className="font-medium text-lg">{record.user?.name || record.student?.name || record.studentName || 'N/A'}</h3>
                          <p className="text-sm text-gray-600">{record.user?.email || record.student?.email || record.studentEmail || 'N/A'}</p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                          record.status === 'present' ? 'bg-green-100 text-green-800' :
                          record.status === 'absent' ? 'bg-red-100 text-red-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                        </span>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-500">Class & Section:</span>
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm">
                            {record.user?.class || record.student?.class || record.studentClass || 'N/A'} - {record.user?.section || record.student?.section || 'N/A'}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-500">Date:</span>
                          <span className="text-sm font-medium">
                            {new Date(record.date).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric'
                            })}
                          </span>
                        </div>
                        {record.remarks && (
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-500">Remarks:</span>
                            <span className="text-sm font-medium">{record.remarks}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                
                {attendance.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    No attendance records found. Select a class and date range to view records.
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminStudentAttendance;