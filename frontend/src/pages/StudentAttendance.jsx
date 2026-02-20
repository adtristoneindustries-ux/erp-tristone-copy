import { useState, useEffect, useContext } from 'react';
import { Calendar, TrendingUp, TrendingDown } from 'lucide-react';
import Layout from '../components/Layout';
import Table from '../components/Table';
import { attendanceAPI } from '../services/api';
import { AuthContext } from '../context/AuthContext';
import { SocketContext } from '../context/SocketContext';

const StudentAttendance = () => {
  const [attendance, setAttendance] = useState([]);
  const [stats, setStats] = useState({ total: 0, present: 0, absent: 0, percentage: 0 });
  const [loading, setLoading] = useState(false);
  const { user } = useContext(AuthContext);
  const socket = useContext(SocketContext);

  useEffect(() => {
    fetchAttendance();
  }, []);

  useEffect(() => {
    if (socket) {
      socket.on('studentAttendanceUpdate', (updatedAttendance) => {
        if (updatedAttendance.student._id === user.id) {
          fetchAttendance();
        }
      });
      return () => socket.off('studentAttendanceUpdate');
    }
  }, [socket, user]);

  const fetchAttendance = async () => {
    setLoading(true);
    try {
      const res = await attendanceAPI.getAttendance({ user: user.id });
      setAttendance(res.data);

      // Calculate stats
      const total = res.data.length;
      const present = res.data.filter(record => record.status === 'present').length;
      const absent = res.data.filter(record => record.status === 'absent').length;
      const percentage = total > 0 ? Math.round((present / total) * 100) : 0;

      setStats({ total, present, absent, percentage });
    } catch (error) {
      console.error('Error fetching attendance:', error);
    }
    setLoading(false);
  };

  const columns = [
    {
      header: 'Date', render: (row) => (
        <div className="text-xs lg:text-sm font-medium">
          {new Date(row.date).toLocaleDateString()}
        </div>
      )
    },
    {
      header: 'Day', render: (row) => (
        <div className="text-xs lg:text-sm">
          {new Date(row.date).toLocaleDateString('en-US', { weekday: 'short' })}
        </div>
      )
    },
    {
      header: 'Status', render: (row) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${row.status === 'present' ? 'bg-green-100 text-green-800' :
            row.status === 'absent' ? 'bg-red-100 text-red-800' :
              'bg-yellow-100 text-yellow-800'
          }`}>
          {row.status === 'present' ? 'P' : row.status === 'absent' ? 'A' : 'L'}
          <span className="hidden sm:inline ml-1">
            {row.status.charAt(0).toUpperCase() + row.status.slice(1)}
          </span>
        </span>
      )
    },
    {
      header: 'Subject', render: (row) => (
        <div className="text-xs lg:text-sm truncate max-w-[80px] lg:max-w-none">
          {row.subject?.name || 'General'}
        </div>
      )
    },
    {
      header: 'Remarks', render: (row) => (
        <div className="text-xs lg:text-sm text-gray-500 truncate max-w-[60px] lg:max-w-none">
          {row.remarks || '-'}
        </div>
      )
    }
  ];

  return (
    <Layout title={<div className="flex items-center gap-2"><Calendar className="text-blue-600" />My Attendance</div>}>
      {/* Attendance Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-6">
        <div className="bg-white rounded-lg shadow-md p-4 lg:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Days</p>
              <p className="text-xl lg:text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <Calendar className="h-6 w-6 lg:h-8 lg:w-8 text-blue-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-4 lg:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Present</p>
              <p className="text-xl lg:text-2xl font-bold text-green-600">{stats.present}</p>
            </div>
            <TrendingUp className="h-6 w-6 lg:h-8 lg:w-8 text-green-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-4 lg:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Absent</p>
              <p className="text-xl lg:text-2xl font-bold text-red-600">{stats.absent}</p>
            </div>
            <TrendingDown className="h-6 w-6 lg:h-8 lg:w-8 text-red-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-4 lg:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Attendance %</p>
              <p className={`text-xl lg:text-2xl font-bold ${stats.percentage >= 75 ? 'text-green-600' :
                  stats.percentage >= 50 ? 'text-yellow-600' : 'text-red-600'
                }`}>
                {stats.percentage}%
              </p>
            </div>
            <div className={`h-6 w-6 lg:h-8 lg:w-8 rounded-full flex items-center justify-center ${stats.percentage >= 75 ? 'bg-green-100' :
                stats.percentage >= 50 ? 'bg-yellow-100' : 'bg-red-100'
              }`}>
              <span className={`text-xs lg:text-sm font-bold ${stats.percentage >= 75 ? 'text-green-600' :
                  stats.percentage >= 50 ? 'text-yellow-600' : 'text-red-600'
                }`}>
                %
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md">
        <div className="p-4 border-b">
          <h2 className="text-lg font-semibold">Attendance Records</h2>
        </div>
        {loading ? (
          <div className="p-6 lg:p-8 text-center text-gray-500">
            Loading attendance records...
          </div>
        ) : attendance.length === 0 ? (
          <div className="p-6 lg:p-8 text-center text-gray-500">
            No attendance records found
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table columns={columns} data={attendance} />
          </div>
        )}
      </div>
    </Layout>
  );
};

export default StudentAttendance;
