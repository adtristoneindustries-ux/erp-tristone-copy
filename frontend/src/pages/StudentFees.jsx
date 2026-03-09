import { useState, useEffect } from 'react';
import axios from 'axios';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';

export default function StudentFees() {
  const [fees, setFees] = useState([]);
  const [user, setUser] = useState(null);

  useEffect(() => {
    fetchUser();
  }, []);

  const fetchUser = async () => {
    const { data } = await axios.get('http://localhost:5000/api/auth/me', {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    });
    setUser(data);
    fetchFees(data._id);
  };

  const fetchFees = async (studentId) => {
    const { data } = await axios.get(`http://localhost:5000/api/fees?student=${studentId}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    });
    setFees(data);
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 lg:ml-64">
        <Navbar />
        <div className="p-4 md:p-6">
      <h1 className="text-2xl md:text-3xl font-bold mb-6">My Fees</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-gray-500 text-sm">Total Fees</h3>
          <p className="text-2xl font-bold">₹{fees.reduce((a, b) => a + b.totalAmount, 0).toLocaleString()}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-gray-500 text-sm">Paid</h3>
          <p className="text-2xl font-bold text-green-600">₹{fees.reduce((a, b) => a + b.paidAmount, 0).toLocaleString()}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-gray-500 text-sm">Due</h3>
          <p className="text-2xl font-bold text-red-600">₹{fees.reduce((a, b) => a + b.dueAmount, 0).toLocaleString()}</p>
        </div>
      </div>

      <div className="space-y-4">
        {fees.map(fee => (
          <div key={fee._id} className="bg-white rounded-lg shadow p-4 md:p-6">
            <div className="flex flex-col md:flex-row justify-between mb-4 gap-2">
              <div>
                <h3 className="text-lg font-bold">Academic Year: {fee.academicYear}</h3>
                <p className="text-sm text-gray-500">Due Date: {new Date(fee.dueDate).toLocaleDateString()}</p>
              </div>
              <span className={`px-3 py-1 rounded text-sm h-fit ${fee.status === 'Paid' ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'}`}>
                {fee.status}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
              <div>
                <p className="text-sm text-gray-500">Total Amount</p>
                <p className="text-xl font-bold">₹{fee.totalAmount.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Paid Amount</p>
                <p className="text-xl font-bold text-green-600">₹{fee.paidAmount.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Due Amount</p>
                <p className="text-xl font-bold text-red-600">₹{fee.dueAmount.toLocaleString()}</p>
              </div>
            </div>

            {fee.payments.length > 0 && (
              <div className="overflow-x-auto">
                <h4 className="font-semibold mb-2">Payment History</h4>
                <table className="w-full min-w-[480px]">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-3 py-2 text-left text-xs">Date</th>
                      <th className="px-3 py-2 text-left text-xs">Amount</th>
                      <th className="px-3 py-2 text-left text-xs">Method</th>
                      <th className="px-3 py-2 text-left text-xs">Transaction ID</th>
                    </tr>
                  </thead>
                  <tbody>
                    {fee.payments.map((payment, idx) => (
                      <tr key={idx} className="border-t">
                        <td className="px-3 py-2">{new Date(payment.date).toLocaleDateString()}</td>
                        <td className="px-3 py-2">₹{payment.amount.toLocaleString()}</td>
                        <td className="px-3 py-2">{payment.method}</td>
                        <td className="px-3 py-2">{payment.transactionId}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        ))}
      </div>
        </div>
      </div>
    </div>
  );
}
