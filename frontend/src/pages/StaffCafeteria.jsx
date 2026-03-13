import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import { TrendingUp, Users, DollarSign, ShoppingCart, Clock, CheckCircle, XCircle, Package } from 'lucide-react';

const StaffCafeteria = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    todayOrders: 0,
    todayRevenue: 0,
    pendingOrders: 0,
    completedOrders: 0,
    totalMenuItems: 0,
    activeCustomers: 0,
    lowStockItems: 0,
    averageOrderValue: 0
  });
  const [isCanteenStaff, setIsCanteenStaff] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAccess();
  }, []);

  const checkAccess = async () => {
    const token = localStorage.getItem('token');
    try {
      const res = await axios.get('http://localhost:5000/api/cafeteria/check-staff', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.data.isCanteenStaff) {
        navigate('/staff');
        return;
      }
      setIsCanteenStaff(true);
      fetchDashboardData();
    } catch (error) {
      navigate('/staff');
    }
  };

  const fetchDashboardData = async () => {
    const token = localStorage.getItem('token');
    try {
      const statsRes = await axios.get('http://localhost:5000/api/dashboard/canteen', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setStats(statsRes.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
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
          <div className="mb-6">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Canteen Dashboard</h1>
            <p className="text-sm text-gray-600 mt-1">Overview of today's canteen operations</p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-lg shadow-md p-4 border-l-4 border-blue-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Today's Orders</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.todayOrders}</p>
                </div>
                <ShoppingCart className="text-blue-500" size={32} />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-4 border-l-4 border-green-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Today's Revenue</p>
                  <p className="text-2xl font-bold text-gray-900">₹{stats.todayRevenue}</p>
                </div>
                <DollarSign className="text-green-500" size={32} />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-4 border-l-4 border-yellow-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Pending Orders</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.pendingOrders}</p>
                </div>
                <Clock className="text-yellow-500" size={32} />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-4 border-l-4 border-purple-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Completed</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.completedOrders}</p>
                </div>
                <CheckCircle className="text-purple-500" size={32} />
              </div>
            </div>
          </div>

          {/* Secondary Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-lg shadow-md p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-600">Menu Items</p>
                  <p className="text-xl font-bold text-gray-900">{stats.totalMenuItems}</p>
                </div>
                <Package className="text-indigo-500" size={24} />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-600">Active Customers</p>
                  <p className="text-xl font-bold text-gray-900">{stats.activeCustomers}</p>
                </div>
                <Users className="text-blue-500" size={24} />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-600">Avg Order Value</p>
                  <p className="text-xl font-bold text-gray-900">₹{stats.averageOrderValue}</p>
                </div>
                <TrendingUp className="text-green-500" size={24} />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-600">Low Stock Items</p>
                  <p className="text-xl font-bold text-gray-900">{stats.lowStockItems}</p>
                </div>
                <XCircle className="text-red-500" size={24} />
              </div>
            </div>
          </div>

          {/* Performance Overview */}
          <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-lg shadow-md p-4 sm:p-6 mb-6">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-full shadow-md mb-4">
                <TrendingUp className="text-orange-500" size={32} />
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">Today's Performance</h2>
              <p className="text-sm text-gray-600 mb-6">Real-time canteen operations overview</p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                <div className="bg-white rounded-lg p-3 sm:p-4 shadow-sm">
                  <p className="text-2xl sm:text-3xl font-bold text-blue-600">{stats.todayOrders}</p>
                  <p className="text-xs text-gray-600 mt-1">Orders</p>
                </div>
                <div className="bg-white rounded-lg p-3 sm:p-4 shadow-sm">
                  <p className="text-2xl sm:text-3xl font-bold text-green-600">₹{stats.todayRevenue}</p>
                  <p className="text-xs text-gray-600 mt-1">Revenue</p>
                </div>
                <div className="bg-white rounded-lg p-3 sm:p-4 shadow-sm">
                  <p className="text-2xl sm:text-3xl font-bold text-yellow-600">{stats.pendingOrders}</p>
                  <p className="text-xs text-gray-600 mt-1">Pending</p>
                </div>
                <div className="bg-white rounded-lg p-3 sm:p-4 shadow-sm">
                  <p className="text-2xl sm:text-3xl font-bold text-purple-600">{stats.completedOrders}</p>
                  <p className="text-xs text-gray-600 mt-1">Completed</p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <button
              onClick={() => navigate('/staff/cafeteria/orders')}
              className="bg-blue-500 text-white p-6 rounded-lg shadow-md hover:bg-blue-600 transition-colors"
            >
              <ShoppingCart className="mx-auto mb-2" size={32} />
              <h3 className="font-semibold text-lg">Manage Orders</h3>
              <p className="text-sm text-blue-100 mt-1">View and update order status</p>
            </button>

            <button
              onClick={() => navigate('/staff/cafeteria/menu')}
              className="bg-green-500 text-white p-6 rounded-lg shadow-md hover:bg-green-600 transition-colors"
            >
              <Package className="mx-auto mb-2" size={32} />
              <h3 className="font-semibold text-lg">Menu Management</h3>
              <p className="text-sm text-green-100 mt-1">Add and update food items</p>
            </button>

            <button
              onClick={() => navigate('/staff/cafeteria/ratings')}
              className="bg-purple-500 text-white p-6 rounded-lg shadow-md hover:bg-purple-600 transition-colors"
            >
              <TrendingUp className="mx-auto mb-2" size={32} />
              <h3 className="font-semibold text-lg">Ratings & Reviews</h3>
              <p className="text-sm text-purple-100 mt-1">View customer feedback</p>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StaffCafeteria;
