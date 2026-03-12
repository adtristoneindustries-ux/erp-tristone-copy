import { useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { SocketContext } from '../context/SocketContext';
import { Bell } from 'lucide-react';

const UnifiedNotifications = () => {
  const { user } = useContext(AuthContext);
  const socket = useContext(SocketContext);
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    if (user) {
      fetchAllNotifications();
    }
  }, [user]);

  useEffect(() => {
    if (socket && user) {
      socket.on('newNotification', (data) => {
        setNotifications(prev => [data, ...prev]);
        setTotalCount(prev => prev + 1);
      });

      return () => socket.off('newNotification');
    }
  }, [socket, user]);

  const fetchAllNotifications = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5000/api/notifications', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setNotifications(data.notifications || []);
      setTotalCount(data.unreadCount || 0);
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
      setTotalCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
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

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest('.notification-container')) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative notification-container">
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="p-1.5 sm:p-2 min-w-[40px] min-h-[40px] sm:min-w-[44px] sm:min-h-[44px] rounded-full hover:bg-gray-100 transition-colors flex items-center justify-center relative"
      >
        <Bell size={18} className="text-gray-600 sm:w-5 sm:h-5" />
        {totalCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 sm:-top-1 sm:-right-1 bg-red-500 text-white text-[10px] sm:text-xs rounded-full w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center font-medium">
            {totalCount > 99 ? '99+' : totalCount}
          </span>
        )}
      </button>

      {showDropdown && (
        <>
          {/* Backdrop for mobile */}
          <div 
            className="fixed inset-0 bg-black bg-opacity-25 z-40 sm:hidden"
            onClick={() => setShowDropdown(false)}
          />
          
          <div className="fixed sm:absolute top-14 sm:top-12 left-2 right-2 sm:left-auto sm:right-0 w-auto sm:w-96 bg-white rounded-lg shadow-xl border z-50 max-h-[80vh] sm:max-h-[70vh] flex flex-col">
            {/* Header */}
            <div className="p-4 border-b flex justify-between items-center flex-shrink-0">
              <h3 className="font-semibold text-base text-gray-800">Notifications</h3>
              <div className="flex items-center gap-2">
                {totalCount > 0 && (
                  <span className="text-xs text-gray-500">{totalCount} unread</span>
                )}
                <button
                  onClick={() => setShowDropdown(false)}
                  className="sm:hidden text-gray-500 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Notifications List */}
            <div className="flex-1 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  <Bell size={48} className="mx-auto mb-2 text-gray-300" />
                  <p className="text-sm">No notifications</p>
                </div>
              ) : (
                notifications.map((notif) => (
                  <div
                    key={notif._id}
                    onClick={() => {
                      if (!notif.read) markAsRead(notif._id);
                      if (notif.link) navigate(notif.link);
                      setShowDropdown(false);
                    }}
                    className={`p-4 border-b hover:bg-gray-50 cursor-pointer transition-colors active:bg-gray-100 ${
                      !notif.read ? 'bg-blue-50' : ''
                    }`}
                  >
                    <div className="flex gap-3">
                      <span className="text-2xl flex-shrink-0">{getNotificationIcon(notif.type)}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start gap-2">
                          <p className="font-medium text-sm text-gray-800 break-words">{notif.title}</p>
                          {!notif.read && (
                            <span className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-1"></span>
                          )}
                        </div>
                        <p className="text-xs text-gray-600 mt-1 line-clamp-2 break-words">{notif.message}</p>
                        <p className="text-xs text-gray-400 mt-1">
                          {new Date(notif.createdAt).toLocaleString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            {notifications.length > 0 && (
              <div className="p-3 border-t flex-shrink-0 bg-white">
                <button
                  onClick={() => {
                    setShowDropdown(false);
                    navigate(`/${user?.role}/notifications`);
                  }}
                  className="w-full text-center text-blue-600 hover:text-blue-800 text-sm font-medium py-2 hover:bg-blue-50 rounded transition-colors"
                >
                  View All Notifications
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default UnifiedNotifications;
