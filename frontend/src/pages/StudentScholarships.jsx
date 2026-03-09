import { useState, useEffect } from 'react';
import axios from 'axios';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';

export default function StudentScholarships() {
  const [scholarships, setScholarships] = useState([]);
  const [user, setUser] = useState(null);

  useEffect(() => {
    fetchUser();
    fetchScholarships();
  }, []);

  const fetchUser = async () => {
    const { data } = await axios.get('http://localhost:5000/api/auth/me', {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    });
    setUser(data);
  };

  const fetchScholarships = async () => {
    const { data } = await axios.get('http://localhost:5000/api/scholarships', {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    });
    setScholarships(data);
  };

  const applyScholarship = async (id) => {
    await axios.post(`http://localhost:5000/api/scholarships/${id}/apply`, { student: user._id }, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    });
    fetchScholarships();
  };

  const hasApplied = (scholarship) => {
    return scholarship.applications.some(app => app.student?._id === user?._id);
  };

  const getApplicationStatus = (scholarship) => {
    const app = scholarship.applications.find(app => app.student?._id === user?._id);
    return app?.status;
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 lg:ml-64">
        <Navbar />
        <div className="p-4 md:p-6">
      <h1 className="text-2xl md:text-3xl font-bold mb-6">Scholarships</h1>

      <div className="grid gap-4">
        {scholarships.filter(s => s.status === 'Active').map(scholarship => (
          <div key={scholarship._id} className="bg-white rounded-lg shadow p-4 md:p-6">
            <div className="flex flex-col md:flex-row justify-between gap-4">
              <div className="flex-1">
                <h3 className="text-xl font-bold mb-2">{scholarship.name}</h3>
                <p className="text-gray-600 mb-3">{scholarship.description}</p>
                <div className="space-y-1 text-sm">
                  <p><span className="font-semibold">Amount:</span> ₹{scholarship.amount.toLocaleString()}</p>
                  <p><span className="font-semibold">Eligibility:</span> {scholarship.eligibility}</p>
                  <p><span className="font-semibold">Deadline:</span> {new Date(scholarship.deadline).toLocaleDateString()}</p>
                </div>
              </div>
              <div className="flex flex-col justify-between items-start md:items-end gap-2">
                <span className="text-2xl font-bold text-green-600">₹{scholarship.amount.toLocaleString()}</span>
                {hasApplied(scholarship) ? (
                  <span className={`px-3 py-1 rounded text-sm ${
                    getApplicationStatus(scholarship) === 'Approved' ? 'bg-green-100 text-green-800' : 
                    getApplicationStatus(scholarship) === 'Rejected' ? 'bg-red-100 text-red-800' : 
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {getApplicationStatus(scholarship)}
                  </span>
                ) : (
                  <button onClick={() => applyScholarship(scholarship._id)} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 w-full md:w-auto">
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
          {scholarships.filter(s => hasApplied(s)).map(scholarship => (
            <div key={scholarship._id} className="bg-white rounded-lg shadow p-4">
              <div className="flex flex-col sm:flex-row justify-between items-start gap-2">
                <div>
                  <h3 className="font-bold">{scholarship.name}</h3>
                  <p className="text-sm text-gray-600">₹{scholarship.amount.toLocaleString()}</p>
                </div>
                <span className={`px-3 py-1 rounded text-sm ${
                  getApplicationStatus(scholarship) === 'Approved' ? 'bg-green-100 text-green-800' : 
                  getApplicationStatus(scholarship) === 'Rejected' ? 'bg-red-100 text-red-800' : 
                  'bg-yellow-100 text-yellow-800'
                }`}>
                  {getApplicationStatus(scholarship)}
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
