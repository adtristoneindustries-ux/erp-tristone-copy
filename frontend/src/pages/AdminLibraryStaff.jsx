import { useState, useEffect } from 'react';
import { Users, UserPlus, Trash2 } from 'lucide-react';
import api from '../services/api';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';

export default function AdminLibraryStaff() {
  const [librarians, setLibrarians] = useState([]);
  const [allStaff, setAllStaff] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState('');

  useEffect(() => {
    fetchLibrarians();
    fetchAllStaff();
  }, []);

  const fetchLibrarians = async () => {
    try {
      const res = await api.get('/users?role=librarian');
      setLibrarians(res.data.data);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const fetchAllStaff = async () => {
    try {
      const res = await api.get('/users?role=staff');
      setAllStaff(res.data.data);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleAssign = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/users/${selectedStaff}`, { role: 'librarian' });
      alert('Librarian assigned successfully');
      setShowModal(false);
      setSelectedStaff('');
      fetchLibrarians();
      fetchAllStaff();
    } catch (error) {
      alert(error.response?.data?.message || 'Error assigning librarian');
    }
  };

  const handleRemove = async (id) => {
    if (!confirm('Remove librarian role?')) return;
    try {
      await api.put(`/users/${id}`, { role: 'staff' });
      alert('Librarian removed successfully');
      fetchLibrarians();
      fetchAllStaff();
    } catch (error) {
      alert(error.response?.data?.message || 'Error removing librarian');
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 lg:ml-64">
        <Navbar />
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-800">Library Staff Management</h1>
            <button
              onClick={() => setShowModal(true)}
              className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 flex items-center gap-2"
            >
              <UserPlus className="w-5 h-5" /> Assign Librarian
            </button>
          </div>

          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b">
              <h2 className="text-xl font-semibold">Current Librarians ({librarians.length})</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Phone</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {librarians.map((lib) => (
                    <tr key={lib._id}>
                      <td className="px-6 py-4 font-semibold">{lib.name}</td>
                      <td className="px-6 py-4">{lib.email}</td>
                      <td className="px-6 py-4">{lib.phone || '-'}</td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => handleRemove(lib._id)}
                          className="text-red-600 hover:text-red-800 flex items-center gap-1"
                        >
                          <Trash2 className="w-4 h-4" /> Remove
                        </button>
                      </td>
                    </tr>
                  ))}
                  {librarians.length === 0 && (
                    <tr>
                      <td colSpan="4" className="px-6 py-8 text-center text-gray-500">
                        No librarians assigned
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

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
                  {allStaff.map(staff => (
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
