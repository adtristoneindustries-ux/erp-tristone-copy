import { useState, useEffect, useContext } from 'react';
import { Book, Users, Clock, Calendar, UtensilsCrossed, Bell } from 'lucide-react';
import { Link } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import Card from '../components/Card';
import { AuthContext } from '../context/AuthContext';

const LibrarianDashboard = () => {
  const { user } = useContext(AuthContext);

  const quickActions = [
    { title: 'Manage Books', icon: Book, link: '/staff/library/books', color: 'bg-blue-500' },
    { title: 'Issue & Return', icon: Users, link: '/staff/library/issues', color: 'bg-green-500' },
    { title: 'Reservations', icon: Clock, link: '/staff/library/reservations', color: 'bg-purple-500' },
    { title: 'My Leaves', icon: Calendar, link: '/staff/leaves', color: 'bg-orange-500' },
    { title: 'Cafeteria', icon: UtensilsCrossed, link: '/cafeteria', color: 'bg-yellow-500' },
  ];

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 lg:ml-64">
        <Navbar />
        <div className="p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold">Welcome, {user?.name}!</h1>
            <p className="text-gray-600">Librarian Dashboard</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <Card title="Total Books" value="0" icon={Book} color="blue" />
            <Card title="Issued Books" value="0" icon={Users} color="green" />
            <Card title="Pending Returns" value="0" icon={Clock} color="orange" />
            <Card title="Reservations" value="0" icon={Calendar} color="purple" />
          </div>

          <div>
            <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
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

export default LibrarianDashboard;
