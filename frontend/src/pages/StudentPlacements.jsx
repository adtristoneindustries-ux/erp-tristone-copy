import { useState, useEffect } from 'react';
import axios from 'axios';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';

export default function StudentPlacements() {
  const [placements, setPlacements] = useState([]);
  const [user, setUser] = useState(null);

  useEffect(() => {
    fetchUser();
    fetchPlacements();
  }, []);

  const fetchUser = async () => {
    const { data } = await axios.get('http://localhost:5000/api/auth/me', {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    });
    setUser(data);
  };

  const fetchPlacements = async () => {
    const { data } = await axios.get('http://localhost:5000/api/placements', {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    });
    setPlacements(data);
  };

  const applyPlacement = async (id) => {
    await axios.post(`http://localhost:5000/api/placements/${id}/apply`, { student: user._id }, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    });
    fetchPlacements();
  };

  const hasApplied = (placement) => {
    return placement.applications.some(app => app.student?._id === user?._id);
  };

  const getApplicationStatus = (placement) => {
    const app = placement.applications.find(app => app.student?._id === user?._id);
    return app?.status;
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 lg:ml-64">
        <Navbar />
        <div className="p-4 md:p-6">
      <h1 className="text-2xl md:text-3xl font-bold mb-6">Placement Opportunities</h1>

      <div className="grid gap-4">
        {placements.filter(p => p.status === 'Open').map(placement => (
          <div key={placement._id} className="bg-white rounded-lg shadow p-4 md:p-6">
            <div className="flex flex-col md:flex-row justify-between gap-4">
              <div className="flex-1">
                <h3 className="text-xl font-bold mb-1">{placement.company}</h3>
                <p className="text-lg text-blue-600 mb-3">{placement.position}</p>
                <p className="text-gray-600 mb-3">{placement.description}</p>
                <div className="space-y-1 text-sm">
                  <p><span className="font-semibold">Package:</span> ₹{placement.package?.toLocaleString()} LPA</p>
                  <p><span className="font-semibold">Requirements:</span> {placement.requirements}</p>
                  <p><span className="font-semibold">Deadline:</span> {new Date(placement.deadline).toLocaleDateString()}</p>
                </div>
              </div>
              <div className="flex flex-col justify-between items-start md:items-end gap-2">
                <span className="text-2xl font-bold text-blue-600">₹{placement.package?.toLocaleString()} LPA</span>
                {hasApplied(placement) ? (
                  <span className={`px-3 py-1 rounded text-sm ${
                    getApplicationStatus(placement) === 'Selected' ? 'bg-green-100 text-green-800' : 
                    getApplicationStatus(placement) === 'Rejected' ? 'bg-red-100 text-red-800' : 
                    getApplicationStatus(placement) === 'Shortlisted' ? 'bg-blue-100 text-blue-800' : 
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {getApplicationStatus(placement)}
                  </span>
                ) : (
                  <button onClick={() => applyPlacement(placement._id)} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 w-full md:w-auto">
                    Apply Now
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8">
        <h2 className="text-xl font-bold mb-4">My Applications</h2>
        <div className="space-y-4">
          {placements.filter(p => hasApplied(p)).map(placement => (
            <div key={placement._id} className="bg-white rounded-lg shadow p-4">
              <div className="flex flex-col sm:flex-row justify-between items-start gap-2">
                <div>
                  <h3 className="font-bold">{placement.company}</h3>
                  <p className="text-sm text-gray-600">{placement.position} - ₹{placement.package?.toLocaleString()} LPA</p>
                </div>
                <span className={`px-3 py-1 rounded text-sm ${
                  getApplicationStatus(placement) === 'Selected' ? 'bg-green-100 text-green-800' : 
                  getApplicationStatus(placement) === 'Rejected' ? 'bg-red-100 text-red-800' : 
                  getApplicationStatus(placement) === 'Shortlisted' ? 'bg-blue-100 text-blue-800' : 
                  'bg-yellow-100 text-yellow-800'
                }`}>
                  {getApplicationStatus(placement)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
        </div>
      </div>
    </div>
  );
}
