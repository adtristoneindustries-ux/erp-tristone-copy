import { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, Download, Plus, MapPin, User, Eye, Bell, ChevronLeft, ChevronRight, Edit, Trash2, X, CalendarDays } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import { eventAPI } from '../services/api';

const EMPTY_FORM = { title: '', date: '', location: '', coordinator: '', status: 'Planning', description: '' };

const statusColor = (status) =>
  status === 'Upcoming' ? 'bg-green-100 text-green-800' :
  status === 'Completed' ? 'bg-gray-100 text-gray-700' :
  status === 'Cancelled' ? 'bg-red-100 text-red-800' :
  'bg-blue-100 text-blue-800';

const today = new Date();
const minMonth = { year: today.getFullYear(), month: today.getMonth() };
const maxMonth = today.getMonth() === 11
  ? { year: today.getFullYear() + 1, month: 0 }
  : { year: today.getFullYear(), month: today.getMonth() + 1 };

const AdminEvents = () => {
  const [showModal, setShowModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [events, setEvents] = useState([]);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [loading, setLoading] = useState(false);

  useEffect(() => { fetchEvents(); }, []);

  const fetchEvents = async () => {
    try {
      const res = await eventAPI.getEvents();
      setEvents(res.data);
    } catch (err) { console.error(err); }
  };

  const isAtMin = currentDate.getFullYear() === minMonth.year && currentDate.getMonth() === minMonth.month;
  const isAtMax = currentDate.getFullYear() === maxMonth.year && currentDate.getMonth() === maxMonth.month;

  const prevMonth = () => { if (!isAtMin) setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1)); };
  const nextMonth = () => { if (!isAtMax) setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1)); };

  const getDaysInMonth = (date) => {
    const firstDay = new Date(date.getFullYear(), date.getMonth(), 1).getDay();
    const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
    const days = [];
    for (let i = 0; i < firstDay; i++) days.push(null);
    for (let i = 1; i <= lastDay; i++) days.push(i);
    return days;
  };

  const monthNames = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  const dayNames = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

  const getDateStr = (day) =>
    `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

  const getEventsByDate = (day) => {
    if (!day) return [];
    return events.filter(e => e.date === getDateStr(day));
  };

  const isPastDay = (day) => {
    if (!day) return false;
    const d = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    const t = new Date(); t.setHours(0,0,0,0);
    return d < t;
  };

  const openAddModal = (dateStr = '') => {
    setEditMode(false);
    setFormData({ ...EMPTY_FORM, date: dateStr });
    setShowModal(true);
  };

  const handleCalendarDayClick = (day) => {
    if (!day || isPastDay(day)) return;
    const dayEvents = getEventsByDate(day);
    if (dayEvents.length === 1) { handleViewEvent(dayEvents[0]); return; }
    openAddModal(getDateStr(day));
  };

  const handleEditEvent = (event) => {
    setEditMode(true);
    setFormData({ ...event, id: event._id });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (editMode) await eventAPI.updateEvent(formData.id || formData._id, formData);
      else await eventAPI.createEvent(formData);
      await fetchEvents();
      setShowModal(false);
      setFormData(EMPTY_FORM);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const handleDeleteEvent = async (id) => {
    if (!window.confirm('Delete this event?')) return;
    try {
      await eventAPI.deleteEvent(id);
      setEvents(events.filter(e => e._id !== id));
    } catch (err) { console.error(err); }
  };

  const handleViewEvent = (event) => { setSelectedEvent(event); setShowViewModal(true); };

  const handleExport = () => {
    const csv = "data:text/csv;charset=utf-8,Title,Date,Location,Coordinator,Status,Description\n"
      + events.map(e => `"${e.title}","${e.date}","${e.location}","${e.coordinator}","${e.status}","${e.description}"`).join("\n");
    const link = document.createElement("a");
    link.setAttribute("href", encodeURI(csv));
    link.setAttribute("download", "events.csv");
    document.body.appendChild(link); link.click(); document.body.removeChild(link);
  };

  // Filter events for current+next month display in cards
  const visibleEvents = events.filter(e => {
    const d = new Date(e.date);
    const minD = new Date(minMonth.year, minMonth.month, 1);
    const maxD = new Date(maxMonth.year, maxMonth.month + 1, 0);
    return d >= minD && d <= maxD;
  });

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 lg:ml-64">
        <Navbar />
        <div className="p-4 lg:p-6">

          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg"><CalendarDays className="text-blue-600" size={28} /></div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Events Management</h1>
                <p className="text-xs text-gray-500">Current & next month events</p>
              </div>
            </div>
            <div className="flex gap-2 w-full sm:w-auto">
              <button onClick={handleExport} className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 text-sm">
                <Download size={15} /> <span className="hidden sm:inline">Export</span>
              </button>
              <button onClick={() => openAddModal()} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium">
                <Plus size={15} /> Add Event
              </button>
            </div>
          </div>

          {/* Stats bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
            {[
              { label: 'Total', value: visibleEvents.length, color: 'bg-blue-50 text-blue-700 border-blue-200' },
              { label: 'Upcoming', value: visibleEvents.filter(e=>e.status==='Upcoming').length, color: 'bg-green-50 text-green-700 border-green-200' },
              { label: 'Planning', value: visibleEvents.filter(e=>e.status==='Planning').length, color: 'bg-yellow-50 text-yellow-700 border-yellow-200' },
              { label: 'Completed', value: visibleEvents.filter(e=>e.status==='Completed').length, color: 'bg-gray-50 text-gray-700 border-gray-200' },
            ].map(s => (
              <div key={s.label} className={`border rounded-lg p-3 text-center ${s.color}`}>
                <p className="text-2xl font-bold">{s.value}</p>
                <p className="text-xs font-medium">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Event Cards */}
          {visibleEvents.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
              {visibleEvents.map(event => (
                <div key={event._id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="text-base font-bold text-gray-900 flex-1 pr-2 leading-tight">{event.title}</h3>
                    <div className="flex gap-1">
                      <button onClick={() => handleEditEvent(event)} className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"><Edit size={14} /></button>
                      <button onClick={() => handleDeleteEvent(event._id)} className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={14} /></button>
                    </div>
                  </div>
                  <span className={`inline-block px-2.5 py-0.5 text-xs font-semibold rounded-full mb-3 ${statusColor(event.status)}`}>{event.status}</span>
                  <div className="space-y-1.5 mb-3">
                    <div className="flex items-center gap-2 text-xs text-gray-500"><CalendarIcon size={13} /><span>{event.date}</span></div>
                    <div className="flex items-center gap-2 text-xs text-gray-500"><MapPin size={13} /><span className="truncate">{event.location}</span></div>
                    <div className="flex items-center gap-2 text-xs text-gray-500"><User size={13} /><span className="truncate">{event.coordinator}</span></div>
                  </div>
                  <button onClick={() => handleViewEvent(event)} className="w-full flex items-center justify-center gap-1.5 px-3 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors text-xs font-medium">
                    <Eye size={13} /> View Details
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-dashed border-gray-300 p-10 text-center mb-6">
              <CalendarDays size={40} className="text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 font-medium">No events for current or next month</p>
              <p className="text-gray-400 text-sm mt-1">Click "Add Event" to create one</p>
            </div>
          )}

          {/* Calendar */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6">
            <div className="flex justify-between items-center mb-5">
              <div>
                <h2 className="text-lg font-bold text-gray-900">Calendar</h2>
                <p className="text-xs text-gray-400">Click a future date to add event</p>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={prevMonth} disabled={isAtMin} className={`p-2 rounded-lg transition-colors ${isAtMin ? 'text-gray-300 cursor-not-allowed' : 'hover:bg-gray-100 text-gray-600'}`}>
                  <ChevronLeft size={18} />
                </button>
                <span className="font-semibold text-sm sm:text-base min-w-[140px] text-center">
                  {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                </span>
                <button onClick={nextMonth} disabled={isAtMax} className={`p-2 rounded-lg transition-colors ${isAtMax ? 'text-gray-300 cursor-not-allowed' : 'hover:bg-gray-100 text-gray-600'}`}>
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>
            <div className="grid grid-cols-7 gap-1">
              {dayNames.map(d => (
                <div key={d} className="text-center text-xs font-semibold text-gray-400 py-2">{d}</div>
              ))}
              {getDaysInMonth(currentDate).map((day, idx) => {
                const dayEvents = getEventsByDate(day);
                const isToday = day && currentDate.getMonth() === today.getMonth() && currentDate.getFullYear() === today.getFullYear() && day === today.getDate();
                const past = isPastDay(day);
                return (
                  <div
                    key={idx}
                    onClick={() => handleCalendarDayClick(day)}
                    className={`min-h-[56px] sm:min-h-[72px] p-1 rounded-lg border text-xs transition-all
                      ${!day ? 'border-transparent bg-transparent' : ''}
                      ${day && !past ? 'border-gray-100 bg-white hover:bg-blue-50 hover:border-blue-200 cursor-pointer' : ''}
                      ${day && past ? 'border-gray-50 bg-gray-50 cursor-not-allowed opacity-50' : ''}
                      ${isToday ? '!bg-blue-600 !border-blue-600' : ''}
                    `}
                  >
                    {day && (
                      <>
                        <div className={`font-semibold mb-0.5 text-xs ${isToday ? 'text-white' : past ? 'text-gray-400' : 'text-gray-700'}`}>{day}</div>
                        {dayEvents.slice(0, 2).map(ev => (
                          <div
                            key={ev._id}
                            onClick={(e) => { e.stopPropagation(); handleViewEvent(ev); }}
                            className="text-[9px] sm:text-[10px] bg-blue-500 text-white rounded px-1 py-0.5 mb-0.5 truncate hover:bg-blue-600 cursor-pointer"
                          >{ev.title}</div>
                        ))}
                        {dayEvents.length > 2 && <div className="text-[9px] text-blue-500 font-medium">+{dayEvents.length - 2} more</div>}
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex justify-between items-center mb-5">
              <h3 className="text-lg font-bold text-gray-900">{editMode ? 'Edit Event' : 'Add New Event'}</h3>
              <button onClick={() => setShowModal(false)} className="p-1.5 hover:bg-gray-100 rounded-lg"><X size={18} /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              {[
                { label: 'Event Title', key: 'title', type: 'text' },
                { label: 'Location', key: 'location', type: 'text' },
                { label: 'Coordinator', key: 'coordinator', type: 'text' },
              ].map(f => (
                <div key={f.key}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{f.label}</label>
                  <input type={f.type} value={formData[f.key]} onChange={e => setFormData({...formData, [f.key]: e.target.value})}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" required />
                </div>
              ))}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                <input type="date" value={formData.date} min={new Date().toISOString().split('T')[0]}
                  onChange={e => setFormData({...formData, date: e.target.value})}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                  {['Planning','Upcoming','Completed','Cancelled'].map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" rows="3" required />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={loading}
                  className="flex-1 bg-blue-600 text-white py-2.5 rounded-lg hover:bg-blue-700 font-medium text-sm disabled:opacity-60">
                  {loading ? 'Saving...' : editMode ? 'Update Event' : 'Add Event'}
                </button>
                <button type="button" onClick={() => setShowModal(false)}
                  className="flex-1 bg-gray-100 text-gray-700 py-2.5 rounded-lg hover:bg-gray-200 font-medium text-sm">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Modal */}
      {showViewModal && selectedEvent && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1 pr-3">
                <span className={`inline-block px-2.5 py-0.5 text-xs font-semibold rounded-full mb-2 ${statusColor(selectedEvent.status)}`}>{selectedEvent.status}</span>
                <h3 className="text-xl font-bold text-gray-900">{selectedEvent.title}</h3>
              </div>
              <button onClick={() => setShowViewModal(false)} className="p-1.5 hover:bg-gray-100 rounded-lg"><X size={18} /></button>
            </div>
            <div className="space-y-3 mb-5">
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <CalendarIcon size={16} className="text-blue-500 flex-shrink-0" />
                <div><p className="text-xs text-gray-400">Date</p><p className="text-sm font-medium">{selectedEvent.date}</p></div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <MapPin size={16} className="text-red-500 flex-shrink-0" />
                <div><p className="text-xs text-gray-400">Location</p><p className="text-sm font-medium">{selectedEvent.location}</p></div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <User size={16} className="text-green-500 flex-shrink-0" />
                <div><p className="text-xs text-gray-400">Coordinator</p><p className="text-sm font-medium">{selectedEvent.coordinator}</p></div>
              </div>
              {selectedEvent.description && (
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-400 mb-1">Description</p>
                  <p className="text-sm text-gray-700">{selectedEvent.description}</p>
                </div>
              )}
            </div>
            <div className="flex gap-3">
              <button onClick={() => { setShowViewModal(false); handleEditEvent(selectedEvent); }}
                className="flex-1 bg-blue-600 text-white py-2.5 rounded-lg hover:bg-blue-700 font-medium text-sm flex items-center justify-center gap-2">
                <Edit size={14} /> Edit
              </button>
              <button onClick={() => handleDeleteEvent(selectedEvent._id) && setShowViewModal(false)}
                className="flex-1 bg-red-50 text-red-600 py-2.5 rounded-lg hover:bg-red-100 font-medium text-sm flex items-center justify-center gap-2">
                <Trash2 size={14} /> Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminEvents;
