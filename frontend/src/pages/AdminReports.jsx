import { useState } from 'react';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import { dashboardAPI } from '../services/api';
import { FileText, Download, Filter, Loader } from 'lucide-react';

const REPORT_TYPES = [
  { value: 'students', label: 'Student List' },
  { value: 'staff', label: 'Staff List' },
  { value: 'attendance', label: 'Attendance Report' },
  { value: 'marks', label: 'Marks Report' },
  { value: 'fees', label: 'Fee Report' }
];

const COLUMNS = {
  students: ['name', 'email', 'class', 'section', 'rollNumber', 'phone', 'status'],
  staff: ['name', 'email', 'department', 'designation', 'phone', 'status'],
  attendance: ['name', 'class', 'section', 'roll', 'date', 'status'],
  marks: ['name', 'class', 'section', 'roll', 'subject', 'marks', 'total', 'pct'],
  fees: ['name', 'class', 'section', 'roll', 'total', 'paid', 'due', 'status', 'dueDate']
};

const AdminReports = () => {
  const [type, setType] = useState('students');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [classFilter, setClassFilter] = useState('');
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchReport = async () => {
    setLoading(true);
    setError('');
    try {
      const params = { type };
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;
      if (classFilter) params.classFilter = classFilter;
      const res = await dashboardAPI.getReports(params);
      setRecords(res.data.records || []);
    } catch (e) {
      setError(e.response?.data?.message || 'Failed to fetch report');
    } finally {
      setLoading(false);
    }
  };

  const exportCSV = () => {
    if (!records.length) return;
    const cols = COLUMNS[type];
    const header = cols.join(',');
    const rows = records.map(r => cols.map(c => {
      const val = r[c] ?? '';
      const str = val instanceof Date ? new Date(val).toLocaleDateString() : String(val);
      return `"${str.replace(/"/g, '""')}"`;
    }).join(','));
    const csv = [header, ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${type}_report_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const cols = COLUMNS[type];
  const needsDates = ['attendance', 'marks', 'fees'].includes(type);

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 lg:ml-64">
        <Navbar />
        <div className="p-4 lg:p-6">
          <div className="flex items-center gap-3 mb-6">
            <FileText className="text-blue-600" size={24} />
            <h1 className="text-xl lg:text-2xl font-bold">Reports & Analytics</h1>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-lg shadow-md p-4 mb-6">
            <div className="flex flex-wrap gap-3 items-end">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Report Type</label>
                <select value={type} onChange={e => { setType(e.target.value); setRecords([]); }}
                  className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                  {REPORT_TYPES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                </select>
              </div>
              {needsDates && <>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Start Date</label>
                  <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)}
                    className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">End Date</label>
                  <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)}
                    className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
              </>}
              {type === 'students' && (
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Class Filter</label>
                  <input type="text" placeholder="e.g. 10A" value={classFilter} onChange={e => setClassFilter(e.target.value)}
                    className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-28" />
                </div>
              )}
              <button onClick={fetchReport} disabled={loading}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm disabled:opacity-60">
                {loading ? <Loader size={14} className="animate-spin" /> : <Filter size={14} />}
                Generate
              </button>
              {records.length > 0 && (
                <button onClick={exportCSV}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm">
                  <Download size={14} />
                  Export CSV ({records.length})
                </button>
              )}
            </div>
          </div>

          {error && <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 mb-4 text-sm">{error}</div>}

          {/* Table */}
          {records.length > 0 && (
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="p-4 border-b flex justify-between items-center">
                <span className="font-semibold text-sm">{records.length} records found</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      {cols.map(c => (
                        <th key={c} className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">
                          {c.replace(/([A-Z])/g, ' $1').trim()}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {records.map((r, i) => (
                      <tr key={i} className="hover:bg-gray-50">
                        {cols.map(c => (
                          <td key={c} className="px-4 py-3 text-gray-700">
                            {c === 'status' ? (
                              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                                r[c] === 'present' || r[c] === 'Paid' || r[c] === 'Active' ? 'bg-green-100 text-green-700' :
                                r[c] === 'absent' || r[c] === 'Overdue' ? 'bg-red-100 text-red-700' :
                                'bg-yellow-100 text-yellow-700'
                              }`}>{r[c] ?? '-'}</span>
                            ) : c === 'date' || c === 'dueDate' ? (
                              r[c] ? new Date(r[c]).toLocaleDateString() : '-'
                            ) : c === 'pct' ? (
                              `${r[c]}%`
                            ) : (
                              r[c] ?? '-'
                            )}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {!loading && records.length === 0 && (
            <div className="bg-white rounded-lg shadow-md p-12 text-center text-gray-400">
              <FileText size={48} className="mx-auto mb-3 opacity-30" />
              <p>Select a report type and click Generate</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminReports;
