import { useState, useEffect } from 'react';
import { Bus, MapPin, Clock, Phone, User, Navigation } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import { transportAPI } from '../services/api';

const StudentTransport = () => {
  const [transportData, setTransportData] = useState(null);
  const [tracking, setTracking] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTransportData();
  }, []);

  const fetchTransportData = async () => {
    try {
      const res = await transportAPI.getMyTransport();
      setTransportData(res.data.data);
    } catch (error) {
      console.error('Error fetching transport data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTrackLocation = async () => {
    setTracking(true);
    try {
      const res = await transportAPI.trackBusLocation();
      if (res.data.data.status === 'not-available') {
        alert('Live tracking is currently unavailable');
      } else {
        alert('Bus is on route. Last updated: ' + new Date(res.data.data.lastUpdated).toLocaleTimeString());
      }
    } catch (error) {
      alert('Unable to track bus location');
    } finally {
      setTracking(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar />
        <div className="flex-1 lg:ml-64">
          <Navbar />
          <div className="p-6 flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading transport details...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!transportData) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar />
        <div className="flex-1 lg:ml-64">
          <Navbar />
          <div className="p-6">
            <div className="bg-white rounded-lg shadow-md p-8 text-center">
              <Bus size={64} className="mx-auto text-gray-400 mb-4" />
              <h2 className="text-xl font-bold mb-2">No Transport Assigned</h2>
              <p className="text-gray-600">Please contact the administration to assign transport.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const route = transportData.route;

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 lg:ml-64">
        <Navbar />
        <div className="p-4 lg:p-6">
          <h1 className="text-2xl font-bold mb-6">Transport Details</h1>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Bus Information Card */}
            <div className="bg-blue-50 rounded-lg shadow-md p-6">
              <h2 className="text-lg font-bold mb-4 text-blue-700">Bus Information</h2>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Bus className="text-blue-600 mt-1 flex-shrink-0" size={20} />
                  <div>
                    <p className="text-sm text-gray-600">Route Number</p>
                    <p className="font-bold text-lg">{route.routeNumber}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Bus className="text-blue-600 mt-1 flex-shrink-0" size={20} />
                  <div>
                    <p className="text-sm text-gray-600">Bus Number</p>
                    <p className="font-bold text-lg">{route.busNumber}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <User className="text-blue-600 mt-1 flex-shrink-0" size={20} />
                  <div>
                    <p className="text-sm text-gray-600">Driver Name</p>
                    <p className="font-bold text-lg">{route.driverName}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Phone className="text-blue-600 mt-1 flex-shrink-0" size={20} />
                  <div>
                    <p className="text-sm text-gray-600">Driver Contact</p>
                    <p className="font-bold text-lg">{route.driverContact}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Schedule Card */}
            <div className="bg-green-50 rounded-lg shadow-md p-6">
              <h2 className="text-lg font-bold mb-4 text-green-700">Schedule</h2>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <MapPin className="text-green-600 mt-1 flex-shrink-0" size={20} />
                  <div>
                    <p className="text-sm text-gray-600">Pickup Point</p>
                    <p className="font-bold text-lg">{route.pickupPoint}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Clock className="text-green-600 mt-1 flex-shrink-0" size={20} />
                  <div>
                    <p className="text-sm text-gray-600">Pickup Time</p>
                    <p className="font-bold text-lg">{route.pickupTime}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Clock className="text-green-600 mt-1 flex-shrink-0" size={20} />
                  <div>
                    <p className="text-sm text-gray-600">Drop Time</p>
                    <p className="font-bold text-lg">{route.dropTime}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Route Map Card */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-bold mb-4">Route Map</h2>
            <div className="bg-gray-50 rounded-lg p-8 lg:p-16 text-center border-2 border-dashed border-gray-300">
              <MapPin size={64} className="mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold mb-2">Route Map Visualization</h3>
              <p className="text-gray-600 mb-6">{route.routePath}</p>
              <button
                onClick={handleTrackLocation}
                disabled={tracking}
                className="w-full lg:w-auto bg-blue-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-400 flex items-center justify-center gap-2 mx-auto transition"
              >
                <Navigation size={20} />
                {tracking ? 'Tracking...' : 'Track Live Location'}
              </button>
            </div>
          </div>

          {/* Additional Info */}
          <div className="mt-6 bg-blue-50 border-l-4 border-blue-600 p-4 rounded">
            <div className="flex items-start gap-3">
              <div className="bg-blue-600 rounded-full p-1 mt-1">
                <Bus size={16} className="text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-blue-900 mb-1">Important Information</h3>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Please be at the pickup point 5 minutes before scheduled time</li>
                  <li>• Carry your student ID card for verification</li>
                  <li>• Contact the driver in case of any emergency</li>
                  <li>• Follow all safety rules while traveling</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentTransport;
