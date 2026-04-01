import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Calendar, X } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import { academicCalendarAPI } from '../services/api';

const TYPES = ['Holiday', 'Exam', 'Event', 'Meeting'];
const TYPE_COLORS = { Holiday: 'bg-red-100 text-red-700', Exam: 'bg-orange-100 text-orange-700', Event: 'bg-blue-100 text-blue-700', Meeting: 'bg-purple-100 text-purple-700' };
const CURRENT_YEAR = `${new Date().getFullYear()}-${new Date().getFullYear() + 1}`;

const emptyForm = { title: '', type: 'Holiday', startDate: '', endDate: '', description: '', academicYear: CURRENT_YEAR, affectsAll: true };

const AdminAcademicCalendar = () => {
  const [events, setEvents] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [filterType, setFilterType] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchEvents(); }, [filterType]);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const res = await academicCalendarAPI.getAll({ type: filterType || undefined, academicYear: CURRENT_YEAR });
      setEvents(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const openAdd = () => { setEditing(null); setForm(emptyForm); setShowModal(true); };
  const openEdit = (ev) => {
    setEditing(ev._id);
    setForm({ title: ev.title, type: ev.type, startDate: ev.startDate?.split('T')[0], endDate: ev.endDate?.split('T')[0], description: ev.description || '', academicYear: ev.academicYear, affectsAll: ev.affectsAll });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editing) await academicCalendarAPI.update(editing, form);
      else await academicCalendarAPI.create(form);
      setShowModal(false);
      fetchEvents();
    } catch (e) {
      alert(e.response?.data?.message || 'Error saving');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this event?')) return;
    await academicCalendarAPI.delete(id);
    fetchEvents();
  };

  const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '-';
  const getDuration = (start, end) => {
    const diff = Math.ceil((new Date(end) - new Date(start)) / (1000 * 60 * 60 * 24)) + 1;
    return `${diff} day${diff > 1 ? 's' : ''}`;
  };

  const upcoming = events.filter(e => new Date(e.startDate) >= new Date());
  const past = events.filter(e => new Date(e.startDate) < new Date());

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 lg:ml-64 overflow-x-hidden">
        <Navbar />
        <div className="p-4 lg:p-6">
          <div className="flex flex-wrap justify-between items-center mb-6 gap-3">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Academic Calendar</h1>
              <p className="text-sm text-gray-500 mt-1">Manage holidays, exams, and school events</p>
            </div>
            <button onClick={openAdd} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm">
              <Plus size={16} /> Add Event
            </button>
          </div>

          {/* Summary */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
            {TYPES.map(t => (
              <div key={t} className="bg-white rounded-lg shadow p-4">
                <p className="text-xs text-gray-500">{t}s</p>
                <p className="text-2xl font-bold">{events.filter(e => e.type === t).length}</p>
                <span className={`text-xs px-2 py-0.5 rounded-full ${TYPE_COLORS[t]}`}>{t}</span>
              </div>
            ))}
          </div>

          {/* Filter */}
          <div className="bg-white rounded-lg shadow p-4 mb-4 flex gap-3 flex-wrap">
            <button onClick={() => setFilterType('')} className={`px-3 py-1.5 rounded-lg text-sm font-medium ${!filterType ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>All</button>
            {TYPES.map(t => (
              <button key={t} onClick={() => setFilterType(t)} className={`px-3 py-1.5 rounded-lg text-sm font-medium ${filterType === t ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>{t}s</button>
            ))}
          </div>

          {/* Upcoming */}
          {upcoming.length > 0 && (
            <div className="mb-6">
              <h2 className="text-sm font-semibold text-gray-500 uppercase mb-3">Upcoming ({upcoming.length})</h2>
              <div className="space-y-2">
                {upcoming.map(ev => (
                  <div key={ev._id} className="bg-white rounded-lg shadow p-4 flex flex-wrap justify-between items-center gap-3">
                    <div className="flex items-center gap-3">
                      <div className="bg-blue-50 p-2 rounded-lg"><Calendar size={18} className="text-blue-600" /></div>
                      <div>
                        <p className="font-semibold text-sm">{ev.title}</p>
                        <p className="text-xs text-gray-500">{formatDate(ev.startDate)} — {formatDate(ev.endDate)} · {getDuration(ev.startDate, ev.endDate)}</p>
                        {ev.description && <p className="text-xs text-gray-400 mt-0.5">{ev.description}</p>}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${TYPE_COLORS[ev.type]}`}>{ev.type}</span>
                      <button onClick={() => openEdit(ev)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded"><Edit size={14} /></button>
                      <button onClick={() => handleDelete(ev._id)} className="p-1.5 text-red-500 hover:bg-red-50 rounded"><Trash2 size={14} /></button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Past */}
          {past.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold text-gray-500 uppercase mb-3">Past ({past.length})</h2>
              <div className="space-y-2">
                {past.map(ev => (
                  <div key={ev._id} className="bg-white rounded-lg shadow p-4 flex flex-wrap justify-between items-center gap-3 opacity-70">
                    <div className="flex items-center gap-3">
                      <div className="bg-gray-50 p-2 rounded-lg"><Calendar size={18} className="text-gray-400" /></div>
                      <div>
                        <p className="font-semibold text-sm text-gray-600">{ev.title}</p>
                        <p className="text-xs text-gray-400">{formatDate(ev.startDate)} — {formatDate(ev.endDate)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${TYPE_COLORS[ev.type]}`}>{ev.type}</span>
                      <button onClick={() => openEdit(ev)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded"><Edit size={14} /></button>
                      <button onClick={() => handleDelete(ev._id)} className="p-1.5 text-red-500 hover:bg-red-50 rounded"><Trash2 size={14} /></button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {!loading && events.length === 0 && (
            <div className="bg-white rounded-lg shadow p-12 text-center text-gray-400">No events found. Add your first calendar event.</div>
          )}
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-md">
            <div className="flex justify-between items-center p-5 border-b">
              <h3 className="text-lg font-bold">{editing ? 'Edit' : 'Add'} Calendar Event</h3>
              <button onClick={() => setShowModal(false)}><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-5 space-y-3">
              <div>
                <label className="block text-sm font-medium mb-1">Title</label>
                <input className="w-full border rounded-lg px-3 py-2 text-sm" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium mb-1">Type</label>
                  <select className="w-full border rounded-lg px-3 py-2 text-sm" value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}>
                    {TYPES.map(t => <option key={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Academic Year</label>
                  <input className="w-full border rounded-lg px-3 py-2 text-sm" value={form.academicYear} onChange={e => setForm({ ...form, academicYear: e.target.value })} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium mb-1">Start Date</label>
                  <input type="date" className="w-full border rounded-lg px-3 py-2 text-sm" value={form.startDate} onChange={e => setForm({ ...form, startDate: e.target.value })} required />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">End Date</label>
                  <input type="date" className="w-full border rounded-lg px-3 py-2 text-sm" value={form.endDate} onChange={e => setForm({ ...form, endDate: e.target.value })} required />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea className="w-full border rounded-lg px-3 py-2 text-sm" rows={2} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="affectsAll" checked={form.affectsAll} onChange={e => setForm({ ...form, affectsAll: e.target.checked })} />
                <label htmlFor="affectsAll" className="text-sm">Affects all students & staff</label>
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

export default AdminAcademicCalendar;
