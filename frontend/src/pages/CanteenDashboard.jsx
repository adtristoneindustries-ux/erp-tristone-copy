import { useContext, useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import Card from "../components/Card";
import { UtensilsCrossed, ShoppingCart, DollarSign, TrendingUp, Package, Users, Clock, CheckCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { dashboardAPI } from "../services/api";

const CanteenDashboard = () => {
  const { user } = useContext(AuthContext);
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

  useEffect(() => {
    fetchCanteenStats();
  }, []);

  const fetchCanteenStats = async () => {
    try {
      const res = await dashboardAPI.getCanteenStats();
      setStats(res.data);
    } catch (error) {
      console.error('Error fetching canteen stats:', error);
    }
  };

  const quickActions = [
    { title: "Manage Orders", link: "/staff/cafeteria", color: "bg-blue-500", icon: ShoppingCart },
    { title: "Menu Management", link: "/staff/cafeteria", color: "bg-green-500", icon: UtensilsCrossed },
    { title: "View Revenue", link: "/staff/cafeteria", color: "bg-purple-500", icon: DollarSign },
    { title: "Stock Management", link: "/staff/cafeteria", color: "bg-orange-500", icon: Package }
  ];

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 lg:ml-64 transition-all duration-300">
        <Navbar />
        <div className="p-4 lg:p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold">Canteen Dashboard</h1>
            <p className="text-gray-600">Welcome, {user?.name}!</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <Card title="Today's Orders" value={stats.todayOrders} icon={ShoppingCart} color="blue" />
            <Card title="Today's Revenue" value={`₹${stats.todayRevenue}`} icon={DollarSign} color="green" />
            <Card title="Pending Orders" value={stats.pendingOrders} icon={Clock} color="orange" />
            <Card title="Completed Orders" value={stats.completedOrders} icon={CheckCircle} color="purple" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <Card title="Menu Items" value={stats.totalMenuItems} icon={UtensilsCrossed} color="blue" />
            <Card title="Active Customers" value={stats.activeCustomers} icon={Users} color="green" />
            <Card title="Low Stock Items" value={stats.lowStockItems} icon={Package} color="red" />
            <Card title="Avg Order Value" value={`₹${stats.averageOrderValue}`} icon={TrendingUp} color="purple" />
          </div>

          <div>
            <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {quickActions.map((action, idx) => (
                <Link
                  key={idx}
                  to={action.link}
                  className={`${action.color} text-white rounded-lg shadow-lg p-6 hover:opacity-90 transition-all flex flex-col items-center text-center`}
                >
                  <action.icon size={32} className="mb-4" />
                  <h3 className="text-xl font-bold">{action.title}</h3>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CanteenDashboard;
