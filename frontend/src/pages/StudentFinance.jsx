import { useState, useEffect } from 'react';
import { DollarSign, Award, CreditCard, Receipt, Calendar, User, AlertCircle, Download } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import api from '../services/api';
import { useSocket } from '../context/SocketContext';
import jsPDF from 'jspdf';

const StudentFinance = () => {
  const [finance, setFinance] = useState(null);
  const [feeStructure, setFeeStructure] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showPayModal, setShowPayModal] = useState(false);
  const [payAmount, setPayAmount] = useState('');
  const [payMethod, setPayMethod] = useState('Online');
  const [paying, setPaying] = useState(false);
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
      const userData = userRes.data;
      setFinance(financeData);

      // Match fee structure by student class
      const userClass = userData?.class;
      if (userClass) {
        const classBase = userClass.split('-')[0];
        const match = structureRes.data.data.find(s =>
          s.class === classBase || s.class === userClass
        );
        setFeeStructure(match || null);

        // If no finance record exists, auto-create from fee structure
        if (!financeData && match) {
          try {
            await api.post('/finance/auto-assign', { studentId: userData.id || userData._id });
            const refreshed = await api.get('/finance');
            setFinance(refreshed.data.data[0] || null);
          } catch (e) {
            // auto-assign not available, show structure only
          }
        }
      }
      setLoading(false);
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };

  const handleSimplePayment = () => {
    setPayAmount(finance?.pendingAmount || '');
    setShowPayModal(true);
  };

  const handlePaySubmit = async (e) => {
    e.preventDefault();
    if (!payAmount || payAmount <= 0) return;
    setPaying(true);
    try {
      await api.post('/finance/record-payment', {
        financeId: finance._id,
        amount: Number(payAmount),
        description: `${payMethod} Payment`,
        paymentMethod: payMethod
      });
      setShowPayModal(false);
      fetchFinance();
    } catch (error) {
      alert('Payment failed. Please try again.');
    } finally {
      setPaying(false);
    }
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
        <div className="p-4 lg:p-6">
          {feeStructure ? (
            <div>
              <h1 className="text-xl sm:text-2xl font-bold mb-4">Fee &amp; Finance</h1>
              <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 mb-4">
                <h2 className="text-base font-bold mb-3 flex items-center gap-2">
                  <Receipt className="text-blue-600" size={18} />
                  Fee Structure - Class {feeStructure.class}
                </h2>
                <div className="space-y-2 mb-4">
                  {feeStructure.components.map((comp, i) => (
                    <div key={i} className="flex justify-between text-sm bg-gray-50 p-3 rounded">
                      <span className="text-gray-700">{comp.name}</span>
                      <span className="font-semibold">₹{comp.amount.toLocaleString()}</span>
                    </div>
                  ))}
                  <div className="flex justify-between text-sm bg-blue-50 p-3 rounded border-2 border-blue-200">
                    <span className="font-bold text-blue-800">Total Fee</span>
                    <span className="font-bold text-blue-600">₹{feeStructure.totalAmount.toLocaleString()}</span>
                  </div>
                </div>
                <p className="text-sm text-amber-600 flex items-center gap-2">
                  <AlertCircle size={16} />
                  Finance record is being processed. Please contact administration.
                </p>
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <Receipt size={64} className="mx-auto text-gray-300 mb-4" />
              <p className="text-gray-600 text-lg">No finance records available</p>
              <p className="text-gray-500 text-sm mt-2">Please contact administration for fee structure setup</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 lg:ml-64">
        <Navbar />
        <div className="p-3 sm:p-4 lg:p-6">

          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 sm:mb-6 gap-3">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold">Fee & Finance</h1>
              <p className="text-sm text-gray-600">Academic Year: {finance.academicYear}</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleDownloadReceipt}
                className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm"
              >
                <Download size={15} />
                Receipt
              </button>
              {finance.pendingAmount > 0 && (
                <button
                  onClick={handleSimplePayment}
                  className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                >
                  <CreditCard size={15} />
                  Pay Now
                </button>
              )}
            </div>
          </div>

          {/* Fee Structure */}
          {feeStructure ? (
            <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 mb-4 sm:mb-6">
              <h2 className="text-sm sm:text-base font-bold mb-3 flex items-center gap-2">
                <Receipt className="text-blue-600" size={18} />
                Fee Structure - Class {feeStructure.class}
              </h2>
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h3 className="font-semibold text-gray-800 text-sm mb-2">Fee Components</h3>
                  {feeStructure.components.map((component, index) => (
                    <div key={index} className="flex justify-between items-center py-2 px-3 bg-gray-50 rounded-lg gap-2">
                      <span className="text-gray-700 font-medium text-sm">{component.name}</span>
                      <span className="font-bold text-gray-900 text-sm whitespace-nowrap">₹{component.amount.toLocaleString()}</span>
                    </div>
                  ))}
                  <div className="flex justify-between items-center py-3 px-3 bg-blue-50 rounded-lg border-2 border-blue-200 gap-2">
                    <span className="font-bold text-sm text-blue-800">Total Fee</span>
                    <span className="font-bold text-base text-blue-600 whitespace-nowrap">₹{feeStructure.totalAmount.toLocaleString()}</span>
                  </div>
                </div>
                <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-lg p-4 border border-purple-200">
                  <h3 className="font-semibold mb-3 text-purple-800 flex items-center gap-2 text-sm">
                    <DollarSign size={16} />
                    Payment Summary
                  </h3>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center py-1 gap-2">
                      <span className="text-gray-700 text-sm">Original Fee:</span>
                      <span className="font-semibold text-gray-900 text-sm whitespace-nowrap">₹{finance.totalFee.toLocaleString()}</span>
                    </div>
                    {finance.scholarshipDiscount > 0 && (
                      <div className="flex justify-between items-center py-1 bg-green-50 px-2 rounded gap-2">
                        <span className="text-green-700 flex items-center gap-1 text-sm">
                          <Award size={13} />Scholarship:
                        </span>
                        <span className="font-semibold text-green-600 text-sm whitespace-nowrap">-₹{finance.scholarshipDiscount.toLocaleString()}</span>
                      </div>
                    )}
                    <div className="flex justify-between items-center py-1 border-t border-purple-200 gap-2">
                      <span className="font-semibold text-purple-700 text-sm">Final Payable:</span>
                      <span className="font-bold text-purple-600 text-sm whitespace-nowrap">₹{finance.finalPayableFee.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center py-1 gap-2">
                      <span className="text-gray-700 text-sm">Amount Paid:</span>
                      <span className="font-semibold text-blue-600 text-sm whitespace-nowrap">₹{finance.paidAmount.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 bg-white px-3 rounded-lg border-2 border-gray-200 gap-2">
                      <span className="font-bold text-gray-800 text-sm">Pending:</span>
                      <span className={`font-bold text-sm whitespace-nowrap ${finance.pendingAmount > 0 ? 'text-red-600' : 'text-green-600'}`}>
                        ₹{finance.pendingAmount.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 mb-4 sm:mb-6">
              <div className="flex items-center gap-2 text-amber-600 mb-3">
                <AlertCircle size={20} />
                <h2 className="text-base font-bold">Fee Structure Not Available</h2>
              </div>
              <p className="text-gray-600 text-sm">The detailed fee structure for your class is not available. Please contact the administration.</p>
            </div>
          )}

          {/* Summary Cards */}
          <div className="grid grid-cols-3 gap-2 sm:gap-4 lg:gap-6 mb-4 sm:mb-6">
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-lg p-3 sm:p-4 lg:p-6 text-white">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                <div className="min-w-0">
                  <p className="text-blue-100 text-[9px] sm:text-xs lg:text-sm leading-tight">Total Fee</p>
                  <p className="text-xs sm:text-lg lg:text-2xl font-bold truncate">₹{finance.totalFee.toLocaleString()}</p>
                </div>
                <DollarSign size={16} className="sm:w-6 sm:h-6 lg:w-8 lg:h-8 opacity-80 flex-shrink-0 hidden sm:block" />
              </div>
            </div>
            <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow-lg p-3 sm:p-4 lg:p-6 text-white">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                <div className="min-w-0">
                  <p className="text-green-100 text-[9px] sm:text-xs lg:text-sm leading-tight">Scholarship</p>
                  <p className="text-xs sm:text-lg lg:text-2xl font-bold truncate">₹{finance.scholarshipDiscount.toLocaleString()}</p>
                </div>
                <Award size={16} className="sm:w-6 sm:h-6 lg:w-8 lg:h-8 opacity-80 flex-shrink-0 hidden sm:block" />
              </div>
            </div>
            <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg shadow-lg p-3 sm:p-4 lg:p-6 text-white">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                <div className="min-w-0">
                  <p className="text-purple-100 text-[9px] sm:text-xs lg:text-sm leading-tight">Final Payable</p>
                  <p className="text-xs sm:text-lg lg:text-2xl font-bold truncate">₹{finance.finalPayableFee.toLocaleString()}</p>
                </div>
                <CreditCard size={16} className="sm:w-6 sm:h-6 lg:w-8 lg:h-8 opacity-80 flex-shrink-0 hidden sm:block" />
              </div>
            </div>
          </div>

          {/* Payment Status + Scholarships */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6 mb-4 sm:mb-6">
            <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
              <h2 className="text-sm sm:text-base font-bold mb-3 flex items-center gap-2">
                <User className="text-green-600 w-4 h-4" />
                Payment Status
              </h2>
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg gap-2">
                  <div>
                    <p className="font-semibold text-blue-800 text-sm">Amount Paid</p>
                    <p className="text-xs text-blue-600">Successfully processed</p>
                  </div>
                  <p className="text-base sm:text-xl font-bold text-blue-600 whitespace-nowrap">₹{finance.paidAmount.toLocaleString()}</p>
                </div>
                <div className={`flex justify-between items-center p-3 rounded-lg gap-2 ${finance.pendingAmount > 0 ? 'bg-red-50' : 'bg-green-50'}`}>
                  <div>
                    <p className={`font-semibold text-sm ${finance.pendingAmount > 0 ? 'text-red-800' : 'text-green-800'}`}>
                      {finance.pendingAmount > 0 ? 'Pending' : 'Fully Paid'}
                    </p>
                    <p className={`text-xs ${finance.pendingAmount > 0 ? 'text-red-600' : 'text-green-600'}`}>
                      {finance.pendingAmount > 0 ? 'Payment required' : 'All fees cleared'}
                    </p>
                  </div>
                  <p className={`text-base sm:text-xl font-bold whitespace-nowrap ${finance.pendingAmount > 0 ? 'text-red-600' : 'text-green-600'}`}>
                    ₹{finance.pendingAmount.toLocaleString()}
                  </p>
                </div>
                {finance.pendingAmount > 0 && (
                  <button
                    onClick={handleSimplePayment}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                  >
                    <CreditCard size={15} />Pay Now
                  </button>
                )}
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
              <h2 className="text-sm sm:text-base font-bold mb-3 flex items-center gap-2">
                <Award className="text-green-600 w-4 h-4" />
                Applied Scholarships
              </h2>
              <div className="space-y-2">
                {finance.scholarships && finance.scholarships.length > 0 ? (
                  finance.scholarships.map((s, i) => (
                    <div key={i} className="p-3 bg-green-50 rounded-lg border border-green-200">
                      <div className="flex justify-between items-start gap-2">
                        <div>
                          <p className="font-semibold text-green-800 text-sm">Scholarship #{i + 1}</p>
                          <p className="text-xs text-gray-600">Applied: {new Date(s.appliedDate).toLocaleDateString()}</p>
                          <p className="text-xs text-green-600 mt-1">Status: Approved</p>
                        </div>
                        <p className="text-sm font-bold text-green-600 whitespace-nowrap">₹{s.amount.toLocaleString()}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <Award size={32} className="mx-auto text-gray-300 mb-2" />
                    <p className="text-gray-500 text-sm">No scholarships applied</p>
                    <p className="text-xs text-gray-400 mt-1">Contact administration for scholarship opportunities</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Transaction History */}
          <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
            <h2 className="text-sm sm:text-base font-bold mb-3 flex items-center gap-2">
              <Calendar className="text-purple-600 w-4 h-4" />
              Transaction History
            </h2>

            {/* Mobile: card layout */}
            <div className="sm:hidden space-y-3">
              {finance.transactions && finance.transactions.length > 0 ? (
                finance.transactions.map((t, i) => (
                  <div key={i} className="border border-gray-200 rounded-lg p-3 bg-gray-50">
                    <div className="flex justify-between items-center mb-2">
                      <span className={`px-2 py-0.5 text-xs rounded-full font-medium ${
                        t.type === 'Payment' ? 'bg-blue-100 text-blue-800' :
                        t.type === 'Scholarship' ? 'bg-green-100 text-green-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>{t.type}</span>
                      <span className="font-bold text-sm">
                        {t.type === 'Scholarship' ? '-' : ''}₹{t.amount.toLocaleString()}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mb-1">{new Date(t.date).toLocaleDateString()}</p>
                    {t.description && <p className="text-xs text-gray-700 mb-1">{t.description}</p>}
                    <span className={`px-2 py-0.5 text-xs rounded-full ${
                      t.paymentMethod === 'Online' ? 'bg-green-100 text-green-800' :
                      t.paymentMethod === 'Offline' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>{t.paymentMethod || 'N/A'}</span>
                  </div>
                ))
              ) : (
                <p className="text-center text-gray-500 text-sm py-6">No transactions found</p>
              )}
            </div>

            {/* Desktop: table layout */}
            <div className="hidden sm:block overflow-x-auto">
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
                        <td className="px-4 py-3 text-sm whitespace-nowrap">{new Date(t.date).toLocaleDateString()}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            t.type === 'Payment' ? 'bg-blue-100 text-blue-800' :
                            t.type === 'Scholarship' ? 'bg-green-100 text-green-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>{t.type}</span>
                        </td>
                        <td className="px-4 py-3 text-sm">{t.description}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            t.paymentMethod === 'Online' ? 'bg-green-100 text-green-800' :
                            t.paymentMethod === 'Offline' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>{t.paymentMethod || 'N/A'}</span>
                        </td>
                        <td className="px-4 py-3 text-sm text-right font-semibold whitespace-nowrap">
                          {t.type === 'Scholarship' ? '-' : ''}₹{t.amount.toLocaleString()}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" className="px-4 py-8 text-center text-gray-500 text-sm">No transactions found</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </div>

      {/* Pay Modal */}
      {showPayModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6">
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
              <CreditCard className="text-blue-600" size={20} />
              Make Payment
            </h2>
            <form onSubmit={handlePaySubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Amount (₹)</label>
                <input
                  type="number"
                  min="1"
                  max={finance?.pendingAmount}
                  value={payAmount}
                  onChange={e => setPayAmount(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">Pending: ₹{finance?.pendingAmount?.toLocaleString()}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method</label>
                <select
                  value={payMethod}
                  onChange={e => setPayMethod(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  <option value="Online">Online</option>
                  <option value="Offline">Offline</option>
                  <option value="Cash">Cash</option>
                  <option value="Bank Transfer">Bank Transfer</option>
                  <option value="UPI">UPI</option>
                  <option value="Card">Card</option>
                </select>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowPayModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">
                  Cancel
                </button>
                <button type="submit" disabled={paying}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">
                  {paying ? 'Processing...' : 'Pay Now'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentFinance;
