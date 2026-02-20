import { useState, useEffect } from 'react';
import { Calendar, Filter, Users } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import Table from '../components/Table';
import { staffAttendanceAPI } from '../services/api';

const StaffViewAttendance = () => {
  const [attendance, setAttendance] = useState([]);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchAttendance();
  }, []);

  const fetchAttendance = async () => {
    setLoading(true);
    try {
      const params = {};
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;
      const res = await staffAttendanceAPI.getStaffAttendance(params);
      setAttendance(res.data);
    } catch (error) {
      console.error('Error fetching attendance:', error);
    }
    setLoading(false);
  };

  const columns = [
    { header: 'Staff', render: (row) => row.staffName || 'N/A' },
    { header: 'Email', render: (row) => row.staffEmail || 'N/A' },
    { header: 'Subject', render: (row) => row.staffSubject || 'N/A' },
    { header: 'Date', render: (row) => new Date(row.date).toLocaleDateString() },
    { header: 'Status', render: (row) => (
      <span className={`px-3 py-1 rounded-full text-sm ${
        row.status === 'present' ? 'bg-green-100 text-green-800' :
        row.status === 'absent' ? 'bg-red-100 text-red-800' :
        'bg-yellow-100 text-yellow-800'
      }`}>
        {row.status.charAt(0).toUpperCase() + row.status.slice(1)}
      </span>
    )},
    { header: 'Remarks', render: (row) => row.remarks || '-' }
  ];

  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1 ml-64">
        <Navbar />
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Users className="text-blue-600" />
              Staff Attendance Records
            </h1>
          </div>

          <div className="bg-white rounded-lg shadow-md p-4 mb-6">
            <div className="flex gap-4 items-end">
              <div className="flex-1">
                <label className="block text-sm font-medium mb-2">Start Date</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg"
                />
              </div>
              <div className="flex-1">
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
                className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 flex items-center gap-2 disabled:opacity-50"
              >
                <Filter size={16} />
                {loading ? 'Loading...' : 'Filter'}
              </button>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md">
            {loading ? (
              <div className="p-8 text-center text-gray-500">
                Loading staff attendance records...
              </div>
            ) : attendance.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                No staff attendance records found
              </div>
            ) : (
              <Table columns={columns} data={attendance} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StaffViewAttendance;