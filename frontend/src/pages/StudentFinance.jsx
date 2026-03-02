import { useState, useEffect } from 'react';
import { DollarSign, Award, CreditCard } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import api from '../services/api';
import { useSocket } from '../context/SocketContext';

const StudentFinance = () => {
  const [finance, setFinance] = useState(null);
  const socket = useSocket();

  useEffect(() => {
    fetchFinance();
    if (socket) socket.on('financeUpdate', fetchFinance);
  }, [socket]);

  const fetchFinance = async () => {
    try {
      const res = await api.get('/finance');
      setFinance(res.data.data[0]);
    } catch (error) {
      console.error(error);
    }
  };

  if (!finance) return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 lg:ml-64">
        <Navbar />
        <div className="p-4 lg:p-6 text-center py-12">
          <p className="text-gray-600">No finance records available</p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 lg:ml-64">
        <Navbar />
        <div className="p-4 lg:p-6">
          <h1 className="text-2xl font-bold mb-6">Fee & Finance</h1>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Fee</p>
                  <p className="text-2xl font-bold">₹{finance.totalFee.toLocaleString()}</p>
                </div>
                <DollarSign className="text-blue-600" size={32} />
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Scholarship Discount</p>
                  <p className="text-2xl font-bold text-green-600">-₹{finance.scholarshipDiscount.toLocaleString()}</p>
                </div>
                <Award className="text-green-600" size={32} />
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Final Payable</p>
                  <p className="text-2xl font-bold text-purple-600">₹{finance.finalPayableFee.toLocaleString()}</p>
                </div>
                <CreditCard className="text-purple-600" size={32} />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-lg font-bold mb-4">Payment Summary</h2>
              <div className="space-y-3">
                <div className="flex justify-between py-2 border-b">
                  <span className="text-gray-600">Original Fee</span>
                  <span className="font-semibold">₹{finance.totalFee.toLocaleString()}</span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="text-gray-600">Scholarship Discount</span>
                  <span className="font-semibold text-green-600">-₹{finance.scholarshipDiscount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="text-gray-600">Amount Paid</span>
                  <span className="font-semibold text-blue-600">₹{finance.paidAmount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between py-3 bg-gray-50 px-3 rounded-lg">
                  <span className="font-bold">Pending Amount</span>
                  <span className="font-bold text-red-600">₹{finance.pendingAmount.toLocaleString()}</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-lg font-bold mb-4">Applied Scholarships</h2>
              <div className="space-y-3">
                {finance.scholarships.map((s, i) => (
                  <div key={i} className="p-3 bg-green-50 rounded-lg">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-semibold text-green-800">Scholarship #{i + 1}</p>
                        <p className="text-sm text-gray-600">Applied: {new Date(s.appliedDate).toLocaleDateString()}</p>
                      </div>
                      <p className="text-lg font-bold text-green-600">₹{s.amount.toLocaleString()}</p>
                    </div>
                  </div>
                ))}
                {finance.scholarships.length === 0 && <p className="text-gray-500 text-center py-4">No scholarships applied</p>}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-bold mb-4">Transaction History</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {finance.transactions.map((t, i) => (
                    <tr key={i} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm">{new Date(t.date).toLocaleDateString()}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 text-xs rounded-full ${t.type === 'Payment' ? 'bg-blue-100 text-blue-800' : t.type === 'Scholarship' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                          {t.type}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm">{t.description}</td>
                      <td className="px-4 py-3 text-sm text-right font-semibold">{t.type === 'Scholarship' ? '-' : ''}₹{t.amount.toLocaleString()}</td>
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
};

export default StudentFinance;
