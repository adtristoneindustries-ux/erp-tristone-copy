import { useState, useEffect } from 'react';
import { CalendarDays, MapPin, User, Calendar as CalendarIcon, ChevronLeft, ChevronRight, X, Clock } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import { eventAPI } from '../services/api';

const statusColor = (status) =>
  status === 'Upcoming' ? 'bg-green-100 text-green-700 border-green-200' :
  status === 'Completed' ? 'bg-gray-100 text-gray-600 border-gray-200' :
  status === 'Cancelled' ? 'bg-red-100 text-red-700 border-red-200' :
  'bg-blue-100 text-blue-700 border-blue-200';

const statusDot = (status) =>
  status === 'Upcoming' ? 'bg-green-500' :
  status === 'Completed' ? 'bg-gray-400' :
  status === 'Cancelled' ? 'bg-red-500' :
  'bg-blue-500';

const today = new Date();
const minMonth = { year: today.getFullYear(), month: today.getMonth() };
const maxMonth = today.getMonth() === 11
  ? { year: today.getFullYear() + 1, month: 0 }
  : { year: today.getFullYear(), month: today.getMonth() + 1 };

const monthNames = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const dayNames = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

const EventsPage = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [currentDate, setCurrentDate] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const [filter, setFilter] = useState('All');

  useEffect(() => {
    eventAPI.getEvents()
      .then(res => setEvents(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

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

  const getDateStr = (day) =>
    `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

  const getEventsByDate = (day) => {
    if (!day) return [];
    return events.filter(e => e.date === getDateStr(day));
  };

  // Filter events: current + next month only
  const visibleEvents = events.filter(e => {
    const d = new Date(e.date);
    const minD = new Date(minMonth.year, minMonth.month, 1);
    const maxD = new Date(maxMonth.year, maxMonth.month + 1, 0);
    return d >= minD && d <= maxD;
  });

  const filteredEvents = filter === 'All' ? visibleEvents : visibleEvents.filter(e => e.status === filter);

  // Upcoming events (today or future)
  const upcomingEvents = visibleEvents
    .filter(e => new Date(e.date) >= new Date(today.getFullYear(), today.getMonth(), today.getDate()))
    .sort((a, b) => new Date(a.date) - new Date(b.date));

  const getDaysUntil = (dateStr) => {
    const d = new Date(dateStr);
    const t = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const diff = Math.ceil((d - t) / (1000 * 60 * 60 * 24));
    if (diff === 0) return 'Today';
    if (diff === 1) return 'Tomorrow';
    return `In ${diff} days`;
  };

  if (loading) return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 lg:ml-64 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto mb-3"></div>
          <p className="text-gray-500 text-sm">Loading events...</p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 lg:ml-64">
        <Navbar />
        <div className="p-4 lg:p-6">

          {/* Header */}
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2.5 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-sm">
              <CalendarDays className="text-white" size={24} />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">School Events</h1>
              <p className="text-xs text-gray-500">Current & upcoming events</p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
            {[
              { label: 'Total Events', value: visibleEvents.length, color: 'from-blue-500 to-blue-600' },
              { label: 'Upcoming', value: visibleEvents.filter(e=>e.status==='Upcoming').length, color: 'from-green-500 to-green-600' },
              { label: 'Planning', value: visibleEvents.filter(e=>e.status==='Planning').length, color: 'from-yellow-500 to-orange-500' },
              { label: 'This Month', value: events.filter(e=>{ const d=new Date(e.date); return d.getMonth()===today.getMonth()&&d.getFullYear()===today.getFullYear(); }).length, color: 'from-purple-500 to-purple-600' },
            ].map(s => (
              <div key={s.label} className={`bg-gradient-to-br ${s.color} rounded-xl p-4 text-white shadow-sm`}>
                <p className="text-2xl font-bold">{s.value}</p>
                <p className="text-xs opacity-90 mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

            {/* Left: Events List */}
            <div className="xl:col-span-2 space-y-4">

              {/* Filter tabs */}
              <div className="flex gap-2 flex-wrap">
                {['All','Upcoming','Planning','Completed','Cancelled'].map(f => (
                  <button key={f} onClick={() => setFilter(f)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${filter === f ? 'bg-blue-600 text-white shadow-sm' : 'bg-white text-gray-600 border border-gray-200 hover:border-blue-300'}`}>
                    {f}
                  </button>
                ))}
              </div>

              {filteredEvents.length === 0 ? (
                <div className="bg-white rounded-xl border border-dashed border-gray-200 p-12 text-center">
                  <CalendarDays size={40} className="text-gray-200 mx-auto mb-3" />
                  <p className="text-gray-400 font-medium">No {filter !== 'All' ? filter.toLowerCase() : ''} events found</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredEvents.map(event => (
                    <div key={event._id}
                      onClick={() => setSelectedEvent(event)}
                      className="bg-white rounded-xl border border-gray-100 p-4 hover:shadow-md hover:border-blue-200 transition-all cursor-pointer group">
                      <div className="flex items-start gap-3">
                        <div className={`w-1 self-stretch rounded-full flex-shrink-0 ${statusDot(event.status)}`}></div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <h3 className="font-semibold text-gray-900 text-sm group-hover:text-blue-600 transition-colors">{event.title}</h3>
                            <span className={`flex-shrink-0 px-2 py-0.5 text-xs font-medium rounded-full border ${statusColor(event.status)}`}>{event.status}</span>
                          </div>
                          <div className="flex flex-wrap gap-x-4 gap-y-1">
                            <span className="flex items-center gap-1 text-xs text-gray-400"><CalendarIcon size={11} />{event.date}</span>
                            <span className="flex items-center gap-1 text-xs text-gray-400"><MapPin size={11} />{event.location}</span>
                            <span className="flex items-center gap-1 text-xs text-gray-400"><User size={11} />{event.coordinator}</span>
                          </div>
                          {event.description && <p className="text-xs text-gray-400 mt-2 line-clamp-1">{event.description}</p>}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Right: Calendar + Upcoming */}
            <div className="space-y-4">

              {/* Mini Calendar */}
              <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <button onClick={prevMonth} disabled={isAtMin} className={`p-1.5 rounded-lg ${isAtMin ? 'text-gray-200 cursor-not-allowed' : 'hover:bg-gray-100 text-gray-500'}`}>
                    <ChevronLeft size={16} />
                  </button>
                  <span className="text-sm font-semibold text-gray-800">{monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}</span>
                  <button onClick={nextMonth} disabled={isAtMax} className={`p-1.5 rounded-lg ${isAtMax ? 'text-gray-200 cursor-not-allowed' : 'hover:bg-gray-100 text-gray-500'}`}>
                    <ChevronRight size={16} />
                  </button>
                </div>
                <div className="grid grid-cols-7 gap-0.5">
                  {dayNames.map(d => <div key={d} className="text-center text-[10px] font-semibold text-gray-400 py-1">{d[0]}</div>)}
                  {getDaysInMonth(currentDate).map((day, idx) => {
                    const dayEvs = getEventsByDate(day);
                    const isToday = day && currentDate.getMonth() === today.getMonth() && currentDate.getFullYear() === today.getFullYear() && day === today.getDate();
                    return (
                      <div key={idx}
                        onClick={() => { if (day && dayEvs.length === 1) setSelectedEvent(dayEvs[0]); }}
                        className={`relative h-8 flex flex-col items-center justify-center rounded-lg text-xs transition-all
                          ${!day ? '' : dayEvs.length > 0 ? 'cursor-pointer hover:bg-blue-50' : ''}
                          ${isToday ? 'bg-blue-600 text-white font-bold' : day ? 'text-gray-700' : ''}
                        `}>
                        {day && <span>{day}</span>}
                        {day && dayEvs.length > 0 && !isToday && (
                          <div className="absolute bottom-0.5 flex gap-0.5">
                            {dayEvs.slice(0,3).map((ev, i) => (
                              <div key={i} className={`w-1 h-1 rounded-full ${statusDot(ev.status)}`}></div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
                {/* Legend */}
                <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-gray-50">
                  {[['Upcoming','bg-green-500'],['Planning','bg-blue-500'],['Completed','bg-gray-400']].map(([l,c]) => (
                    <div key={l} className="flex items-center gap-1"><div className={`w-2 h-2 rounded-full ${c}`}></div><span className="text-[10px] text-gray-400">{l}</span></div>
                  ))}
                </div>
              </div>

              {/* Upcoming Events */}
              <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
                <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <Clock size={14} className="text-blue-500" /> Upcoming Events
                </h3>
                {upcomingEvents.length === 0 ? (
                  <p className="text-xs text-gray-400 text-center py-4">No upcoming events</p>
                ) : (
                  <div className="space-y-2">
                    {upcomingEvents.slice(0, 5).map(ev => (
                      <div key={ev._id} onClick={() => setSelectedEvent(ev)}
                        className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors group">
                        <div className={`w-2 h-2 rounded-full flex-shrink-0 ${statusDot(ev.status)}`}></div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-gray-800 truncate group-hover:text-blue-600">{ev.title}</p>
                          <p className="text-[10px] text-gray-400">{ev.date}</p>
                        </div>
                        <span className="text-[10px] text-blue-500 font-medium flex-shrink-0">{getDaysUntil(ev.date)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Event Detail Modal */}
      {selectedEvent && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setSelectedEvent(null)}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1 pr-3">
                <span className={`inline-block px-2.5 py-0.5 text-xs font-semibold rounded-full border mb-2 ${statusColor(selectedEvent.status)}`}>{selectedEvent.status}</span>
                <h3 className="text-xl font-bold text-gray-900 leading-tight">{selectedEvent.title}</h3>
                <p className="text-xs text-blue-500 font-medium mt-1">{getDaysUntil(selectedEvent.date)}</p>
              </div>
              <button onClick={() => setSelectedEvent(null)} className="p-1.5 hover:bg-gray-100 rounded-lg flex-shrink-0"><X size={18} /></button>
            </div>
            <div className="space-y-2.5">
              {[
                { icon: CalendarIcon, color: 'text-blue-500', bg: 'bg-blue-50', label: 'Date', value: selectedEvent.date },
                { icon: MapPin, color: 'text-red-500', bg: 'bg-red-50', label: 'Location', value: selectedEvent.location },
                { icon: User, color: 'text-green-500', bg: 'bg-green-50', label: 'Coordinator', value: selectedEvent.coordinator },
              ].map(({ icon: Icon, color, bg, label, value }) => (
                <div key={label} className={`flex items-center gap-3 p-3 ${bg} rounded-xl`}>
                  <Icon size={16} className={`${color} flex-shrink-0`} />
                  <div>
                    <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wide">{label}</p>
                    <p className="text-sm font-semibold text-gray-800">{value}</p>
                  </div>
                </div>
              ))}
              {selectedEvent.description && (
                <div className="p-3 bg-gray-50 rounded-xl">
                  <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wide mb-1">Description</p>
                  <p className="text-sm text-gray-700 leading-relaxed">{selectedEvent.description}</p>
                </div>
              )}
            </div>
            <button onClick={() => setSelectedEvent(null)}
              className="w-full mt-5 bg-blue-600 text-white py-2.5 rounded-xl hover:bg-blue-700 font-medium text-sm transition-colors">
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default EventsPage;
