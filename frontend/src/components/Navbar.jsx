import { useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { SocketContext } from '../context/SocketContext';
import { User, Bell } from 'lucide-react';
import { leaveRequestAPI, announcementAPI, markAPI } from '../services/api';

const Navbar = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const socket = useContext(SocketContext);
  const [totalCount, setTotalCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const [activeTab, setActiveTab] = useState('announcements');
  const [notifications, setNotifications] = useState([]);
  const [announcementCount, setAnnouncementCount] = useState(0);
  const [announcements, setAnnouncements] = useState([]);
  const [markCount, setMarkCount] = useState(0);
  const [markUpdates, setMarkUpdates] = useState([]);
  const [leaveCount, setLeaveCount] = useState(0);

  // Fetch unread counts
  useEffect(() => {
    if (user) {
      fetchAnnouncementCount();
      fetchAnnouncements();
      
      if (user.role === 'admin' || user.role === 'staff') {
        fetchLeaveCount();
        fetchNotifications();
      }
      
      if (user.role === 'student' || user.role === 'staff') {
        fetchMarkCount();
        fetchMarkUpdates();
      }
    }
  }, [user]);

  // Update total count
  useEffect(() => {
    let total = announcementCount;
    if (user?.role === 'admin' || user?.role === 'staff') total += leaveCount;
    if (user?.role === 'student' || user?.role === 'staff') total += markCount;
    setTotalCount(total);
  }, [announcementCount, leaveCount, markCount, user]);

  // Listen for socket events
  useEffect(() => {
    if (socket && user) {
      if (user.role === 'admin') {
        socket.on('newLeaveRequest', (data) => {
          setLeaveCount(prev => prev + 1);
          setNotifications(prev => [data.leaveRequest, ...prev.slice(0, 4)]);
        });
      }

      socket.on('newAnnouncement', (data) => {
        if (data.targetRole === 'all' || data.targetRole === user.role) {
          setAnnouncementCount(prev => prev + 1);
          setAnnouncements(prev => [data, ...prev.slice(0, 4)]);
        }
      });

      socket.on('markUpdate', (data) => {
        if (user.role === 'student' && data.student === user._id) {
          setMarkCount(prev => prev + 1);
          setMarkUpdates(prev => [data, ...prev.slice(0, 4)]);
        } else if (user.role === 'staff' && data.subject?.teacher === user._id) {
          setMarkCount(prev => prev + 1);
          setMarkUpdates(prev => [data, ...prev.slice(0, 4)]);
        }
      });

      socket.on('leaveStatusUpdate', (data) => {
        if (user.role === 'staff' && data.staff === user._id) {
          setLeaveCount(prev => prev + 1);
          setNotifications(prev => [data, ...prev.slice(0, 4)]);
        }
      });

      return () => {
        socket.off('newLeaveRequest');
        socket.off('newAnnouncement');
        socket.off('markUpdate');
        socket.off('leaveStatusUpdate');
      };
    }
  }, [socket, user]);

  const fetchLeaveCount = async () => {
    try {
      const response = await leaveRequestAPI.getUnreadCount();
      setLeaveCount(response.data.count);
    } catch (error) {
      // Silently handle error - API endpoint might not be available
      setLeaveCount(0);
    }
  };

  const fetchNotifications = async () => {
    try {
      if (user?.role === 'admin') {
        const response = await leaveRequestAPI.getLeaveRequests({ status: 'pending' });
        setNotifications(response.data.slice(0, 5));
      } else if (user?.role === 'staff') {
        const response = await leaveRequestAPI.getMyLeaveRequests();
        setNotifications(response.data.filter(req => req.status !== 'pending').slice(0, 5));
      }
    } catch (error) {
      setNotifications([]);
    }
  };

  const fetchAnnouncementCount = async () => {
    try {
      const response = await announcementAPI.getUnreadCount();
      setAnnouncementCount(response.data.count);
    } catch (error) {
      setAnnouncementCount(0);
    }
  };

  const fetchAnnouncements = async () => {
    try {
      const response = await announcementAPI.getAnnouncements({ targetRole: user?.role });
      setAnnouncements(response.data.slice(0, 5));
    } catch (error) {
      setAnnouncements([]);
    }
  };

  const fetchMarkCount = async () => {
    try {
      const response = await markAPI.getUnreadCount();
      setMarkCount(response.data.count);
    } catch (error) {
      setMarkCount(0);
    }
  };

  const fetchMarkUpdates = async () => {
    try {
      const response = await markAPI.getRecentUpdates();
      setMarkUpdates(response.data.slice(0, 5));
    } catch (error) {
      setMarkUpdates([]);
    }
  };

  const handleNotificationClick = async () => {
    setShowNotifications(!showNotifications);
  };

  const handleTabClick = async (tab) => {
    setActiveTab(tab);
    try {
      if (tab === 'announcements' && announcementCount > 0) {
        await announcementAPI.markAsRead();
        setAnnouncementCount(0);
      } else if (tab === 'marks' && markCount > 0) {
        await markAPI.markAsRead();
        setMarkCount(0);
      } else if (tab === 'leaves' && leaveCount > 0) {
        await leaveRequestAPI.markAsRead();
        setLeaveCount(0);
      }
    } catch (error) {
      // Silently handle errors to prevent UI disruption
    }
  };

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.notification-dropdown')) {
        setShowNotifications(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="bg-white shadow-md px-4 lg:px-6 py-4 flex justify-between items-center relative z-30">
      <h2 className="text-lg lg:text-xl font-semibold text-gray-800 truncate ml-16 lg:ml-0">
        <span className="hidden sm:inline">Welcome, </span>
        <span className="sm:hidden">Hi, </span>
        {user?.name}
      </h2>
      <div className="flex items-center gap-2 lg:gap-3">
        {/* Single Notification Bell */}
        <div className="relative notification-dropdown">
          <button
            onClick={handleNotificationClick}
            className="p-2 min-w-[44px] min-h-[44px] rounded-full hover:bg-gray-100 active:bg-gray-200 transition-colors flex items-center justify-center relative"
            aria-label="Notifications"
          >
            <Bell size={20} className="text-gray-600" />
            {totalCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium">
                {totalCount > 9 ? '9+' : totalCount}
              </span>
            )}
          </button>
          
          {/* Unified Notification Dropdown */}
          {showNotifications && (
            <div className="absolute right-0 top-12 w-80 max-w-[95vw] sm:max-w-[90vw] bg-white rounded-lg shadow-lg border z-50">
              {/* Tabs */}
              <div className="flex border-b">
                <button
                  onClick={() => handleTabClick('announcements')}
                  className={`flex-1 p-3 text-sm font-medium ${activeTab === 'announcements' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}
                >
                  Announcements {announcementCount > 0 && <span className="ml-1 bg-red-500 text-white text-xs rounded-full px-1">{announcementCount}</span>}
                </button>
                {(user?.role === 'student' || user?.role === 'staff') && (
                  <button
                    onClick={() => handleTabClick('marks')}
                    className={`flex-1 p-3 text-sm font-medium ${activeTab === 'marks' ? 'text-green-600 border-b-2 border-green-600' : 'text-gray-500'}`}
                  >
                    Marks {markCount > 0 && <span className="ml-1 bg-red-500 text-white text-xs rounded-full px-1">{markCount}</span>}
                  </button>
                )}
                {(user?.role === 'admin' || user?.role === 'staff') && (
                  <button
                    onClick={() => handleTabClick('leaves')}
                    className={`flex-1 p-3 text-sm font-medium ${activeTab === 'leaves' ? 'text-orange-600 border-b-2 border-orange-600' : 'text-gray-500'}`}
                  >
                    Leaves {leaveCount > 0 && <span className="ml-1 bg-red-500 text-white text-xs rounded-full px-1">{leaveCount}</span>}
                  </button>
                )}
              </div>
              
              {/* Content */}
              <div className="max-h-64 overflow-y-auto">
                {activeTab === 'announcements' && (
                  announcements.length === 0 ? (
                    <div className="p-4 text-center text-gray-500">No new announcements</div>
                  ) : (
                    announcements.map((announcement) => (
                      <div key={announcement._id} className="p-3 border-b hover:bg-gray-50">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <p className="font-medium text-sm">{announcement.title}</p>
                            <p className="text-xs text-gray-500 mt-1 line-clamp-2">{announcement.content}</p>
                            <p className="text-xs text-gray-400 mt-1">
                              {new Date(announcement.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                          <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                            {announcement.targetRole === 'all' ? 'All' : announcement.targetRole}
                          </span>
                        </div>
                      </div>
                    ))
                  )
                )}
                
                {activeTab === 'marks' && (user?.role === 'student' || user?.role === 'staff') && (
                  markUpdates.length === 0 ? (
                    <div className="p-4 text-center text-gray-500">No recent mark updates</div>
                  ) : (
                    markUpdates.map((mark) => (
                      <div key={mark._id} className="p-3 border-b hover:bg-gray-50">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <p className="font-medium text-sm">{mark.subject?.name}</p>
                            <p className="text-xs text-gray-500">
                              {user.role === 'student' ? 'Your mark' : mark.student?.name}: {mark.marks}
                            </p>
                            <p className="text-xs text-gray-400">
                              {new Date(mark.updatedAt).toLocaleDateString()}
                            </p>
                          </div>
                          <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                            {mark.examType}
                          </span>
                        </div>
                      </div>
                    ))
                  )
                )}
                
                {activeTab === 'leaves' && (user?.role === 'admin' || user?.role === 'staff') && (
                  notifications.length === 0 ? (
                    <div className="p-4 text-center text-gray-500">
                      {user?.role === 'admin' ? 'No pending leave requests' : 'No leave status updates'}
                    </div>
                  ) : (
                    notifications.map((request) => (
                      <div key={request._id} className="p-3 border-b hover:bg-gray-50">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <p className="font-medium text-sm">
                              {user?.role === 'admin' ? request.staff?.name : 'Your Leave Request'}
                            </p>
                            <p className="text-xs text-gray-500">{request.leaveType} leave</p>
                            <p className="text-xs text-gray-400">
                              {new Date(request.startDate).toLocaleDateString()} - {new Date(request.endDate).toLocaleDateString()}
                            </p>
                            {user?.role === 'staff' && request.adminResponse && (
                              <p className="text-xs text-gray-600 mt-1">
                                Response: {request.adminResponse}
                              </p>
                            )}
                          </div>
                          <span className={`text-xs px-2 py-1 rounded ${
                            request.status === 'approved' ? 'bg-green-100 text-green-800' :
                            request.status === 'rejected' ? 'bg-red-100 text-red-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {request.status}
                          </span>
                        </div>
                      </div>
                    ))
                  )
                )}
              </div>
              
              {/* Footer */}
              <div className="p-3 border-t">
                <button
                  onClick={() => {
                    setShowNotifications(false);
                    const routes = {
                      announcements: `/${user?.role}/announcements`,
                      marks: `/${user?.role}/marks`,
                      leaves: user?.role === 'admin' ? '/admin/leaves' : '/staff/leaves'
                    };
                    navigate(routes[activeTab]);
                  }}
                  className="w-full text-center text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  View All {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
                </button>
              </div>
            </div>
          )}
        </div>
        
        <div className="text-right hidden sm:block">
          <p className="text-sm font-medium truncate max-w-20 sm:max-w-32 lg:max-w-none">{user?.name}</p>
          <p className="text-xs text-gray-500 truncate max-w-20 sm:max-w-32 lg:max-w-none">{user?.email}</p>
        </div>
        <div className="w-8 h-8 lg:w-10 lg:h-10 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
          <User size={16} className="text-white lg:w-5 lg:h-5" />
        </div>
      </div>
    </div>
  );
};

export default Navbar;