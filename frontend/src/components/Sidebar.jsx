import { Link, useLocation } from 'react-router-dom';
import { Home, Users, BookOpen, Calendar, FileText, Bell, LogOut, ClipboardList, Award, Menu, X } from 'lucide-react';
import { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import { materialAPI } from '../services/api';

const Sidebar = () => {
  const { user, logout } = useContext(AuthContext);
  const location = useLocation();
  const [newMaterialsCount, setNewMaterialsCount] = useState(0);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const adminLinks = [
    { to: '/admin', icon: Home, label: 'Dashboard' },
    { to: '/admin/students', icon: Users, label: 'Students' },
    { to: '/admin/staff', icon: Users, label: 'Staff' },
    { to: '/admin/subjects', icon: BookOpen, label: 'Subjects' },
    { to: '/admin/classes', icon: Users, label: 'Classes' },
    { to: '/admin/attendance', icon: ClipboardList, label: 'Student Attendance' },
    { to: '/admin/staff-attendance', icon: ClipboardList, label: 'Staff Attendance' },
    { to: '/admin/marks', icon: Award, label: 'Marks' },
    { to: '/admin/leaves', icon: Calendar, label: 'Leave Requests' },
    { to: '/admin/timetable', icon: Calendar, label: 'Timetable Module' },
    { to: '/admin/announcements', icon: Bell, label: 'Announcements' }
  ];

  const staffLinks = [
    { to: '/staff', icon: Home, label: 'Dashboard' },
    { to: '/staff/attendance', icon: ClipboardList, label: 'Mark Attendance' },
    { to: '/staff/my-attendance', icon: Calendar, label: 'My Attendance' },
    { to: '/staff/marks', icon: Award, label: 'Marks' },
    { to: '/staff/homework', icon: FileText, label: 'Homework' },
    { to: '/staff/leaves', icon: Calendar, label: 'My Leaves' },
    { to: '/staff/student-leaves', icon: ClipboardList, label: 'Student Leaves' },
    { to: '/staff/materials', icon: FileText, label: 'Materials' },
    { to: '/staff/announcements', icon: Bell, label: 'Announcements' },
    { to: '/staff/timetable', icon: Calendar, label: 'My Timetable' }
  ];

  // Fetch new materials count for students
  useEffect(() => {
    if (user?.role === 'student' && user?.class && user?.section) {
      fetchNewMaterialsCount();
      
      // Check every 30 seconds for new materials
      const interval = setInterval(fetchNewMaterialsCount, 30000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const fetchNewMaterialsCount = async () => {
    try {
      const response = await materialAPI.getNewMaterialsCount({
        class: user.class,
        section: user.section
      });
      setNewMaterialsCount(response.data.count);
    } catch (error) {
      console.error('Failed to fetch new materials count:', error);
    }
  };

  const studentLinks = [
    { to: '/student', icon: Home, label: 'Dashboard' },
    { to: '/student/marks', icon: Award, label: 'My Marks' },
    { to: '/student/attendance', icon: ClipboardList, label: 'My Attendance' },
    { to: '/student/homework', icon: FileText, label: 'Homework' },
    { to: '/student/leave-requests', icon: Calendar, label: 'Leave Requests' },
    { to: '/student/timetable', icon: Calendar, label: 'Timetable' },
    { to: '/student/materials', icon: FileText, label: 'Materials', hasNotification: newMaterialsCount > 0 },
    { to: '/student/announcements', icon: Bell, label: 'Announcements' }
  ];

  const links = user?.role === 'admin' ? adminLinks : user?.role === 'staff' ? staffLinks : studentLinks;

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.classList.add('menu-open');
    } else {
      document.body.classList.remove('menu-open');
    }
    return () => document.body.classList.remove('menu-open');
  }, [isMobileMenuOpen]);

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 bg-blue-600 text-white p-3 rounded-lg shadow-lg hover:bg-blue-700 active:scale-95 transition-all"
        aria-label="Toggle menu"
      >
        {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40 backdrop-blur-sm"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed left-0 top-0 h-full bg-blue-600 text-white overflow-y-auto z-40 transition-transform duration-300 ease-in-out shadow-2xl
        w-64 lg:w-64
        ${
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }
      `}>
        <div className="p-4 lg:p-6 border-b border-blue-500">
          <div className="flex items-center justify-between">
            <div className="pt-12 lg:pt-0">
              <h1 className="text-xl font-bold">School ERP</h1>
              <p className="text-xs text-blue-200 mt-1 font-medium">{user?.role?.toUpperCase()}</p>
            </div>
          </div>
        </div>
        
        <nav className="py-4">
          {links.map(({ to, icon: Icon, label, hasNotification }) => (
            <Link
              key={to}
              to={to}
              className={`flex items-center px-4 py-3 hover:bg-blue-700 active:bg-blue-800 transition-all duration-200 relative group ${
                location.pathname === to ? 'bg-blue-700 border-l-4 border-white' : ''
              }`}
              onClick={() => {
                if (to === '/student/materials' && hasNotification) {
                  setNewMaterialsCount(0);
                }
                setIsMobileMenuOpen(false);
              }}
            >
              <Icon size={18} className="mr-3 flex-shrink-0" />
              <span className="text-sm truncate">{label}</span>
              {hasNotification && (
                <div className="ml-auto">
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                </div>
              )}
            </Link>
          ))}
          
          <button
            onClick={() => {
              logout();
              setIsMobileMenuOpen(false);
            }}
            className="flex items-center px-4 py-3 hover:bg-gray-100 hover:text-black active:bg-gray-300 transition-all duration-200 w-full text-left mt-2 border-t border-blue-500"
          >
            <LogOut size={18} className="mr-3 flex-shrink-0" />
            <span className="text-sm">Logout</span>
          </button>
        </nav>
      </div>
    </>
  );
};

export default Sidebar;
