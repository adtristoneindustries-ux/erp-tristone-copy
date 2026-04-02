import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, UserPlus, X, Search } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import { admissionAPI } from '../services/api';

const STATUSES = ['Pending', 'Reviewed', 'Accepted', 'Rejected'];
const STATUS_COLORS = { Pending: 'bg-yellow-100 text-yellow-700', Reviewed: 'bg-blue-100 text-blue-700', Accepted: 'bg-green-100 text-green-700', Rejected: 'bg-red-100 text-red-700' };
const CLASSES = ['1','2','3','4','5','6','7','8','9','10','11','12'];
const CURRENT_YEAR = `${new Date().getFullYear()}-${new Date().getFullYear() + 1}`;

const emptyForm = { applicantName: '', email: '', phone: '', dateOfBirth: '', applyingForClass: '', academicYear: CURRENT_YEAR, previousSchool: '', previousClass: '', parentName: '', parentPhone: '', address: '', remarks: '' };

const AdminAdmissions = () => {
  const [admissions, setAdmissions] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [filterStatus, setFilterStatus] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchAdmissions(); }, [filterStatus]);

  const fetchAdmissions = async () => {
    setLoading(true);
    try {
      const res = await admissionAPI.getAll({ status: filterStatus || undefined });
      setAdmissions(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const openAdd = () => { setEditing(null); setForm(emptyForm); setShowModal(true); };
  const openEdit = (a) => {
    setEditing(a._id);
    setForm({ applicantName: a.applicantName, email: a.email, phone: a.phone, dateOfBirth: a.dateOfBirth?.split('T')[0], applyingForClass: a.applyingForClass, academicYear: a.academicYear, previousSchool: a.previousSchool || '', previousClass: a.previousClass || '', parentName: a.parentName, parentPhone: a.parentPhone, address: a.address || '', remarks: a.remarks || '' });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editing) await admissionAPI.update(editing, form);
      else await admissionAPI.create(form);
      setShowModal(false);
      fetchAdmissions();
    } catch (e) {
      alert(e.response?.data?.message || 'Error saving');
    }
  };

  const handleStatusChange = async (id, status) => {
    await admissionAPI.update(id, { status });
    fetchAdmissions();
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this application?')) return;
    await admissionAPI.delete(id);
    fetchAdmissions();
  };

  const filtered = admissions.filter(a =>
    !search || a.applicantName.toLowerCase().includes(search.toLowerCase()) || a.email.toLowerCase().includes(search.toLowerCase())
  );

  const counts = STATUSES.reduce((acc, s) => ({ ...acc, [s]: admissions.filter(a => a.status === s).length }), {});

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 lg:ml-64 overflow-x-hidden">
        <Navbar />
        <div className="p-4 lg:p-6">
          <div className="flex flex-wrap justify-between items-center mb-6 gap-3">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Admission Management</h1>
              <p className="text-sm text-gray-500 mt-1">Review and manage student admission applications</p>
            </div>
            <button onClick={openAdd} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm">
              <Plus size={16} /> Add Application
            </button>
          </div>

          {/* Summary */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
            {STATUSES.map(s => (
              <div key={s} className="bg-white rounded-lg shadow p-4">
                <p className="text-xs text-gray-500">{s}</p>
                <p className="text-2xl font-bold">{counts[s] || 0}</p>
                <span className={`text-xs px-2 py-0.5 rounded-full ${STATUS_COLORS[s]}`}>{s}</span>
              </div>
            ))}
          </div>

          {/* Filters */}
          <div className="bg-white rounded-lg shadow p-4 mb-4 flex flex-wrap gap-3 items-center">
            <div className="relative flex-1 min-w-[200px]">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input className="w-full pl-9 pr-3 py-2 border rounded-lg text-sm" placeholder="Search by name or email..." value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <div className="flex gap-2 flex-wrap">
              <button onClick={() => setFilterStatus('')} className={`px-3 py-1.5 rounded-lg text-sm font-medium ${!filterStatus ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600'}`}>All</button>
              {STATUSES.map(s => (
                <button key={s} onClick={() => setFilterStatus(s)} className={`px-3 py-1.5 rounded-lg text-sm font-medium ${filterStatus === s ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600'}`}>{s}</button>
              ))}
            </div>
          </div>

          {/* Table */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    {['Applicant', 'Contact', 'Class', 'Parent', 'Applied On', 'Status', 'Actions'].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {loading ? (
                    <tr><td colSpan={7} className="text-center py-8 text-gray-400">Loading...</td></tr>
                  ) : filtered.length === 0 ? (
                    <tr><td colSpan={7} className="text-center py-8 text-gray-400">No applications found.</td></tr>
                  ) : filtered.map(a => (
                    <tr key={a._id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <p className="font-medium text-sm">{a.applicantName}</p>
                        <p className="text-xs text-gray-400">{a.email}</p>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">{a.phone}</td>
                      <td className="px-4 py-3 text-sm">Class {a.applyingForClass}<br /><span className="text-xs text-gray-400">{a.academicYear}</span></td>
                      <td className="px-4 py-3">
                        <p className="text-sm">{a.parentName}</p>
                        <p className="text-xs text-gray-400">{a.parentPhone}</p>
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-500">{new Date(a.createdAt).toLocaleDateString('en-IN')}</td>
                      <td className="px-4 py-3">
                        <select
                          value={a.status}
                          onChange={e => handleStatusChange(a._id, e.target.value)}
                          className={`text-xs px-2 py-1 rounded-full font-medium border-0 cursor-pointer ${STATUS_COLORS[a.status]}`}
                        >
                          {STATUSES.map(s => <option key={s}>{s}</option>)}
                        </select>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1">
                          <button onClick={() => openEdit(a)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded"><Edit size={14} /></button>
                          <button onClick={() => handleDelete(a._id)} className="p-1.5 text-red-500 hover:bg-red-50 rounded"><Trash2 size={14} /></button>
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

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-5 border-b">
              <h3 className="text-lg font-bold">{editing ? 'Edit' : 'New'} Admission Application</h3>
              <button onClick={() => setShowModal(false)}><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-5 space-y-3">
              <p className="text-xs font-semibold text-gray-400 uppercase">Applicant Details</p>
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="block text-sm font-medium mb-1">Full Name</label>
                  <input className="w-full border rounded-lg px-3 py-2 text-sm" value={form.applicantName} onChange={e => setForm({ ...form, applicantName: e.target.value })} required />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Email</label>
                  <input type="email" className="w-full border rounded-lg px-3 py-2 text-sm" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Phone</label>
                  <input className="w-full border rounded-lg px-3 py-2 text-sm" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} required />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Date of Birth</label>
                  <input type="date" className="w-full border rounded-lg px-3 py-2 text-sm" value={form.dateOfBirth} onChange={e => setForm({ ...form, dateOfBirth: e.target.value })} required />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Applying for Class</label>
                  <select className="w-full border rounded-lg px-3 py-2 text-sm" value={form.applyingForClass} onChange={e => setForm({ ...form, applyingForClass: e.target.value })} required>
                    <option value="">Select</option>
                    {CLASSES.map(c => <option key={c} value={c}>Class {c}</option>)}
                  </select>
                </div>
              </div>

              <p className="text-xs font-semibold text-gray-400 uppercase pt-1">Previous School</p>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium mb-1">School Name</label>
                  <input className="w-full border rounded-lg px-3 py-2 text-sm" value={form.previousSchool} onChange={e => setForm({ ...form, previousSchool: e.target.value })} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Previous Class</label>
                  <input className="w-full border rounded-lg px-3 py-2 text-sm" value={form.previousClass} onChange={e => setForm({ ...form, previousClass: e.target.value })} />
                </div>
              </div>

              <p className="text-xs font-semibold text-gray-400 uppercase pt-1">Parent / Guardian</p>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium mb-1">Parent Name</label>
                  <input className="w-full border rounded-lg px-3 py-2 text-sm" value={form.parentName} onChange={e => setForm({ ...form, parentName: e.target.value })} required />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Parent Phone</label>
                  <input className="w-full border rounded-lg px-3 py-2 text-sm" value={form.parentPhone} onChange={e => setForm({ ...form, parentPhone: e.target.value })} required />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Address</label>
                <textarea className="w-full border rounded-lg px-3 py-2 text-sm" rows={2} value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} />
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
    </div>
  );
};

export default AdminAdmissions;
