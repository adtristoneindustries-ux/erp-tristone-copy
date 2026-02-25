import { useState, useEffect, useContext } from 'react';
import { Heart, Activity, Syringe, AlertCircle, Download, Calendar, TrendingUp } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import { AuthContext } from '../context/AuthContext';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const StudentMedicalReports = () => {
  const { user } = useContext(AuthContext);
  
  // Mock data - in production, fetch from API
  const healthSummary = {
    bloodGroup: user?.bloodGroup || 'O+',
    height: '165 cm',
    weight: '58 kg',
    bmi: '21.3 (Normal)'
  };

  const recentCheckup = {
    date: '1 Oct 2025',
    bmi: '21.3 (Normal)',
    status: 'Healthy'
  };

  const allergies = [
    { name: 'Peanuts', severity: 'High' },
    { name: 'Dust', severity: 'Low' }
  ];

  const vaccinations = [
    { vaccine: 'COVID-19 Booster', date: '15 Sep 2025', nextDue: '-', status: 'Complete' },
    { vaccine: 'Flu Shot', date: '1 Oct 2025', nextDue: '1 Oct 2026', status: 'Complete' },
    { vaccine: 'Tetanus', date: '20 Aug 2024', nextDue: '20 Aug 2029', status: 'Complete' }
  ];

  const bmiData = [
    { month: 'Jan', bmi: 20.5 },
    { month: 'Feb', bmi: 20.8 },
    { month: 'Mar', bmi: 21.0 },
    { month: 'Apr', bmi: 21.1 },
    { month: 'May', bmi: 21.2 },
    { month: 'Jun', bmi: 21.3 }
  ];

  const handleBookAppointment = () => {
    alert('Appointment booking feature coming soon!');
  };

  const handleDownloadReports = () => {
    alert('Downloading medical reports...');
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 lg:ml-64">
        <Navbar />
        <div className="p-4 lg:p-6">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-2xl lg:text-3xl font-bold mb-6">Health & Medical Records</h1>

            {/* Health Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6 mb-6">
              {/* Health Summary */}
              <div className="bg-red-50 rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold mb-4 text-red-700">Health Summary</h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-600">Blood Group</p>
                    <p className="text-lg font-semibold text-gray-800">{healthSummary.bloodGroup}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Height</p>
                    <p className="text-lg font-semibold text-gray-800">{healthSummary.height}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Weight</p>
                    <p className="text-lg font-semibold text-gray-800">{healthSummary.weight}</p>
                  </div>
                </div>
              </div>

              {/* Recent Checkup */}
              <div className="bg-blue-50 rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold mb-4 text-blue-700">Recent Checkup</h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-600">Date</p>
                    <p className="text-lg font-semibold text-gray-800">{recentCheckup.date}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">BMI</p>
                    <p className="text-lg font-semibold text-gray-800">{recentCheckup.bmi}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Status</p>
                    <span className="inline-block px-3 py-1 bg-green-500 text-white text-sm rounded-full">
                      {recentCheckup.status}
                    </span>
                  </div>
                </div>
              </div>

              {/* Allergies */}
              <div className="bg-yellow-50 rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold mb-4 text-yellow-700">Allergies</h3>
                <div className="space-y-3">
                  {allergies.map((allergy, index) => (
                    <div key={index} className="flex justify-between items-center">
                      <span className="text-gray-800">{allergy.name}</span>
                      <span className={`px-2 py-1 text-xs rounded ${
                        allergy.severity === 'High' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        {allergy.severity}
                      </span>
                    </div>
                  ))}
                  <p className="text-xs text-gray-500 mt-2">Last updated: 15 Sep 2025</p>
                </div>
              </div>
            </div>

            {/* Vaccination Records */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Syringe className="text-blue-600" size={24} />
                Vaccination Records
              </h2>
              
              {/* Desktop Table */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Vaccine</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Date</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Next Due</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {vaccinations.map((vac, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm text-gray-800">{vac.vaccine}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">{vac.date}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">{vac.nextDue}</td>
                        <td className="px-4 py-3">
                          <span className="inline-block px-3 py-1 bg-green-500 text-white text-xs rounded-full">
                            {vac.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Cards */}
              <div className="md:hidden space-y-3">
                {vaccinations.map((vac, index) => (
                  <div key={index} className="border rounded-lg p-4 bg-gray-50">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-semibold text-gray-800">{vac.vaccine}</h4>
                      <span className="inline-block px-2 py-1 bg-green-500 text-white text-xs rounded-full">
                        {vac.status}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <p className="text-gray-600">Date:</p>
                        <p className="text-gray-800">{vac.date}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Next Due:</p>
                        <p className="text-gray-800">{vac.nextDue}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* BMI Progress Over Time */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <TrendingUp className="text-green-600" size={24} />
                BMI Progress Over Time
              </h2>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={bmiData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" fontSize={12} />
                    <YAxis fontSize={12} domain={[19, 23]} />
                    <Tooltip />
                    <Line type="monotone" dataKey="bmi" stroke="#10b981" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <p className="text-center text-sm text-gray-500 mt-4">BMI tracking graph visualization</p>
            </div>

            {/* Medical History */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Activity className="text-purple-600" size={24} />
                Medical History
              </h2>
              <div className="space-y-3">
                <div className="border-l-4 border-blue-500 pl-4 py-2">
                  <p className="font-semibold text-gray-800">Annual Health Checkup</p>
                  <p className="text-sm text-gray-600">Date: 1 Oct 2025</p>
                  <p className="text-sm text-gray-600">Result: All parameters normal</p>
                </div>
                <div className="border-l-4 border-green-500 pl-4 py-2">
                  <p className="font-semibold text-gray-800">Dental Checkup</p>
                  <p className="text-sm text-gray-600">Date: 15 Aug 2025</p>
                  <p className="text-sm text-gray-600">Result: No cavities detected</p>
                </div>
                <div className="border-l-4 border-yellow-500 pl-4 py-2">
                  <p className="font-semibold text-gray-800">Vision Test</p>
                  <p className="text-sm text-gray-600">Date: 10 Jul 2025</p>
                  <p className="text-sm text-gray-600">Result: 20/20 vision</p>
                </div>
              </div>
            </div>

            {/* Emergency Contact */}
            <div className="bg-red-50 rounded-lg shadow-md p-6 mb-6">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-red-700">
                <AlertCircle size={24} />
                Emergency Contact
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Contact Person</p>
                  <p className="text-lg font-semibold text-gray-800">{user?.fatherName || 'Parent Name'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Phone Number</p>
                  <p className="text-lg font-semibold text-gray-800">{user?.emergencyContact || '+1 234 567 8903'}</p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={handleBookAppointment}
                className="flex-1 flex items-center justify-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Calendar size={20} />
                Book Appointment
              </button>
              <button
                onClick={handleDownloadReports}
                className="flex-1 flex items-center justify-center gap-2 bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors"
              >
                <Download size={20} />
                Download Reports
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentMedicalReports;
