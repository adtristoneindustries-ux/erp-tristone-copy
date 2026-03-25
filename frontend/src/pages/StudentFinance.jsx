import { useState, useEffect } from 'react';
import { DollarSign, Award, CreditCard, Receipt, Calendar, User, AlertCircle, Download } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import api from '../services/api';
import { useSocket } from '../context/SocketContext';

const StudentFinance = () => {
  const [finance, setFinance] = useState(null);
  const [feeStructure, setFeeStructure] = useState(null);
  const [loading, setLoading] = useState(true);
  const socket = useSocket();

  useEffect(() => {
    fetchFinance();
    if (socket) socket.on('financeUpdate', fetchFinance);
  }, [socket]);

  const fetchFinance = async () => {
    try {
      const [financeRes, structureRes, userRes] = await Promise.all([
        api.get('/finance'),
        api.get('/finance/fee-structure'),
        api.get('/auth/me')
      ]);
      
      const financeData = financeRes.data.data[0];
      setFinance(financeData);
      
      if (financeData && userRes.data.user && userRes.data.user.class) {
        const userClass = userRes.data.user.class.split('-')[0]; // Get class without section
        const matchingStructure = structureRes.data.data.find(s => 
          s.class === userClass && s.academicYear === financeData.academicYear
        );
        setFeeStructure(matchingStructure);
      }
      setLoading(false);
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };

  const handleSimplePayment = () => {
    alert('Payment feature will be integrated with your preferred payment gateway. Please contact administration for payment.');
  };

  const handleDownloadReceipt = async () => {
    try {
      const response = await api.get(`/finance/receipt/${finance._id}`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `receipt-${new Date().getTime()}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      alert('Failed to download receipt. Please try again.');
    }
  };

  if (loading) return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 lg:ml-64">
        <Navbar />
        <div className="p-4 lg:p-6 text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading finance details...</p>
        </div>
      </div>
    </div>
  );

  if (!finance) return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 lg:ml-64">
        <Navbar />
        <div className="p-4 lg:p-6 text-center py-12">
          <Receipt size={64} className="mx-auto text-gray-300 mb-4" />
          <p className="text-gray-600 text-lg">No finance records available</p>
          <p className="text-gray-500 text-sm mt-2">Please contact administration for fee structure setup</p>
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
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-2xl font-bold">Fee & Finance</h1>
              <p className="text-gray-600">Academic Year: {finance.academicYear}</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleDownloadReceipt}
                className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 shadow-lg"
              >
                <Download size={20} />
                Download Receipt
              </button>
              {finance.pendingAmount > 0 && (
                <button
                  onClick={handleSimplePayment}
                  className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-lg"
                >
                  <CreditCard size={20} />
                  Pay Now ₹{finance.pendingAmount.toLocaleString()}
                </button>
              )}
            </div>
          </div>

          {/* Fee Structure Display */}
          {feeStructure ? (
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                <Receipt className="text-blue-600" size={24} />
                Fee Structure - Class {feeStructure.class}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <h3 className="font-semibold text-gray-800 mb-3">Fee Components</h3>
                  {feeStructure.components.map((component, index) => (
                    <div key={index} className="flex justify-between items-center py-3 px-4 bg-gray-50 rounded-lg">
                      <span className="text-gray-700 font-medium">{component.name}</span>
                      <span className="font-bold text-gray-900">₹{component.amount.toLocaleString()}</span>
                    </div>
                  ))}
                  <div className="flex justify-between items-center py-4 px-4 bg-blue-50 rounded-lg border-2 border-blue-200">
                    <span className="font-bold text-lg text-blue-800">Total Fee</span>
                    <span className="font-bold text-xl text-blue-600">₹{feeStructure.totalAmount.toLocaleString()}</span>
                  </div>
                </div>
                <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-lg p-6 border border-purple-200">
                  <h3 className="font-semibold mb-4 text-purple-800 flex items-center gap-2">
                    <DollarSign size={20} />
                    Payment Summary
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center py-2">
                      <span className="text-gray-700">Original Fee:</span>
                      <span className="font-semibold text-gray-900">₹{finance.totalFee.toLocaleString()}</span>
                    </div>
                    {finance.scholarshipDiscount > 0 && (
                      <div className="flex justify-between items-center py-2 bg-green-50 px-3 rounded">
                        <span className="text-green-700 flex items-center gap-1">
                          <Award size={16} />
                          Scholarship Discount:
                        </span>
                        <span className="font-semibold text-green-600">-₹{finance.scholarshipDiscount.toLocaleString()}</span>
                      </div>
                    )}
                    <div className="flex justify-between items-center py-2 border-t border-purple-200">
                      <span className="font-semibold text-purple-700">Final Payable:</span>
                      <span className="font-bold text-purple-600">₹{finance.finalPayableFee.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center py-2">
                      <span className="text-gray-700">Amount Paid:</span>
                      <span className="font-semibold text-blue-600">₹{finance.paidAmount.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center py-3 bg-white px-4 rounded-lg border-2 border-gray-200">
                      <span className="font-bold text-gray-800">Pending Amount:</span>
                      <span className={`font-bold text-lg ${
                        finance.pendingAmount > 0 ? 'text-red-600' : 'text-green-600'
                      }`}>
                        ₹{finance.pendingAmount.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <div className="flex items-center gap-3 text-amber-600 mb-4">
                <AlertCircle size={24} />
                <h2 className="text-lg font-bold">Fee Structure Not Available</h2>
              </div>
              <p className="text-gray-600">The detailed fee structure for your class is not available. Please contact the administration.</p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-lg p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm">Total Fee</p>
                  <p className="text-2xl font-bold">₹{finance.totalFee.toLocaleString()}</p>
                </div>
                <DollarSign size={32} className="opacity-80" />
              </div>
            </div>
            <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow-lg p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm">Scholarship Discount</p>
                  <p className="text-2xl font-bold">₹{finance.scholarshipDiscount.toLocaleString()}</p>
                </div>
                <Award size={32} className="opacity-80" />
              </div>
            </div>
            <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg shadow-lg p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm">Final Payable</p>
                  <p className="text-2xl font-bold">₹{finance.finalPayableFee.toLocaleString()}</p>
                </div>
                <CreditCard size={32} className="opacity-80" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                <User className="text-green-600" size={20} />
                Payment Status
              </h2>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-4 bg-blue-50 rounded-lg">
                  <div>
                    <p className="font-semibold text-blue-800">Amount Paid</p>
                    <p className="text-sm text-blue-600">Successfully processed</p>
                  </div>
                  <p className="text-2xl font-bold text-blue-600">₹{finance.paidAmount.toLocaleString()}</p>
                </div>
                <div className={`flex justify-between items-center p-4 rounded-lg ${
                  finance.pendingAmount > 0 ? 'bg-red-50' : 'bg-green-50'
                }`}>
                  <div>
                    <p className={`font-semibold ${
                      finance.pendingAmount > 0 ? 'text-red-800' : 'text-green-800'
                    }`}>
                      {finance.pendingAmount > 0 ? 'Pending Amount' : 'Fully Paid'}
                    </p>
                    <p className={`text-sm ${
                      finance.pendingAmount > 0 ? 'text-red-600' : 'text-green-600'
                    }`}>
                      {finance.pendingAmount > 0 ? 'Payment required' : 'All fees cleared'}
                    </p>
                  </div>
                  <p className={`text-2xl font-bold ${
                    finance.pendingAmount > 0 ? 'text-red-600' : 'text-green-600'
                  }`}>
                    ₹{finance.pendingAmount.toLocaleString()}
                  </p>
                </div>
                {finance.pendingAmount > 0 && (
                  <button
                    onClick={handleSimplePayment}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    <CreditCard size={18} />
                    Pay Now
                  </button>
                )}
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                <Award className="text-green-600" size={20} />
                Applied Scholarships
              </h2>
              <div className="space-y-3">
                {finance.scholarships && finance.scholarships.length > 0 ? (
                  finance.scholarships.map((s, i) => (
                    <div key={i} className="p-4 bg-green-50 rounded-lg border border-green-200">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-semibold text-green-800">Scholarship #{i + 1}</p>
                          <p className="text-sm text-gray-600">Applied: {new Date(s.appliedDate).toLocaleDateString()}</p>
                          <p className="text-xs text-green-600 mt-1">Status: Approved</p>
                        </div>
                        <p className="text-lg font-bold text-green-600">₹{s.amount.toLocaleString()}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <Award size={48} className="mx-auto text-gray-300 mb-3" />
                    <p className="text-gray-500">No scholarships applied</p>
                    <p className="text-sm text-gray-400 mt-1">Contact administration for scholarship opportunities</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
              <Calendar className="text-purple-600" size={20} />
              Transaction History
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Method</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {finance.transactions && finance.transactions.length > 0 ? (
                    finance.transactions.map((t, i) => (
                      <tr key={i} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm">{new Date(t.date).toLocaleDateString()}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            t.type === 'Payment' ? 'bg-blue-100 text-blue-800' : 
                            t.type === 'Scholarship' ? 'bg-green-100 text-green-800' : 
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {t.type}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm">{t.description}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            t.paymentMethod === 'Online' ? 'bg-green-100 text-green-800' : 
                            t.paymentMethod === 'Offline' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {t.paymentMethod || 'N/A'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-right font-semibold">
                          {t.type === 'Scholarship' ? '-' : ''}₹{t.amount.toLocaleString()}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" className="px-4 py-8 text-center text-gray-500">
                        No transactions found
                      </td>
                    </tr>
                  )}
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
