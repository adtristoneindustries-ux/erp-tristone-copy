import { useState, useEffect } from 'react';
import { Bell, CheckCircle, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';

const StaffNotifications = () => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5000/api/notifications', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setNotifications(data.notifications || []);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const markAsRead = async (id) => {
    try {
      const token = localStorage.getItem('token');
      await fetch(`http://localhost:5000/api/notifications/${id}/read`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, read: true } : n));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const token = localStorage.getItem('token');
      await fetch('http://localhost:5000/api/notifications/mark-all-read', {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const getNotificationIcon = (type) => {
    const icons = {
      announcement: '📢',
      marks: '📝',
      library: '📚',
      cafeteria: '🍽️',
      fee: '💰',
      scholarship: '🎓',
      leave: '📅',
      exam: '📋',
      attendance: '✅',
      placement: '💼',
      transport: '🚌',
      hostel: '🏠'
    };
    return icons[type] || '🔔';
  };

  const filteredNotifications = filter === 'all' 
    ? notifications 
    : filter === 'unread' 
    ? notifications.filter(n => !n.read)
    : notifications.filter(n => n.read);

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 lg:ml-64">
        <Navbar />
        <div className="p-4 lg:p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">All Notifications</h1>
            <button
              onClick={markAllAsRead}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              Mark All as Read
            </button>
          </div>

          <div className="flex gap-2 mb-4">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg ${filter === 'all' ? 'bg-blue-500 text-white' : 'bg-white text-gray-700'}`}
            >
              All
            </button>
            <button
              onClick={() => setFilter('unread')}
              className={`px-4 py-2 rounded-lg ${filter === 'unread' ? 'bg-blue-500 text-white' : 'bg-white text-gray-700'}`}
            >
              Unread
            </button>
            <button
              onClick={() => setFilter('read')}
              className={`px-4 py-2 rounded-lg ${filter === 'read' ? 'bg-blue-500 text-white' : 'bg-white text-gray-700'}`}
            >
              Read
            </button>
          </div>

          <div className="bg-white rounded-lg shadow-md">
            {filteredNotifications.length === 0 ? (
              <div className="p-12 text-center text-gray-500">
                <Bell size={64} className="mx-auto mb-4 text-gray-300" />
                <p className="text-lg">No notifications</p>
              </div>
            ) : (
              filteredNotifications.map((notif) => (
                <div
                  key={notif._id}
                  onClick={() => {
                    if (!notif.read) markAsRead(notif._id);
                    if (notif.link) navigate(notif.link);
                  }}
                  className={`p-4 border-b hover:bg-gray-50 cursor-pointer transition-colors ${
                    !notif.read ? 'bg-blue-50' : ''
                  }`}
                >
                  <div className="flex gap-4">
                    <span className="text-3xl flex-shrink-0">{getNotificationIcon(notif.type)}</span>
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-gray-800">{notif.title}</h3>
                            {!notif.read && (
                              <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                            )}
                          </div>
                          <p className="text-gray-600 mt-1">{notif.message}</p>
                          <div className="flex items-center gap-2 mt-2 text-sm text-gray-500">
                            <Clock size={14} />
                            <span>
                              {new Date(notif.createdAt).toLocaleString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </span>
                          </div>
                        </div>
                        {notif.read && (
                          <CheckCircle size={20} className="text-green-500 flex-shrink-0" />
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StaffNotifications;
