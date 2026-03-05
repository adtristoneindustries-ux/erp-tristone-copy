import { useState, useEffect } from 'react';
import { BookmarkCheck, CheckCircle, XCircle } from 'lucide-react';
import api from '../services/api';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';

export default function LibrarianReservations() {
  const [reservations, setReservations] = useState([]);

  useEffect(() => {
    fetchReservations();
  }, []);

  const fetchReservations = async () => {
    try {
      const res = await api.get('/library/reservations');
      setReservations(res.data.data);
    } catch (error) {
      console.error('Error fetching reservations:', error);
    }
  };

  const handleUpdate = async (id, status) => {
    try {
      await api.put(`/library/reservations/${id}`, { status });
      alert(`Reservation ${status} successfully`);
      fetchReservations();
    } catch (error) {
      alert(error.response?.data?.message || 'Error updating reservation');
    }
  };

  const pendingReservations = reservations.filter(r => r.status === 'pending');
  const processedReservations = reservations.filter(r => r.status !== 'pending');

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 lg:ml-64">
        <Navbar />
        <div className="p-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-6">Book Reservations</h1>

          {/* Pending Reservations */}
          <div className="bg-white rounded-lg shadow mb-6">
            <div className="p-6 border-b">
              <h2 className="text-xl font-semibold">Pending Requests ({pendingReservations.length})</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Book</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Member</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Request Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {pendingReservations.map((reservation) => (
                    <tr key={reservation._id}>
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-semibold">{reservation.book_id?.title}</p>
                          <p className="text-sm text-gray-500">{reservation.book_id?.author}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-semibold">{reservation.member_id?.name}</p>
                          <p className="text-sm text-gray-500">{reservation.member_id?.email}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        {new Date(reservation.reservation_date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleUpdate(reservation._id, 'approved')}
                            className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600 flex items-center gap-1"
                          >
                            <CheckCircle className="w-4 h-4" /> Approve
                          </button>
                          <button
                            onClick={() => handleUpdate(reservation._id, 'rejected')}
                            className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 flex items-center gap-1"
                          >
                            <XCircle className="w-4 h-4" /> Reject
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {pendingReservations.length === 0 && (
                    <tr>
                      <td colSpan="4" className="px-6 py-8 text-center text-gray-500">
                        No pending reservations
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Processed Reservations */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b">
              <h2 className="text-xl font-semibold">Processed Reservations</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Book</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Member</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Request Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Processed Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {processedReservations.map((reservation) => (
                    <tr key={reservation._id}>
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-semibold">{reservation.book_id?.title}</p>
                          <p className="text-sm text-gray-500">{reservation.book_id?.author}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-semibold">{reservation.member_id?.name}</p>
                          <p className="text-sm text-gray-500">{reservation.member_id?.email}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        {new Date(reservation.reservation_date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          reservation.status === 'approved' ? 'bg-green-100 text-green-800' :
                          reservation.status === 'rejected' ? 'bg-red-100 text-red-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {reservation.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        {reservation.processed_date ? new Date(reservation.processed_date).toLocaleDateString() : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
