import { useState, useEffect } from 'react';
import { Book, Users, BookOpen, AlertCircle, TrendingUp, Package, UserPlus, Trash2 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import api from '../services/api';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';

export default function AdminLibrary() {
  const [stats, setStats] = useState({});
  const [mostBorrowed, setMostBorrowed] = useState([]);
  const [overdueBooks, setOverdueBooks] = useState([]);
  const [librarians, setLibrarians] = useState([]);
  const [allStaff, setAllStaff] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [statsRes, booksRes, issuesRes, libRes, staffRes] = await Promise.all([
        api.get('/library/stats'),
        api.get('/library/reports/most-borrowed'),
        api.get('/library/issues?status=issued'),
        api.get('/users?role=librarian'),
        api.get('/users')
      ]);
      setStats(statsRes.data.data);
      setMostBorrowed(booksRes.data.data.slice(0, 5));
      
      const overdue = issuesRes.data.data.filter(issue => 
        new Date(issue.due_date) < new Date()
      );
      setOverdueBooks(overdue);
      setLibrarians(libRes.data.data || []);
      
      // Filter only staff and exclude librarians
      const allUsers = staffRes.data.data || staffRes.data || [];
      const staffOnly = allUsers.filter(user => 
        user.role === 'staff' || user.role === 'teacher'
      );
      setAllStaff(staffOnly);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const handleAssign = async (e) => {
    e.preventDefault();
    if (!selectedStaff) {
      alert('Please select a staff member');
      return;
    }
    try {
      const response = await api.put(`/users/${selectedStaff}`, { role: 'librarian' });
      console.log('Update response:', response.data);
      alert('Librarian assigned successfully! The staff member must logout and login again to see librarian dashboard.');
      setShowModal(false);
      setSelectedStaff('');
      fetchData();
    } catch (error) {
      console.error('Assign error:', error);
      alert(error.response?.data?.message || 'Error assigning librarian');
    }
  };

  const handleRemove = async (id) => {
    if (!confirm('Remove librarian role and change back to staff?')) return;
    try {
      const response = await api.put(`/users/${id}`, { role: 'staff' });
      console.log('Remove response:', response.data);
      alert('Librarian role removed successfully');
      fetchData();
    } catch (error) {
      console.error('Remove error:', error);
      alert(error.response?.data?.message || 'Error removing librarian');
    }
  };

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 lg:ml-64">
        <Navbar />
        <div className="p-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-6">Library Management - Admin Dashboard</h1>

          {/* Library Staff Section */}
          <div className="bg-white rounded-lg shadow mb-6">
            <div className="p-6 border-b flex justify-between items-center">
              <div>
                <h2 className="text-xl font-semibold">Library Staff</h2>
                <p className="text-sm text-gray-500">Manage librarians who can access library management</p>
                <p className="text-xs text-orange-600 mt-1">⚠️ Note: Staff must logout and login again to see librarian dashboard</p>
              </div>
              <button
                onClick={() => setShowModal(true)}
                className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 flex items-center gap-2"
              >
                <UserPlus className="w-5 h-5" /> Assign Librarian
              </button>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {librarians && librarians.length > 0 ? librarians.map((lib) => (
                  <div key={lib._id} className="border rounded-lg p-4 flex justify-between items-center">
                    <div>
                      <p className="font-semibold">{lib.name}</p>
                      <p className="text-sm text-gray-500">{lib.email}</p>
                    </div>
                    <button
                      onClick={() => handleRemove(lib._id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                )) : (
                  <div className="col-span-3 text-center text-gray-500 py-4">
                    No librarians assigned yet
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-6">
            <StatCard icon={Book} title="Total Books" value={stats.totalBooks || 0} color="blue" />
            <StatCard icon={Package} title="Categories" value={stats.totalCategories || 0} color="purple" />
            <StatCard icon={BookOpen} title="Issued Books" value={stats.issuedBooks || 0} color="green" />
            <StatCard icon={Book} title="Available" value={stats.availableBooks || 0} color="indigo" />
            <StatCard icon={AlertCircle} title="Overdue" value={stats.overdueBooks || 0} color="red" />
            <StatCard icon={TrendingUp} title="Reserved" value={stats.reservedBooks || 0} color="yellow" />
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">Most Borrowed Books</h2>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={mostBorrowed}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="book.title" angle={-45} textAnchor="end" height={100} />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#3B82F6" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">Library Statistics</h2>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={[
                      { name: 'Available', value: stats.availableBooks || 0 },
                      { name: 'Issued', value: stats.issuedBooks || 0 },
                      { name: 'Reserved', value: stats.reservedBooks || 0 },
                      { name: 'Lost', value: stats.lostBooks || 0 }
                    ]}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {COLORS.map((color, index) => (
                      <Cell key={`cell-${index}`} fill={color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Overdue Books */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b">
              <h2 className="text-xl font-semibold">Overdue Books</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Book</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Member</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Due Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Days Late</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fine</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {overdueBooks.map((issue) => {
                    const daysLate = Math.ceil((new Date() - new Date(issue.due_date)) / (1000 * 60 * 60 * 24));
                    return (
                      <tr key={issue._id}>
                        <td className="px-6 py-4">{issue.book_id?.title}</td>
                        <td className="px-6 py-4">{issue.member_id?.name}</td>
                        <td className="px-6 py-4">{new Date(issue.due_date).toLocaleDateString()}</td>
                        <td className="px-6 py-4">
                          <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs">
                            {daysLate} days
                          </span>
                        </td>
                        <td className="px-6 py-4 font-semibold">₹{daysLate * 5}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="p-6 border-b">
              <h2 className="text-2xl font-bold">Assign Librarian</h2>
            </div>
            <form onSubmit={handleAssign} className="p-6">
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Select Staff Member</label>
                <select
                  required
                  value={selectedStaff}
                  onChange={(e) => setSelectedStaff(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Choose staff member</option>
                  {allStaff && allStaff.map(staff => (
                    <option key={staff._id} value={staff._id}>
                      {staff.name} - {staff.email}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex gap-4">
                <button
                  type="submit"
                  className="flex-1 bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600"
                >
                  Assign
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
    </div>
  );
}

function StatCard({ icon: Icon, title, value, color }) {
  const colors = {
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    purple: 'bg-purple-500',
    red: 'bg-red-500',
    yellow: 'bg-yellow-500',
    indigo: 'bg-indigo-500'
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-500 text-sm">{title}</p>
          <p className="text-2xl font-bold mt-1">{value}</p>
        </div>
        <div className={`${colors[color]} p-3 rounded-lg`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </div>
  );
}
