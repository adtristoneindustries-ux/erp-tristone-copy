import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, DollarSign, X } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import { feeStructureAPI } from '../services/api';

const CLASSES = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'];
const CURRENT_YEAR = `${new Date().getFullYear()}-${new Date().getFullYear() + 1}`;

const emptyForm = { class: '', academicYear: CURRENT_YEAR, components: [{ name: '', amount: 0 }], totalAmount: 0, isActive: true };

const AdminFeeStructure = () => {
  const [structures, setStructures] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchStructures(); }, []);

  const fetchStructures = async () => {
    try {
      const res = await feeStructureAPI.getAll();
      setStructures(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const calcTotal = (components) => components.reduce((s, c) => s + (Number(c.amount) || 0), 0);

  const updateComponent = (idx, field, value) => {
    const updated = form.components.map((c, i) => i === idx ? { ...c, [field]: field === 'amount' ? Number(value) : value } : c);
    setForm({ ...form, components: updated, totalAmount: calcTotal(updated) });
  };

  const addComponent = () => setForm({ ...form, components: [...form.components, { name: '', amount: 0 }] });

  const removeComponent = (idx) => {
    const updated = form.components.filter((_, i) => i !== idx);
    setForm({ ...form, components: updated, totalAmount: calcTotal(updated) });
  };

  const openAdd = () => { setEditing(null); setForm(emptyForm); setShowModal(true); };
  const openEdit = (s) => { setEditing(s._id); setForm({ class: s.class, academicYear: s.academicYear, components: s.components, totalAmount: s.totalAmount, isActive: s.isActive }); setShowModal(true); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editing) await feeStructureAPI.update(editing, form);
      else await feeStructureAPI.create(form);
      setShowModal(false);
      fetchStructures();
    } catch (e) {
      alert(e.response?.data?.message || 'Error saving');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this fee structure?')) return;
    await feeStructureAPI.delete(id);
    fetchStructures();
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 lg:ml-64 overflow-x-hidden">
        <Navbar />
        <div className="p-4 lg:p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Fee Structure Builder</h1>
              <p className="text-sm text-gray-500 mt-1">Define fee components per class and academic year</p>
            </div>
            <button onClick={openAdd} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm">
              <Plus size={16} /> Add Structure
            </button>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <div className="bg-white rounded-lg shadow p-4 flex items-center gap-4">
              <div className="bg-blue-100 p-3 rounded-full"><DollarSign className="text-blue-600" size={20} /></div>
              <div><p className="text-xs text-gray-500">Total Structures</p><p className="text-xl font-bold">{structures.length}</p></div>
            </div>
            <div className="bg-white rounded-lg shadow p-4 flex items-center gap-4">
              <div className="bg-green-100 p-3 rounded-full"><DollarSign className="text-green-600" size={20} /></div>
              <div><p className="text-xs text-gray-500">Active Structures</p><p className="text-xl font-bold">{structures.filter(s => s.isActive).length}</p></div>
            </div>
            <div className="bg-white rounded-lg shadow p-4 flex items-center gap-4">
              <div className="bg-purple-100 p-3 rounded-full"><DollarSign className="text-purple-600" size={20} /></div>
              <div><p className="text-xs text-gray-500">Avg Fee</p><p className="text-xl font-bold">₹{structures.length ? Math.round(structures.reduce((s, x) => s + x.totalAmount, 0) / structures.length).toLocaleString() : 0}</p></div>
            </div>
          </div>

          {/* Table */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    {['Class', 'Academic Year', 'Components', 'Total Amount', 'Status', 'Actions'].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {loading ? (
                    <tr><td colSpan={6} className="text-center py-8 text-gray-400">Loading...</td></tr>
                  ) : structures.length === 0 ? (
                    <tr><td colSpan={6} className="text-center py-8 text-gray-400">No fee structures found. Add one to get started.</td></tr>
                  ) : structures.map(s => (
                    <tr key={s._id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-semibold">Class {s.class}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{s.academicYear}</td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-1">
                          {s.components.map((c, i) => (
                            <span key={i} className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full">{c.name}: ₹{c.amount.toLocaleString()}</span>
                          ))}
                        </div>
                      </td>
                      <td className="px-4 py-3 font-bold text-green-600">₹{s.totalAmount.toLocaleString()}</td>
                      <td className="px-4 py-3">
                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${s.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                          {s.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <button onClick={() => openEdit(s)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded"><Edit size={15} /></button>
                          <button onClick={() => handleDelete(s._id)} className="p-1.5 text-red-500 hover:bg-red-50 rounded"><Trash2 size={15} /></button>
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
              <h3 className="text-lg font-bold">{editing ? 'Edit' : 'Add'} Fee Structure</h3>
              <button onClick={() => setShowModal(false)}><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Class</label>
                  <select className="w-full border rounded-lg px-3 py-2 text-sm" value={form.class} onChange={e => setForm({ ...form, class: e.target.value })} required>
                    <option value="">Select Class</option>
                    {CLASSES.map(c => <option key={c} value={c}>Class {c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Academic Year</label>
                  <input className="w-full border rounded-lg px-3 py-2 text-sm" value={form.academicYear} onChange={e => setForm({ ...form, academicYear: e.target.value })} placeholder="2024-2025" required />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-sm font-medium">Fee Components</label>
                  <button type="button" onClick={addComponent} className="text-xs text-blue-600 hover:underline flex items-center gap-1"><Plus size={12} /> Add</button>
                </div>
                <div className="space-y-2">
                  {form.components.map((c, i) => (
                    <div key={i} className="flex gap-2 items-center">
                      <input className="flex-1 border rounded-lg px-3 py-2 text-sm" placeholder="Component name" value={c.name} onChange={e => updateComponent(i, 'name', e.target.value)} required />
                      <input type="number" className="w-28 border rounded-lg px-3 py-2 text-sm" placeholder="Amount" value={c.amount} onChange={e => updateComponent(i, 'amount', e.target.value)} required />
                      {form.components.length > 1 && <button type="button" onClick={() => removeComponent(i)} className="text-red-400 hover:text-red-600"><X size={16} /></button>}
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-between items-center bg-blue-50 rounded-lg px-4 py-3">
                <span className="font-semibold text-sm">Total Amount</span>
                <span className="font-bold text-blue-700 text-lg">₹{form.totalAmount.toLocaleString()}</span>
              </div>

              <div className="flex items-center gap-2">
                <input type="checkbox" id="isActive" checked={form.isActive} onChange={e => setForm({ ...form, isActive: e.target.checked })} />
                <label htmlFor="isActive" className="text-sm">Active</label>
              </div>

              <div className="flex gap-3 pt-2">
                <button type="submit" className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 text-sm font-medium">Save</button>
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 bg-gray-100 text-gray-700 py-2 rounded-lg hover:bg-gray-200 text-sm">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminFeeStructure;
