import { useState, useEffect } from 'react';
import axios from 'axios';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import { Download } from 'lucide-react';
import jsPDF from 'jspdf';

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

  const downloadFeeReceipt = (fee) => {
    const doc = new jsPDF();
    const pageW = doc.internal.pageSize.getWidth();
    let y = 20;

    // Header
    doc.setFillColor(16, 185, 129);
    doc.rect(0, 0, pageW, 40, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('FEE PAYMENT RECEIPT', pageW / 2, 18, { align: 'center' });
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Generated: ${new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })}`, pageW / 2, 30, { align: 'center' });

    y = 55;
    doc.setTextColor(30, 30, 30);

    // Fee Info
    doc.setFontSize(13);
    doc.setFont('helvetica', 'bold');
    doc.text('Fee Details', 14, y);
    y += 6;
    doc.setDrawColor(16, 185, 129);
    doc.setLineWidth(0.5);
    doc.line(14, y, pageW - 14, y);
    y += 10;

    const infoRows = [
      ['Academic Year', fee.academicYear],
      ['Due Date', new Date(fee.dueDate).toLocaleDateString('en-IN')],
      ['Status', fee.status],
    ];
    doc.setFontSize(11);
    infoRows.forEach(([label, value]) => {
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(80, 80, 80);
      doc.text(label + ':', 18, y);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(30, 30, 30);
      doc.text(value, 70, y);
      y += 10;
    });

    y += 4;
    // Amount Summary
    doc.setFontSize(13);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(30, 30, 30);
    doc.text('Amount Summary', 14, y);
    y += 6;
    doc.setDrawColor(16, 185, 129);
    doc.line(14, y, pageW - 14, y);
    y += 10;

    const dueAmount = fee.dueAmount;
    const amtRows = [
      ['Total Fee Amount', `Rs. ${fee.totalAmount.toLocaleString('en-IN')}`, false],
      ['Amount Paid', `Rs. ${fee.paidAmount.toLocaleString('en-IN')}`, false],
      ['Due Amount', `Rs. ${dueAmount.toLocaleString('en-IN')}`, true],
    ];
    doc.setFontSize(11);
    amtRows.forEach(([label, value, highlight]) => {
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

    // Payment History
    if (fee.payments && fee.payments.length > 0) {
      y += 4;
      doc.setTextColor(30, 30, 30);
      doc.setFontSize(13);
      doc.setFont('helvetica', 'bold');
      doc.text('Payment History', 14, y);
      y += 6;
      doc.setDrawColor(16, 185, 129);
      doc.line(14, y, pageW - 14, y);
      y += 8;

      doc.setFillColor(243, 244, 246);
      doc.rect(14, y - 5, pageW - 28, 9, 'F');
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(80, 80, 80);
      doc.text('DATE', 18, y);
      doc.text('AMOUNT', 65, y);
      doc.text('METHOD', 105, y);
      doc.text('TRANSACTION ID', pageW - 18, y, { align: 'right' });
      y += 8;

      let totalPaid = 0;
      fee.payments.forEach((p) => {
        if (y > 270) { doc.addPage(); y = 20; }
        totalPaid += p.amount;
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        doc.setTextColor(60, 60, 60);
        doc.text(new Date(p.date).toLocaleDateString('en-IN'), 18, y);
        doc.text(`Rs. ${p.amount.toLocaleString('en-IN')}`, 65, y);
        doc.text(p.method || '-', 105, y);
        doc.text(p.transactionId || '-', pageW - 18, y, { align: 'right' });
        y += 9;
        doc.setDrawColor(220, 220, 220);
        doc.line(14, y - 3, pageW - 14, y - 3);
      });

      // Total row
      y += 2;
      doc.setFillColor(220, 252, 231);
      doc.rect(14, y - 5, pageW - 28, 10, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(21, 128, 61);
      doc.text('Total Paid', 18, y);
      doc.text(`Rs. ${totalPaid.toLocaleString('en-IN')}`, 65, y);
    }

    // Footer
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text('This is a system-generated receipt.', pageW / 2, 290, { align: 'center' });

    doc.save(`fee-receipt-${fee.academicYear}-${new Date().toISOString().slice(0, 10)}.pdf`);
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
              <div className="flex items-center gap-2">
                <span className={`px-3 py-1 rounded text-sm h-fit ${fee.status === 'Paid' ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'}`}>
                  {fee.status}
                </span>
                <button
                  onClick={() => downloadFeeReceipt(fee)}
                  className="flex items-center gap-1 bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700 transition-colors"
                >
                  <Download size={14} />
                  Receipt
                </button>
              </div>
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
