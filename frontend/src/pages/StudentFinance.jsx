import { useState, useEffect } from 'react';
import { DollarSign, Award, CreditCard, Download } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import api from '../services/api';
import { useSocket } from '../context/SocketContext';
import jsPDF from 'jspdf';

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

  const downloadReceipt = () => {
    const doc = new jsPDF();
    const pageW = doc.internal.pageSize.getWidth();
    let y = 20;

    // Header
    doc.setFillColor(79, 70, 229);
    doc.rect(0, 0, pageW, 40, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('FEE & FINANCE RECEIPT', pageW / 2, 18, { align: 'center' });
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Generated: ${new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })}`, pageW / 2, 30, { align: 'center' });

    y = 55;
    doc.setTextColor(30, 30, 30);

    // Summary Section
    doc.setFontSize(13);
    doc.setFont('helvetica', 'bold');
    doc.text('Payment Summary', 14, y);
    y += 6;
    doc.setDrawColor(79, 70, 229);
    doc.setLineWidth(0.5);
    doc.line(14, y, pageW - 14, y);
    y += 8;

    const rows = [
      ['Original Fee', `Rs. ${finance.totalFee.toLocaleString('en-IN')}`, false],
      ['Scholarship Discount', `- Rs. ${finance.scholarshipDiscount.toLocaleString('en-IN')}`, false],
      ['Final Payable Fee', `Rs. ${finance.finalPayableFee.toLocaleString('en-IN')}`, false],
      ['Amount Paid', `Rs. ${finance.paidAmount.toLocaleString('en-IN')}`, false],
      ['Pending Amount', `Rs. ${finance.pendingAmount.toLocaleString('en-IN')}`, true],
    ];

    doc.setFontSize(11);
    rows.forEach(([label, value, highlight]) => {
      if (highlight) {
        doc.setFillColor(254, 242, 242);
        doc.rect(14, y - 5, pageW - 28, 10, 'F');
        doc.setTextColor(185, 28, 28);
        doc.setFont('helvetica', 'bold');
      } else {
        doc.setTextColor(60, 60, 60);
        doc.setFont('helvetica', 'normal');
      }
      doc.text(label, 18, y);
      doc.text(value, pageW - 18, y, { align: 'right' });
      y += 12;
    });

    // Scholarships
    if (finance.scholarships.length > 0) {
      y += 4;
      doc.setTextColor(30, 30, 30);
      doc.setFontSize(13);
      doc.setFont('helvetica', 'bold');
      doc.text('Applied Scholarships', 14, y);
      y += 6;
      doc.setDrawColor(79, 70, 229);
      doc.line(14, y, pageW - 14, y);
      y += 8;

      finance.scholarships.forEach((s, i) => {
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(60, 60, 60);
        doc.text(`Scholarship #${i + 1}`, 18, y);
        doc.text(`Applied: ${new Date(s.appliedDate).toLocaleDateString('en-IN')}`, 80, y);
        doc.setTextColor(21, 128, 61);
        doc.setFont('helvetica', 'bold');
        doc.text(`- Rs. ${s.amount.toLocaleString('en-IN')}`, pageW - 18, y, { align: 'right' });
        y += 10;
      });
    }

    // Transactions
    if (finance.transactions.length > 0) {
      y += 4;
      if (y > 230) { doc.addPage(); y = 20; }
      doc.setTextColor(30, 30, 30);
      doc.setFontSize(13);
      doc.setFont('helvetica', 'bold');
      doc.text('Transaction History', 14, y);
      y += 6;
      doc.setDrawColor(79, 70, 229);
      doc.line(14, y, pageW - 14, y);
      y += 8;

      // Table header
      doc.setFillColor(243, 244, 246);
      doc.rect(14, y - 5, pageW - 28, 9, 'F');
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(80, 80, 80);
      doc.text('DATE', 18, y);
      doc.text('TYPE', 60, y);
      doc.text('DESCRIPTION', 95, y);
      doc.text('AMOUNT', pageW - 18, y, { align: 'right' });
      y += 8;

      finance.transactions.forEach((t) => {
        if (y > 270) { doc.addPage(); y = 20; }
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        doc.setTextColor(60, 60, 60);
        doc.text(new Date(t.date).toLocaleDateString('en-IN'), 18, y);
        doc.text(t.type, 60, y);
        const desc = t.description.length > 30 ? t.description.substring(0, 28) + '...' : t.description;
        doc.text(desc, 95, y);
        const amtPrefix = t.type === 'Scholarship' ? '- Rs. ' : 'Rs. ';
        doc.text(`${amtPrefix}${t.amount.toLocaleString('en-IN')}`, pageW - 18, y, { align: 'right' });
        y += 9;
        doc.setDrawColor(220, 220, 220);
        doc.line(14, y - 3, pageW - 14, y - 3);
      });
    }

    // Footer
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      doc.text('This is a system-generated receipt.', pageW / 2, 290, { align: 'center' });
      doc.text(`Page ${i} of ${pageCount}`, pageW - 14, 290, { align: 'right' });
    }

    doc.save(`finance-receipt-${new Date().toISOString().slice(0, 10)}.pdf`);
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
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold">Fee & Finance</h1>
            <button
              onClick={downloadReceipt}
              className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium"
            >
              <Download size={16} />
              Download Receipt
            </button>
          </div>

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
