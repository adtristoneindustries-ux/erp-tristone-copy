import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, DollarSign, CheckCircle, X, RefreshCw } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import { payrollAPI, userAPI } from '../services/api';

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const CURRENT_YEAR = new Date().getFullYear();
const CURRENT_MONTH = MONTHS[new Date().getMonth()];

const emptyForm = { staff: '', month: CURRENT_MONTH, year: CURRENT_YEAR, basicSalary: 45000, allowances: 5000, deductions: 2000, netSalary: 48000, remarks: '' };

const AdminPayroll = () => {
  const [payrolls, setPayrolls] = useState([]);
  const [staffList, setStaffList] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showGenModal, setShowGenModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [genForm, setGenForm] = useState({ month: CURRENT_MONTH, year: CURRENT_YEAR, basicSalary: 45000 });
  const [filterMonth, setFilterMonth] = useState(CURRENT_MONTH);
  const [filterYear, setFilterYear] = useState(CURRENT_YEAR);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchData(); }, [filterMonth, filterYear]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [payrollRes, staffRes] = await Promise.all([
        payrollAPI.getAll({ month: filterMonth, year: filterYear }),
        userAPI.getUsers({ role: 'staff' })
      ]);
      setPayrolls(payrollRes.data);
      setStaffList(staffRes.data.data || staffRes.data.users || staffRes.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const calcNet = (f) => (Number(f.basicSalary) || 0) + (Number(f.allowances) || 0) - (Number(f.deductions) || 0);

  const updateForm = (field, value) => {
    const updated = { ...form, [field]: value };
    updated.netSalary = calcNet(updated);
    setForm(updated);
  };

  const openAdd = () => { setEditing(null); setForm(emptyForm); setShowModal(true); };
  const openEdit = (p) => {
    setEditing(p._id);
    setForm({ staff: p.staff?._id || '', month: p.month, year: p.year, basicSalary: p.basicSalary, allowances: p.allowances, deductions: p.deductions, netSalary: p.netSalary, remarks: p.remarks || '' });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editing) await payrollAPI.update(editing, form);
      else await payrollAPI.create(form);
      setShowModal(false);
      fetchData();
    } catch (e) {
      alert(e.response?.data?.message || 'Error saving');
    }
  };

  const handleMarkPaid = async (id) => {
    await payrollAPI.update(id, { status: 'Paid' });
    fetchData();
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this payroll record?')) return;
    await payrollAPI.delete(id);
    fetchData();
  };

  const handleGenerate = async (e) => {
    e.preventDefault();
    try {
      const res = await payrollAPI.generate(genForm);
      alert(res.data.message);
      setShowGenModal(false);
      fetchData();
    } catch (e) {
      alert(e.response?.data?.message || 'Error generating');
    }
  };

  const totalPaid = payrolls.filter(p => p.status === 'Paid').reduce((s, p) => s + p.netSalary, 0);
  const totalPending = payrolls.filter(p => p.status === 'Pending').reduce((s, p) => s + p.netSalary, 0);

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 lg:ml-64 overflow-x-hidden">
        <Navbar />
        <div className="p-4 lg:p-6">
          <div className="flex flex-wrap justify-between items-center mb-6 gap-3">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Payroll Management</h1>
              <p className="text-sm text-gray-500 mt-1">Manage staff salaries and payment records</p>
            </div>
            <div className="flex gap-2">
              <button onClick={() => setShowGenModal(true)} className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm">
                <RefreshCw size={15} /> Generate
              </button>
              <button onClick={openAdd} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm">
                <Plus size={15} /> Add Record
              </button>
            </div>
          </div>

          {/* Summary */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <div className="bg-white rounded-lg shadow p-4 flex items-center gap-4">
              <div className="bg-blue-100 p-3 rounded-full"><DollarSign className="text-blue-600" size={20} /></div>
              <div><p className="text-xs text-gray-500">Total Records</p><p className="text-xl font-bold">{payrolls.length}</p></div>
            </div>
            <div className="bg-white rounded-lg shadow p-4 flex items-center gap-4">
              <div className="bg-green-100 p-3 rounded-full"><CheckCircle className="text-green-600" size={20} /></div>
              <div><p className="text-xs text-gray-500">Paid</p><p className="text-xl font-bold text-green-600">₹{totalPaid.toLocaleString()}</p></div>
            </div>
            <div className="bg-white rounded-lg shadow p-4 flex items-center gap-4">
              <div className="bg-orange-100 p-3 rounded-full"><DollarSign className="text-orange-600" size={20} /></div>
              <div><p className="text-xs text-gray-500">Pending</p><p className="text-xl font-bold text-orange-600">₹{totalPending.toLocaleString()}</p></div>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-lg shadow p-4 mb-4 flex flex-wrap gap-3">
            <select className="border rounded-lg px-3 py-2 text-sm" value={filterMonth} onChange={e => setFilterMonth(e.target.value)}>
              {MONTHS.map(m => <option key={m}>{m}</option>)}
            </select>
            <select className="border rounded-lg px-3 py-2 text-sm" value={filterYear} onChange={e => setFilterYear(Number(e.target.value))}>
              {[CURRENT_YEAR - 1, CURRENT_YEAR, CURRENT_YEAR + 1].map(y => <option key={y}>{y}</option>)}
            </select>
          </div>

          {/* Table */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    {['Staff Name', 'Month/Year', 'Basic', 'Allowances', 'Deductions', 'Net Salary', 'Status', 'Actions'].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {loading ? (
                    <tr><td colSpan={8} className="text-center py-8 text-gray-400">Loading...</td></tr>
                  ) : payrolls.length === 0 ? (
                    <tr><td colSpan={8} className="text-center py-8 text-gray-400">No payroll records for {filterMonth} {filterYear}.</td></tr>
                  ) : payrolls.map(p => (
                    <tr key={p._id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium text-sm">{p.staff?.name || 'N/A'}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{p.month} {p.year}</td>
                      <td className="px-4 py-3 text-sm">₹{p.basicSalary?.toLocaleString()}</td>
                      <td className="px-4 py-3 text-sm text-green-600">+₹{p.allowances?.toLocaleString()}</td>
                      <td className="px-4 py-3 text-sm text-red-500">-₹{p.deductions?.toLocaleString()}</td>
                      <td className="px-4 py-3 font-bold text-blue-700">₹{p.netSalary?.toLocaleString()}</td>
                      <td className="px-4 py-3">
                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${p.status === 'Paid' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                          {p.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1">
                          {p.status === 'Pending' && (
                            <button onClick={() => handleMarkPaid(p._id)} title="Mark Paid" className="p-1.5 text-green-600 hover:bg-green-50 rounded"><CheckCircle size={15} /></button>
                          )}
                          <button onClick={() => openEdit(p)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded"><Edit size={15} /></button>
                          <button onClick={() => handleDelete(p._id)} className="p-1.5 text-red-500 hover:bg-red-50 rounded"><Trash2 size={15} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-md">
            <div className="flex justify-between items-center p-5 border-b">
              <h3 className="text-lg font-bold">{editing ? 'Edit' : 'Add'} Payroll Record</h3>
              <button onClick={() => setShowModal(false)}><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-5 space-y-3">
              <div>
                <label className="block text-sm font-medium mb-1">Staff Member</label>
                <select className="w-full border rounded-lg px-3 py-2 text-sm" value={form.staff} onChange={e => setForm({ ...form, staff: e.target.value })} required>
                  <option value="">Select Staff</option>
                  {staffList.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium mb-1">Month</label>
                  <select className="w-full border rounded-lg px-3 py-2 text-sm" value={form.month} onChange={e => updateForm('month', e.target.value)}>
                    {MONTHS.map(m => <option key={m}>{m}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Year</label>
                  <input type="number" className="w-full border rounded-lg px-3 py-2 text-sm" value={form.year} onChange={e => updateForm('year', e.target.value)} />
                </div>
              </div>
              {[['basicSalary', 'Basic Salary'], ['allowances', 'Allowances'], ['deductions', 'Deductions']].map(([field, label]) => (
                <div key={field}>
                  <label className="block text-sm font-medium mb-1">{label}</label>
                  <input type="number" className="w-full border rounded-lg px-3 py-2 text-sm" value={form[field]} onChange={e => updateForm(field, e.target.value)} />
                </div>
              ))}
              <div className="bg-blue-50 rounded-lg px-4 py-3 flex justify-between">
                <span className="font-semibold text-sm">Net Salary</span>
                <span className="font-bold text-blue-700">₹{form.netSalary.toLocaleString()}</span>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Remarks</label>
                <input className="w-full border rounded-lg px-3 py-2 text-sm" value={form.remarks} onChange={e => setForm({ ...form, remarks: e.target.value })} placeholder="Optional" />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 text-sm font-medium">Save</button>
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 bg-gray-100 text-gray-700 py-2 rounded-lg text-sm">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Generate Modal */}
      {showGenModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-sm">
            <div className="flex justify-between items-center p-5 border-b">
              <h3 className="text-lg font-bold">Generate Monthly Payroll</h3>
              <button onClick={() => setShowGenModal(false)}><X size={20} /></button>
            </div>
            <form onSubmit={handleGenerate} className="p-5 space-y-3">
              <p className="text-sm text-gray-500">This will create payroll records for all staff members.</p>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium mb-1">Month</label>
                  <select className="w-full border rounded-lg px-3 py-2 text-sm" value={genForm.month} onChange={e => setGenForm({ ...genForm, month: e.target.value })}>
                    {MONTHS.map(m => <option key={m}>{m}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Year</label>
                  <input type="number" className="w-full border rounded-lg px-3 py-2 text-sm" value={genForm.year} onChange={e => setGenForm({ ...genForm, year: e.target.value })} />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Default Basic Salary (₹)</label>
                <input type="number" className="w-full border rounded-lg px-3 py-2 text-sm" value={genForm.basicSalary} onChange={e => setGenForm({ ...genForm, basicSalary: e.target.value })} />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 text-sm font-medium">Generate</button>
                <button type="button" onClick={() => setShowGenModal(false)} className="flex-1 bg-gray-100 text-gray-700 py-2 rounded-lg text-sm">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPayroll;
