import { useContext, useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import { Book, BookOpen, Users, Clock, CheckCircle, AlertCircle, TrendingUp, Calendar, BookMarked, Library } from "lucide-react";
import { Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { dashboardAPI } from "../services/api";

const LibrarianDashboard = () => {
  const { user } = useContext(AuthContext);
  const [stats, setStats] = useState({
    totalBooks: 0,
    issuedBooks: 0,
    overdueBooks: 0,
    activeMembers: 0,
    todayIssues: 0,
    todayReturns: 0,
    pendingReservations: 0,
    availableBooks: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLibraryStats();
  }, []);

  const fetchLibraryStats = async () => {
    try {
      const res = await dashboardAPI.getLibraryStats();
      setStats(res.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching library stats:', error);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading library dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 lg:ml-64">
        <Navbar />
        <div className="p-4 sm:p-6">
          {/* Header */}
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-indigo-100 rounded-lg">
                <Library className="text-indigo-600" size={32} />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Library Management</h1>
                <p className="text-sm text-gray-600">Welcome back, {user?.name}!</p>
              </div>
            </div>
          </div>

          {/* Main Stats - Large Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-lg p-6 text-white">
              <div className="flex items-center justify-between mb-4">
                <Book size={40} className="opacity-80" />
                <div className="text-right">
                  <p className="text-3xl font-bold">{stats.totalBooks}</p>
                  <p className="text-sm text-blue-100">Total Books</p>
                </div>
              </div>
              <div className="h-1 bg-blue-400 rounded-full"></div>
            </div>

            <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow-lg p-6 text-white">
              <div className="flex items-center justify-between mb-4">
                <BookOpen size={40} className="opacity-80" />
                <div className="text-right">
                  <p className="text-3xl font-bold">{stats.issuedBooks}</p>
                  <p className="text-sm text-green-100">Issued Books</p>
                </div>
              </div>
              <div className="h-1 bg-green-400 rounded-full"></div>
            </div>

            <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-lg shadow-lg p-6 text-white">
              <div className="flex items-center justify-between mb-4">
                <AlertCircle size={40} className="opacity-80" />
                <div className="text-right">
                  <p className="text-3xl font-bold">{stats.overdueBooks}</p>
                  <p className="text-sm text-red-100">Overdue Books</p>
                </div>
              </div>
              <div className="h-1 bg-red-400 rounded-full"></div>
            </div>

            <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg shadow-lg p-6 text-white">
              <div className="flex items-center justify-between mb-4">
                <Users size={40} className="opacity-80" />
                <div className="text-right">
                  <p className="text-3xl font-bold">{stats.activeMembers}</p>
                  <p className="text-sm text-purple-100">Active Members</p>
                </div>
              </div>
              <div className="h-1 bg-purple-400 rounded-full"></div>
            </div>
          </div>

          {/* Today's Activity */}
          <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-lg shadow-md p-4 sm:p-6 mb-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-white rounded-lg shadow-sm">
                <TrendingUp className="text-indigo-600" size={24} />
              </div>
              <h2 className="text-xl font-bold text-gray-900">Today's Activity</h2>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <BookOpen className="text-blue-500" size={20} />
                  <p className="text-xs text-gray-600">Issues</p>
                </div>
                <p className="text-2xl font-bold text-gray-900">{stats.todayIssues}</p>
              </div>
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="text-green-500" size={20} />
                  <p className="text-xs text-gray-600">Returns</p>
                </div>
                <p className="text-2xl font-bold text-gray-900">{stats.todayReturns}</p>
              </div>
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="text-orange-500" size={20} />
                  <p className="text-xs text-gray-600">Pending</p>
                </div>
                <p className="text-2xl font-bold text-gray-900">{stats.pendingReservations}</p>
              </div>
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <Book className="text-purple-500" size={20} />
                  <p className="text-xs text-gray-600">Available</p>
                </div>
                <p className="text-2xl font-bold text-gray-900">{stats.availableBooks}</p>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="mb-4">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link
              to="/staff/library/issues"
              className="bg-white border-2 border-blue-200 hover:border-blue-400 rounded-lg shadow-md p-6 transition-all group"
            >
              <div className="flex flex-col items-center text-center">
                <div className="p-3 bg-blue-100 rounded-full mb-3 group-hover:bg-blue-200 transition-colors">
                  <BookOpen className="text-blue-600" size={32} />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-1">Issue Book</h3>
                <p className="text-xs text-gray-600">Issue books to members</p>
              </div>
            </Link>

            <Link
              to="/staff/library/issues"
              className="bg-white border-2 border-green-200 hover:border-green-400 rounded-lg shadow-md p-6 transition-all group"
            >
              <div className="flex flex-col items-center text-center">
                <div className="p-3 bg-green-100 rounded-full mb-3 group-hover:bg-green-200 transition-colors">
                  <CheckCircle className="text-green-600" size={32} />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-1">Return Book</h3>
                <p className="text-xs text-gray-600">Process book returns</p>
              </div>
            </Link>

            <Link
              to="/staff/library/books"
              className="bg-white border-2 border-purple-200 hover:border-purple-400 rounded-lg shadow-md p-6 transition-all group"
            >
              <div className="flex flex-col items-center text-center">
                <div className="p-3 bg-purple-100 rounded-full mb-3 group-hover:bg-purple-200 transition-colors">
                  <Book className="text-purple-600" size={32} />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-1">Manage Books</h3>
                <p className="text-xs text-gray-600">Add or update books</p>
              </div>
            </Link>

            <Link
              to="/staff/library/reservations"
              className="bg-white border-2 border-orange-200 hover:border-orange-400 rounded-lg shadow-md p-6 transition-all group"
            >
              <div className="flex flex-col items-center text-center">
                <div className="p-3 bg-orange-100 rounded-full mb-3 group-hover:bg-orange-200 transition-colors">
                  <Calendar className="text-orange-600" size={32} />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-1">Reservations</h3>
                <p className="text-xs text-gray-600">View pending requests</p>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LibrarianDashboard;
