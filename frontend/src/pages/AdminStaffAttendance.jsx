import { useState, useEffect } from 'react';
import { Calendar, Users } from 'lucide-react';
import Layout from '../components/Layout';
import { staffAttendanceAPI, userAPI } from '../services/api';
import { useAlert } from '../hooks/useAlert';

const AdminStaffAttendance = () => {
  const [staff, setStaff] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [attendance, setAttendance] = useState([]);
  const { showError } = useAlert();

  useEffect(() => {
    fetchStaff();
  }, []);

  useEffect(() => {
    fetchAttendance();
  }, [selectedDate]);

  const fetchStaff = async () => {
    try {
      const res = await userAPI.getUsers({ role: 'staff' });
      setStaff(res.data);
    } catch (error) {
      console.error('Error fetching staff:', error);
      showError('Failed to fetch staff members');
    }
  };

  const fetchAttendance = async () => {
    try {
      const res = await staffAttendanceAPI.getStaffAttendance({ date: selectedDate });
      setAttendance(res.data.attendance || []);
    } catch (error) {
      console.error('Error fetching attendance:', error);
      showError('Failed to fetch attendance records');
      setAttendance([]);
    }
  };

  const getStaffAttendance = (staffId) => {
    return attendance.find(record => record.staff && record.staff._id === staffId);
  };

  const getStats = () => {
    const present = attendance.filter(record => record.status === 'present').length;
    const absent = staff.length - present;
    return { present, absent, total: staff.length };
  };

  return (
    <Layout>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h1 className="text-xl lg:text-2xl font-bold flex items-center gap-2">
            <Users className="text-blue-600" />
            Staff Attendance
          </h1>
          <p className="text-gray-600 text-sm lg:text-base">View staff attendance records</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-4">
            <Calendar className="text-gray-500" />
            <label className="font-medium text-sm lg:text-base">Select Date:</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="px-3 lg:px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 text-sm lg:text-base"
            />
          </div>
        </div>
        
        {/* Live Statistics */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-blue-50 p-3 rounded-lg text-center">
            <div className="text-2xl font-bold text-blue-600">{getStats().total}</div>
            <div className="text-sm text-blue-800">Total Staff</div>
          </div>
          <div className="bg-green-50 p-3 rounded-lg text-center">
            <div className="text-2xl font-bold text-green-600">{getStats().present}</div>
            <div className="text-sm text-green-800">Present</div>
          </div>
          <div className="bg-red-50 p-3 rounded-lg text-center">
            <div className="text-2xl font-bold text-red-600">{getStats().absent}</div>
            <div className="text-sm text-red-800">Absent</div>
          </div>
        </div>
      </div>

      {/* Staff Attendance Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-4 border-b">
          <h2 className="text-lg font-semibold">
            Staff Attendance for {new Date(selectedDate).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
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
              {staff.map(member => {
                const attendanceRecord = getStaffAttendance(member._id);
                
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
                    <td className="px-4 py-3 text-center text-sm">
                      {attendanceRecord?.inTime || '--'}
                    </td>
                    <td className="px-4 py-3 text-center text-sm">
                      {attendanceRecord?.outTime || '--'}
                    </td>
                    <td className="px-4 py-3 text-center text-sm font-medium">
                      {attendanceRecord?.totalHours || '--'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          
          {staff.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No staff members found
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};
export default AdminStaffAttendance;