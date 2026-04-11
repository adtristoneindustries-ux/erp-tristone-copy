import { useState, useEffect } from 'react';
import axios from 'axios';
import { Building2, Bus, GraduationCap, CheckCircle, XCircle, Clock } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import { Download } from 'lucide-react';
import jsPDF from 'jspdf';

export default function StudentFees() {
  const [fees, setFees] = useState([]);
  const [hasHostel, setHasHostel] = useState(false);
  const [hasTransport, setHasTransport] = useState(false);
  const [hostelDetails, setHostelDetails] = useState(null);
  const [transportDetails, setTransportDetails] = useState(null);

  useEffect(() => {
    fetchFees();
  }, []);

  const fetchFees = async () => {
    try {
      const { data } = await axios.get('http://localhost:5000/api/fees/my-fees', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setFees(data.fees || []);
      setHasHostel(data.hasHostel);
      setHasTransport(data.hasTransport);
      setHostelDetails(data.hostelDetails);
      setTransportDetails(data.transportDetails);
    } catch (error) {
      console.error('Error fetching fees:', error);
    }
  };

  const getFeeByType = (type) => fees.find(f => f.feeType === type);
  const tuitionFee = getFeeByType('Tuition');
  const hostelFee = getFeeByType('Hostel');
  const transportFee = getFeeByType('Transport');

  const totalFees = fees.reduce((a, b) => a + b.totalAmount, 0);
  const totalPaid = fees.reduce((a, b) => a + b.paidAmount, 0);
  const totalDue = fees.reduce((a, b) => a + b.dueAmount, 0);

  const FeeCard = ({ fee, icon: Icon, title, color, showDetails = true }) => {
    if (!fee) {
      return (
        <div className="bg-white rounded-lg shadow p-4 sm:p-6">
          <div className="flex items-center gap-2 sm:gap-3 mb-4">
            <div className={`p-2 sm:p-3 rounded-full ${color}`}>
              <Icon size={20} className="text-white sm:w-6 sm:h-6" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold">{title}</h3>
              <p className="text-xs sm:text-sm text-gray-500">Not Applicable</p>
            </div>
          </div>
          <div className="text-center py-4">
            <p className="text-sm text-gray-400">No {title.toLowerCase()} fee assigned</p>
          </div>
        </div>
      );
    }

    return (
      <div className="bg-white rounded-lg shadow p-3 sm:p-4 md:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-3 mb-3 sm:mb-4">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className={`p-2 sm:p-3 rounded-full ${color}`}>
              <Icon size={18} className="text-white sm:w-5 sm:h-5 md:w-6 md:h-6" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base md:text-lg font-bold">{title}</h3>
              <p className="text-xs sm:text-sm text-gray-500">{fee.academicYear}</p>
            </div>
          </div>
          <span className={`px-2 sm:px-3 py-1 rounded-full text-xs font-semibold self-start ${
            fee.status === 'Paid' ? 'bg-green-100 text-green-800' : 
            fee.status === 'Overdue' ? 'bg-red-100 text-red-800' : 
            'bg-orange-100 text-orange-800'
          }`}>
            {fee.status}
          </span>
        </div>

        <div className="grid grid-cols-3 gap-2 sm:gap-3 md:gap-4 mb-3 sm:mb-4">
          <div>
            <p className="text-[10px] sm:text-xs text-gray-500 mb-1">Total Amount</p>
            <p className="text-xs sm:text-sm md:text-lg font-bold break-words">₹{fee.totalAmount.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-[10px] sm:text-xs text-gray-500 mb-1">Paid</p>
            <p className="text-xs sm:text-sm md:text-lg font-bold text-green-600 break-words">₹{fee.paidAmount.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-[10px] sm:text-xs text-gray-500 mb-1">Due</p>
            <p className="text-xs sm:text-sm md:text-lg font-bold text-red-600 break-words">₹{fee.dueAmount.toLocaleString()}</p>
          </div>
        </div>

        {showDetails && fee.components && fee.components.length > 0 && (
          <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t">
            <h4 className="font-semibold mb-2 text-xs sm:text-sm">Fee Components</h4>
            <div className="space-y-2">
              {fee.components.map((comp, idx) => (
                <div key={idx} className="flex justify-between text-xs sm:text-sm bg-gray-50 p-2 sm:p-3 rounded">
                  <span className="text-gray-700">{comp.name}</span>
                  <span className="font-semibold">₹{comp.amount.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>
        )}
        {showDetails && !fee.fromStructure && fee.payments && fee.payments.length > 0 && (
          <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t">
            <h4 className="font-semibold mb-2 text-xs sm:text-sm">Payment History</h4>
            <div className="space-y-2">
              {fee.payments.map((payment, idx) => (
                <div key={idx} className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 text-xs sm:text-sm bg-gray-50 p-2 sm:p-3 rounded">
                  <div className="min-w-0 flex-1">
                    <p className="font-medium">₹{payment.amount.toLocaleString()}</p>
                    <p className="text-[10px] sm:text-xs text-gray-500">{new Date(payment.date).toLocaleDateString()}</p>
                  </div>
                  <span className={`px-2 py-1 rounded text-[10px] sm:text-xs font-semibold self-start sm:ml-2 whitespace-nowrap ${
                    payment.paymentMethod === 'Online' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {payment.paymentMethod}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
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
        <div className="p-3 sm:p-4 md:p-6 lg:p-8">
          <h1 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold mb-3 sm:mb-4 md:mb-6">Fee Management</h1>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3 md:gap-4 mb-3 sm:mb-4 md:mb-6">
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-3 sm:p-4 md:p-5 lg:p-6 rounded-lg shadow-md">
              <h3 className="text-[10px] sm:text-xs md:text-sm opacity-90 mb-0.5 sm:mb-1">Total Fees</h3>
              <p className="text-base sm:text-lg md:text-xl lg:text-2xl xl:text-3xl font-bold break-words">₹{totalFees.toLocaleString()}</p>
            </div>
            <div className="bg-gradient-to-br from-green-500 to-green-600 text-white p-3 sm:p-4 md:p-5 lg:p-6 rounded-lg shadow-md">
              <h3 className="text-[10px] sm:text-xs md:text-sm opacity-90 mb-0.5 sm:mb-1">Paid Amount</h3>
              <p className="text-base sm:text-lg md:text-xl lg:text-2xl xl:text-3xl font-bold break-words">₹{totalPaid.toLocaleString()}</p>
            </div>
            <div className="bg-gradient-to-br from-red-500 to-red-600 text-white p-3 sm:p-4 md:p-5 lg:p-6 rounded-lg shadow-md">
              <h3 className="text-[10px] sm:text-xs md:text-sm opacity-90 mb-0.5 sm:mb-1">Pending Amount</h3>
              <p className="text-base sm:text-lg md:text-xl lg:text-2xl xl:text-3xl font-bold break-words">₹{totalDue.toLocaleString()}</p>
            </div>
          </div>

          {/* Fee Type Cards */}
          <div className="space-y-3 sm:space-y-4 md:space-y-5 lg:space-y-6">
            <FeeCard 
              fee={tuitionFee} 
              icon={GraduationCap} 
              title="Tuition Fee" 
              color="bg-blue-500"
            />
            
            <FeeCard 
              fee={hostelFee} 
              icon={Building2} 
              title="Hostel Fee" 
              color="bg-purple-500"
            />
            
            <FeeCard 
              fee={transportFee} 
              icon={Bus} 
              title="Transport Fee" 
              color="bg-green-500"
            />
          </div>

          {/* Hostel Details */}
          {hasHostel && hostelDetails && (
            <div className="mt-3 sm:mt-4 md:mt-5 lg:mt-6 bg-white rounded-lg shadow p-3 sm:p-4 md:p-5 lg:p-6">
              <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                <Building2 className="text-purple-600" size={18} />
                <h2 className="text-sm sm:text-base md:text-lg lg:text-xl font-bold">Hostel Details</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 md:gap-4">
                <div className="space-y-0.5 sm:space-y-1">
                  <p className="text-[10px] sm:text-xs md:text-sm text-gray-500">Hostel Name</p>
                  <p className="text-xs sm:text-sm md:text-base font-semibold break-words">{hostelDetails.hostelName}</p>
                </div>
                <div className="space-y-0.5 sm:space-y-1">
                  <p className="text-[10px] sm:text-xs md:text-sm text-gray-500">Room Number</p>
                  <p className="text-xs sm:text-sm md:text-base font-semibold">{hostelDetails.roomNumber}</p>
                </div>
                <div className="space-y-0.5 sm:space-y-1">
                  <p className="text-[10px] sm:text-xs md:text-sm text-gray-500">Room Type</p>
                  <p className="text-xs sm:text-sm md:text-base font-semibold">{hostelDetails.roomType}</p>
                </div>
                <div className="space-y-0.5 sm:space-y-1">
                  <p className="text-[10px] sm:text-xs md:text-sm text-gray-500">Warden</p>
                  <p className="text-xs sm:text-sm md:text-base font-semibold break-words">{hostelDetails.wardenName}</p>
                </div>
              </div>
            </div>
          )}

          {/* Transport Details */}
          {hasTransport && transportDetails && transportDetails.route && (
            <div className="mt-3 sm:mt-4 md:mt-5 lg:mt-6 bg-white rounded-lg shadow p-3 sm:p-4 md:p-5 lg:p-6">
              <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                <Bus className="text-green-600" size={18} />
                <h2 className="text-sm sm:text-base md:text-lg lg:text-xl font-bold">Transport Details</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 md:gap-4">
                <div className="space-y-0.5 sm:space-y-1">
                  <p className="text-[10px] sm:text-xs md:text-sm text-gray-500">Route Number</p>
                  <p className="text-xs sm:text-sm md:text-base font-semibold">{transportDetails.route.routeNumber}</p>
                </div>
                <div className="space-y-0.5 sm:space-y-1">
                  <p className="text-[10px] sm:text-xs md:text-sm text-gray-500">Bus Number</p>
                  <p className="text-xs sm:text-sm md:text-base font-semibold">{transportDetails.route.busNumber}</p>
                </div>
                <div className="space-y-0.5 sm:space-y-1">
                  <p className="text-[10px] sm:text-xs md:text-sm text-gray-500">Pickup Point</p>
                  <p className="text-xs sm:text-sm md:text-base font-semibold break-words">{transportDetails.route.pickupPoint}</p>
                </div>
                <div className="space-y-0.5 sm:space-y-1">
                  <p className="text-[10px] sm:text-xs md:text-sm text-gray-500">Pickup Time</p>
                  <p className="text-xs sm:text-sm md:text-base font-semibold">{transportDetails.route.pickupTime}</p>
                </div>
                <div className="space-y-0.5 sm:space-y-1">
                  <p className="text-[10px] sm:text-xs md:text-sm text-gray-500">Driver Name</p>
                  <p className="text-xs sm:text-sm md:text-base font-semibold break-words">{transportDetails.route.driverName}</p>
                </div>
                <div className="space-y-0.5 sm:space-y-1">
                  <p className="text-[10px] sm:text-xs md:text-sm text-gray-500">Driver Contact</p>
                  <p className="text-xs sm:text-sm md:text-base font-semibold">{transportDetails.route.driverContact}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
