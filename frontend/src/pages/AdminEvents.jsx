import { useState } from 'react';
import { Calendar as CalendarIcon, Download, Plus, MapPin, User, Eye, Bell, ChevronLeft, ChevronRight, Edit, Trash2, X } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';

const AdminEvents = () => {
  const [showModal, setShowModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [events, setEvents] = useState([
   
  ]);
  const [formData, setFormData] = useState({ title: '', date: '', location: '', coordinator: '', status: 'Planning', description: '' });

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    const days = [];
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i);
    }
    return days;
  };

  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));

  const handleAddEvent = () => {
    setEditMode(false);
    setFormData({ title: '', date: '', location: '', coordinator: '', status: 'Planning', description: '' });
    setShowModal(true);
  };

  const handleEditEvent = (event) => {
    setEditMode(true);
    setFormData(event);
    setShowModal(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editMode) {
      setEvents(events.map(e => e.id === formData.id ? formData : e));
    } else {
      const newEvent = { ...formData, id: events.length + 1 };
      setEvents([...events, newEvent]);
    }
    setShowModal(false);
    setFormData({ title: '', date: '', location: '', coordinator: '', status: 'Planning', description: '' });
  };

  const handleDeleteEvent = (id) => {
    if (window.confirm('Are you sure you want to delete this event?')) {
      setEvents(events.filter(e => e.id !== id));
    }
  };

  const handleViewEvent = (event) => {
    setSelectedEvent(event);
    setShowViewModal(true);
  };

  const handleNotify = (event) => {
    alert(`Notification sent for: ${event.title}\nAll participants will be notified via email and SMS.`);
  };

  const handleExport = () => {
    const csvContent = "data:text/csv;charset=utf-8," 
      + "Title,Date,Location,Coordinator,Status,Description\n"
      + events.map(e => `"${e.title}","${e.date}","${e.location}","${e.coordinator}","${e.status}","${e.description}"`).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "events_schedule.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getEventsByDate = (day) => {
    if (!day) return [];
    const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return events.filter(e => e.date === dateStr);
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 lg:ml-64">
        <Navbar />
        <div className="p-4 lg:p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">Events Management</h1>
            <div className="flex gap-3">
              <button
                onClick={handleExport}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Download size={18} />
                Export Schedule
              </button>
              <button
                onClick={handleAddEvent}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus size={18} />
                Add New Event
              </button>
            </div>
          </div>

          {/* Event Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {events.map(event => (
              <div key={event.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-bold text-gray-900 flex-1">{event.title}</h3>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEditEvent(event)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() => handleDeleteEvent(event.id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
                <span className={`inline-block px-3 py-1 text-xs font-semibold rounded-full mb-3 ${
                  event.status === 'Upcoming' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                }`}>
                  {event.status}
                </span>
                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <CalendarIcon size={16} />
                    <span>{event.date}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <MapPin size={16} />
                    <span>{event.location}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <User size={16} />
                    <span>{event.coordinator}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleViewEvent(event)}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                  >
                    <Eye size={16} />
                    View
                  </button>
                  <button
                    onClick={() => handleNotify(event)}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                  >
                    <Bell size={16} />
                    Notify
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Calendar View */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">Calendar View</h2>
              <div className="flex items-center gap-4">
                <button onClick={prevMonth} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                  <ChevronLeft size={20} />
                </button>
                <span className="font-semibold text-lg">
                  {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                </span>
                <button onClick={nextMonth} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                  <ChevronRight size={20} />
                </button>
              </div>
            </div>
            <div className="grid grid-cols-7 gap-2">
              {dayNames.map(day => (
                <div key={day} className="text-center font-semibold text-gray-700 py-2">
                  {day}
                </div>
              ))}
              {getDaysInMonth(currentDate).map((day, index) => {
                const dayEvents = getEventsByDate(day);
                return (
                  <div
                    key={index}
                    className={`min-h-[80px] p-2 rounded-lg border ${
                      day ? 'bg-white hover:bg-blue-50 cursor-pointer border-gray-200' : 'bg-gray-50 border-transparent'
                    } ${day === new Date().getDate() && currentDate.getMonth() === new Date().getMonth() ? 'bg-blue-100 border-blue-500' : ''}`}
                  >
                    {day && (
                      <>
                        <div className="font-semibold text-sm mb-1">{day}</div>
                        {dayEvents.map(event => (
                          <div key={event.id} className="text-xs bg-blue-500 text-white rounded px-1 py-0.5 mb-1 truncate">
                            {event.title}
                          </div>
                        ))}
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Add/Edit Event Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">{editMode ? 'Edit Event' : 'Add New Event'}</h3>
              <button onClick={() => setShowModal(false)} className="text-gray-500 hover:text-gray-700">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Event Title</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    className="w-full border rounded-lg px-3 py-2"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Date</label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({...formData, date: e.target.value})}
                    className="w-full border rounded-lg px-3 py-2"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Location</label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({...formData, location: e.target.value})}
                    className="w-full border rounded-lg px-3 py-2"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Coordinator</label>
                  <input
                    type="text"
                    value={formData.coordinator}
                    onChange={(e) => setFormData({...formData, coordinator: e.target.value})}
                    className="w-full border rounded-lg px-3 py-2"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({...formData, status: e.target.value})}
                    className="w-full border rounded-lg px-3 py-2"
                    required
                  >
                    <option value="Planning">Planning</option>
                    <option value="Upcoming">Upcoming</option>
                    <option value="Completed">Completed</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    className="w-full border rounded-lg px-3 py-2"
                    rows="3"
                    required
                  />
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button type="submit" className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700">
                  {editMode ? 'Update Event' : 'Add Event'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Event Modal */}
      {showViewModal && selectedEvent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">{selectedEvent.title}</h3>
              <button onClick={() => setShowViewModal(false)} className="text-gray-500 hover:text-gray-700">
                <X size={20} />
              </button>
            </div>
            <div className="space-y-3">
              <div>
                <span className="font-semibold">Status: </span>
                <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                  selectedEvent.status === 'Upcoming' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                }`}>
                  {selectedEvent.status}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <CalendarIcon size={18} className="text-gray-600" />
                <span><strong>Date:</strong> {selectedEvent.date}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin size={18} className="text-gray-600" />
                <span><strong>Location:</strong> {selectedEvent.location}</span>
              </div>
              <div className="flex items-center gap-2">
                <User size={18} className="text-gray-600" />
                <span><strong>Coordinator:</strong> {selectedEvent.coordinator}</span>
              </div>
              <div>
                <strong>Description:</strong>
                <p className="text-gray-700 mt-1">{selectedEvent.description}</p>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowViewModal(false);
                  handleEditEvent(selectedEvent);
                }}
                className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
              >
                Edit Event
              </button>
              <button
                onClick={() => {
                  handleNotify(selectedEvent);
                  setShowViewModal(false);
                }}
                className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700"
              >
                Send Notification
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminEvents;
