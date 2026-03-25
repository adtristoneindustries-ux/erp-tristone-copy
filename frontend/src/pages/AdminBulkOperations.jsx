import { useState, useRef } from 'react';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import { dashboardAPI, userAPI } from '../services/api';
import { Upload, Download, Users, CheckCircle, XCircle, AlertCircle, FileText } from 'lucide-react';

const STUDENT_TEMPLATE = `name,email,password,class,section,rollNumber,phone,gender
John Doe,john@school.com,Welcome@123,10A,A,101,9876543210,Male
Jane Smith,jane@school.com,Welcome@123,10B,B,102,9876543211,Female`;

const STAFF_TEMPLATE = `name,email,password,department,designation,phone
Alice Johnson,alice@school.com,Welcome@123,Mathematics,Teacher,9876543212
Bob Williams,bob@school.com,Welcome@123,Science,HOD,9876543213`;

const AdminBulkOperations = () => {
  const [role, setRole] = useState('student');
  const [csvText, setCsvText] = useState('');
  const [preview, setPreview] = useState([]);
  const [headers, setHeaders] = useState([]);
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState(null);
  const [exporting, setExporting] = useState(false);
  const fileRef = useRef();

  const parseCSV = (text) => {
    const lines = text.trim().split('\n').filter(l => l.trim());
    if (lines.length < 2) return { headers: [], rows: [] };
    const hdrs = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
    const rows = lines.slice(1).map(line => {
      const vals = line.split(',').map(v => v.trim().replace(/^"|"$/g, ''));
      return hdrs.reduce((obj, h, i) => { obj[h] = vals[i] || ''; return obj; }, {});
    });
    return { headers: hdrs, rows };
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target.result;
      setCsvText(text);
      const { headers: hdrs, rows } = parseCSV(text);
      setHeaders(hdrs);
      setPreview(rows.slice(0, 5));
      setResult(null);
    };
    reader.readAsText(file);
  };

  const handleTextChange = (text) => {
    setCsvText(text);
    const { headers: hdrs, rows } = parseCSV(text);
    setHeaders(hdrs);
    setPreview(rows.slice(0, 5));
    setResult(null);
  };

  const handleImport = async () => {
    const { rows } = parseCSV(csvText);
    if (!rows.length) return;
    setImporting(true);
    setResult(null);
    try {
      const res = await dashboardAPI.bulkImport({ users: rows, role });
      setResult(res.data);
    } catch (e) {
      setResult({ error: e.response?.data?.message || 'Import failed' });
    } finally {
      setImporting(false);
    }
  };

  const handleExport = async (exportRole) => {
    setExporting(true);
    try {
      const res = await userAPI.getUsers({ role: exportRole, limit: 10000 });
      const users = res.data.users || res.data || [];
      if (!users.length) { alert('No users found'); return; }
      const cols = exportRole === 'student'
        ? ['name', 'email', 'class', 'section', 'rollNumber', 'phone', 'gender', 'status']
        : ['name', 'email', 'department', 'designation', 'phone', 'status'];
      const header = cols.join(',');
      const rows = users.map(u => cols.map(c => `"${(u[c] ?? '').toString().replace(/"/g, '""')}"`).join(','));
      const csv = [header, ...rows].join('\n');
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${exportRole}s_export_${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      alert('Export failed: ' + (e.response?.data?.message || e.message));
    } finally {
      setExporting(false);
    }
  };

  const downloadTemplate = () => {
    const template = role === 'student' ? STUDENT_TEMPLATE : STAFF_TEMPLATE;
    const blob = new Blob([template], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${role}_import_template.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 lg:ml-64">
        <Navbar />
        <div className="p-4 lg:p-6">
          <div className="flex items-center gap-3 mb-6">
            <Users className="text-blue-600" size={24} />
            <h1 className="text-xl lg:text-2xl font-bold">Bulk Operations</h1>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Import Section */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="font-bold text-lg mb-4 flex items-center gap-2">
                <Upload size={18} className="text-blue-600" /> Bulk Import
              </h2>

              <div className="flex gap-3 mb-4">
                <button onClick={() => { setRole('student'); setCsvText(''); setPreview([]); setResult(null); }}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${role === 'student' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
                  Students
                </button>
                <button onClick={() => { setRole('staff'); setCsvText(''); setPreview([]); setResult(null); }}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${role === 'staff' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
                  Staff
                </button>
              </div>

              <button onClick={downloadTemplate}
                className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 mb-4">
                <FileText size={14} /> Download {role} CSV template
              </button>

              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 mb-4 text-center cursor-pointer hover:border-blue-400 transition-colors"
                onClick={() => fileRef.current?.click()}>
                <Upload size={24} className="mx-auto text-gray-400 mb-2" />
                <p className="text-sm text-gray-500">Click to upload CSV file</p>
                <input ref={fileRef} type="file" accept=".csv" className="hidden" onChange={handleFileUpload} />
              </div>

              <p className="text-xs text-gray-400 text-center mb-3">— or paste CSV below —</p>

              <textarea value={csvText} onChange={e => handleTextChange(e.target.value)}
                placeholder={`Paste CSV data here...\n${role === 'student' ? 'name,email,password,class,section,rollNumber' : 'name,email,password,department,designation'}`}
                className="w-full border rounded-lg p-3 text-sm font-mono h-32 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500" />

              {preview.length > 0 && (
                <div className="mt-3 mb-4">
                  <p className="text-xs font-semibold text-gray-500 mb-2">Preview (first 5 rows):</p>
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs border-collapse">
                      <thead>
                        <tr className="bg-gray-50">
                          {headers.map(h => <th key={h} className="border px-2 py-1 text-left">{h}</th>)}
                        </tr>
                      </thead>
                      <tbody>
                        {preview.map((row, i) => (
                          <tr key={i} className="hover:bg-gray-50">
                            {headers.map(h => <td key={h} className="border px-2 py-1">{row[h]}</td>)}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              <button onClick={handleImport} disabled={!csvText.trim() || importing}
                className="w-full py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium disabled:opacity-60 flex items-center justify-center gap-2">
                {importing ? <><span className="animate-spin">⏳</span> Importing...</> : <><Upload size={14} /> Import {role}s</>}
              </button>

              {result && (
                <div className={`mt-4 p-4 rounded-lg ${result.error ? 'bg-red-50 border border-red-200' : 'bg-green-50 border border-green-200'}`}>
                  {result.error ? (
                    <div className="flex items-center gap-2 text-red-700 text-sm"><XCircle size={16} />{result.error}</div>
                  ) : (
                    <>
                      <div className="flex items-center gap-2 text-green-700 text-sm font-semibold mb-2">
                        <CheckCircle size={16} /> Import Complete
                      </div>
                      <div className="text-sm text-gray-700">✅ Created: <strong>{result.created}</strong> &nbsp; ❌ Failed: <strong>{result.failed}</strong></div>
                      {result.errors?.length > 0 && (
                        <div className="mt-2 max-h-24 overflow-y-auto">
                          {result.errors.map((e, i) => (
                            <div key={i} className="text-xs text-red-600 flex items-start gap-1">
                              <AlertCircle size={10} className="mt-0.5 flex-shrink-0" />{e}
                            </div>
                          ))}
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Export Section */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="font-bold text-lg mb-4 flex items-center gap-2">
                <Download size={18} className="text-green-600" /> Bulk Export
              </h2>
              <p className="text-sm text-gray-500 mb-6">Export all users as CSV files for backup or external use.</p>

              <div className="space-y-4">
                {[
                  { role: 'student', label: 'Export All Students', color: 'blue', desc: 'Name, email, class, section, roll number, phone, status' },
                  { role: 'staff', label: 'Export All Staff', color: 'green', desc: 'Name, email, department, designation, phone, status' }
                ].map(({ role: r, label, color, desc }) => (
                  <div key={r} className={`border border-${color}-200 rounded-lg p-4`}>
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="font-medium text-sm text-gray-800">{label}</div>
                        <div className="text-xs text-gray-400 mt-1">{desc}</div>
                      </div>
                      <button onClick={() => handleExport(r)} disabled={exporting}
                        className={`flex items-center gap-2 px-4 py-2 bg-${color}-600 text-white rounded-lg hover:bg-${color}-700 text-sm flex-shrink-0 disabled:opacity-60`}>
                        <Download size={14} />
                        Export
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-start gap-2">
                  <AlertCircle size={16} className="text-yellow-600 flex-shrink-0 mt-0.5" />
                  <div className="text-xs text-yellow-700">
                    <strong>Import Notes:</strong>
                    <ul className="mt-1 space-y-1 list-disc list-inside">
                      <li>Default password is <code className="bg-yellow-100 px-1 rounded">Welcome@123</code> if not specified</li>
                      <li>Duplicate emails will be skipped</li>
                      <li>Maximum 500 records per import</li>
                      <li>CSV must have a header row</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminBulkOperations;
