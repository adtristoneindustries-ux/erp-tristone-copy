import { useState, useEffect } from 'react';
import axios from 'axios';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';

export default function StaffFinancial() {
  const [fees, setFees] = useState([]);
  const [students, setStudents] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedFee, setSelectedFee] = useState(null);
  const [payment, setPayment] = useState({ amount: '', method: '', transactionId: '' });

  useEffect(() => {
    fetchFees();
    fetchStudents();
  }, []);

  const fetchFees = async () => {
    const { data } = await axios.get('http://localhost:5000/api/fees', {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    });
    setFees(data);
  };

  const fetchStudents = async () => {
    const { data } = await axios.get('http://localhost:5000/api/users?role=student', {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    });
    setStudents(data);
  };

  const addPayment = async (e) => {
    e.preventDefault();
    await axios.post(`http://localhost:5000/api/fees/${selectedFee}/payment`, 
      { ...payment, date: new Date() },
      { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }}
    );
    setShowModal(false);
    setPayment({ amount: '', method: '', transactionId: '' });
    fetchFees();
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 lg:ml-64 overflow-x-hidden">
        <Navbar />
        <div className="p-4 md:p-6">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold mb-6">Financial Management</h1>

          <div className="overflow-x-auto mb-6" style={{scrollbarWidth: 'thin', scrollbarColor: '#9CA3AF #F3F4F6'}}>
            <div className="flex gap-4 lg:grid lg:grid-cols-3 lg:gap-4 pb-2">
              <div className="bg-white p-4 rounded-lg shadow min-w-[180px]">
                <h3 className="text-gray-500 text-xs sm:text-sm">Total Revenue</h3>
                <p className="text-xl sm:text-2xl font-bold text-green-600">₹{fees.reduce((a, b) => a + b.paidAmount, 0).toLocaleString()}</p>
              </div>
              <div className="bg-white p-4 rounded-lg shadow min-w-[180px]">
                <h3 className="text-gray-500 text-xs sm:text-sm">Pending</h3>
                <p className="text-xl sm:text-2xl font-bold text-orange-600">₹{fees.reduce((a, b) => a + b.dueAmount, 0).toLocaleString()}</p>
              </div>
              <div className="bg-white p-4 rounded-lg shadow min-w-[180px]">
                <h3 className="text-gray-500 text-xs sm:text-sm">Students</h3>
                <p className="text-xl sm:text-2xl font-bold text-blue-600">{fees.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div style={{overflowX: 'scroll', overflowY: 'scroll', maxHeight: '500px', WebkitOverflowScrolling: 'touch'}}>
              <div style={{minWidth: '1200px'}}>
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-3 sm:px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Student</th>
                      <th className="px-3 sm:px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Year</th>
                      <th className="px-3 sm:px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                      <th className="px-3 sm:px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Paid</th>
                      <th className="px-3 sm:px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Due</th>
                      <th className="px-3 sm:px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                      <th className="px-3 sm:px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {fees.map(fee => (
                      <tr key={fee._id} className="hover:bg-gray-50">
                        <td className="px-3 sm:px-4 py-3 text-sm">{fee.student?.name}</td>
                        <td className="px-3 sm:px-4 py-3 text-sm">{fee.academicYear}</td>
                        <td className="px-3 sm:px-4 py-3 text-sm font-medium">₹{fee.totalAmount}</td>
                        <td className="px-3 sm:px-4 py-3 text-sm font-medium text-green-600">₹{fee.paidAmount}</td>
                        <td className="px-3 sm:px-4 py-3 text-sm font-medium text-red-600">₹{fee.dueAmount}</td>
                        <td className="px-3 sm:px-4 py-3">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${fee.status === 'Paid' ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'}`}>
                            {fee.status}
                          </span>
                        </td>
                        <td className="px-3 sm:px-4 py-3">
                          {fee.status !== 'Paid' && (
                            <button onClick={() => { setSelectedFee(fee._id); setShowModal(true); }} className="text-blue-600 hover:underline text-xs sm:text-sm whitespace-nowrap">
                              Add Payment
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {showModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
              <div className="bg-white rounded-lg p-4 md:p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
                <h2 className="text-lg md:text-xl font-bold mb-4">Add Payment</h2>
                <form onSubmit={addPayment} className="space-y-4">
                  <input type="number" placeholder="Amount" className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500" value={payment.amount} onChange={(e) => setPayment({...payment, amount: e.target.value})} required />
                  <select className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500" value={payment.method} onChange={(e) => setPayment({...payment, method: e.target.value})} required>
                    <option value="">Payment Method</option>
                    <option value="Cash">Cash</option>
                    <option value="Card">Card</option>
                    <option value="UPI">UPI</option>
                    <option value="Bank Transfer">Bank Transfer</option>
                  </select>
                  <input type="text" placeholder="Transaction ID" className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500" value={payment.transactionId} onChange={(e) => setPayment({...payment, transactionId: e.target.value})} required />
                  <div className="flex flex-col sm:flex-row gap-2">
                    <button type="submit" className="flex-1 bg-blue-600 text-white py-2.5 rounded-lg hover:bg-blue-700 font-medium text-sm">Submit</button>
                    <button type="button" onClick={() => setShowModal(false)} className="flex-1 bg-gray-300 text-gray-700 py-2.5 rounded-lg hover:bg-gray-400 font-medium text-sm">Cancel</button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
