import { useState, useEffect } from 'react';
import axios from 'axios';
import { Building2, Bus, GraduationCap, CheckCircle, XCircle, Clock } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';

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
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className={`p-3 rounded-full ${color}`}>
              <Icon size={24} className="text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold">{title}</h3>
              <p className="text-sm text-gray-500">Not Applicable</p>
            </div>
          </div>
          <div className="text-center py-4">
            <p className="text-gray-400">No {title.toLowerCase()} fee assigned</p>
          </div>
        </div>
      );
    }

    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={`p-3 rounded-full ${color}`}>
              <Icon size={24} className="text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold">{title}</h3>
              <p className="text-sm text-gray-500">{fee.academicYear}</p>
            </div>
          </div>
          <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
            fee.status === 'Paid' ? 'bg-green-100 text-green-800' : 
            fee.status === 'Overdue' ? 'bg-red-100 text-red-800' : 
            'bg-orange-100 text-orange-800'
          }`}>
            {fee.status}
          </span>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-4">
          <div>
            <p className="text-xs text-gray-500">Total Amount</p>
            <p className="text-lg font-bold">₹{fee.totalAmount.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Paid</p>
            <p className="text-lg font-bold text-green-600">₹{fee.paidAmount.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Due</p>
            <p className="text-lg font-bold text-red-600">₹{fee.dueAmount.toLocaleString()}</p>
          </div>
        </div>

        {showDetails && fee.payments.length > 0 && (
          <div className="mt-4 pt-4 border-t">
            <h4 className="font-semibold mb-2 text-sm">Payment History</h4>
            <div className="space-y-2">
              {fee.payments.map((payment, idx) => (
                <div key={idx} className="flex justify-between items-center text-sm bg-gray-50 p-2 rounded">
                  <div>
                    <p className="font-medium">₹{payment.amount.toLocaleString()}</p>
                    <p className="text-xs text-gray-500">{new Date(payment.date).toLocaleDateString()}</p>
                  </div>
                  <span className={`px-2 py-1 rounded text-xs font-semibold ${
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

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 lg:ml-64">
        <Navbar />
        <div className="p-4 md:p-6">
          <h1 className="text-2xl md:text-3xl font-bold mb-6">Fee Management</h1>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-6 rounded-lg shadow">
              <h3 className="text-sm opacity-90 mb-1">Total Fees</h3>
              <p className="text-3xl font-bold">₹{totalFees.toLocaleString()}</p>
            </div>
            <div className="bg-gradient-to-br from-green-500 to-green-600 text-white p-6 rounded-lg shadow">
              <h3 className="text-sm opacity-90 mb-1">Paid Amount</h3>
              <p className="text-3xl font-bold">₹{totalPaid.toLocaleString()}</p>
            </div>
            <div className="bg-gradient-to-br from-red-500 to-red-600 text-white p-6 rounded-lg shadow">
              <h3 className="text-sm opacity-90 mb-1">Pending Amount</h3>
              <p className="text-3xl font-bold">₹{totalDue.toLocaleString()}</p>
            </div>
          </div>

          {/* Fee Type Cards */}
          <div className="space-y-6">
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
            <div className="mt-6 bg-white rounded-lg shadow p-6">
              <div className="flex items-center gap-3 mb-4">
                <Building2 className="text-purple-600" size={28} />
                <h2 className="text-xl font-bold">Hostel Details</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Hostel Name</p>
                  <p className="font-semibold">{hostelDetails.hostelName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Room Number</p>
                  <p className="font-semibold">{hostelDetails.roomNumber}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Room Type</p>
                  <p className="font-semibold">{hostelDetails.roomType}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Warden</p>
                  <p className="font-semibold">{hostelDetails.wardenName}</p>
                </div>
              </div>
            </div>
          )}

          {/* Transport Details */}
          {hasTransport && transportDetails && transportDetails.route && (
            <div className="mt-6 bg-white rounded-lg shadow p-6">
              <div className="flex items-center gap-3 mb-4">
                <Bus className="text-green-600" size={28} />
                <h2 className="text-xl font-bold">Transport Details</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Route Number</p>
                  <p className="font-semibold">{transportDetails.route.routeNumber}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Bus Number</p>
                  <p className="font-semibold">{transportDetails.route.busNumber}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Pickup Point</p>
                  <p className="font-semibold">{transportDetails.route.pickupPoint}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Pickup Time</p>
                  <p className="font-semibold">{transportDetails.route.pickupTime}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Driver Name</p>
                  <p className="font-semibold">{transportDetails.route.driverName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Driver Contact</p>
                  <p className="font-semibold">{transportDetails.route.driverContact}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
