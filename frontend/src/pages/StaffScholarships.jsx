import { useState, useEffect } from 'react';
import axios from 'axios';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';

export default function StaffScholarships() {
  const [scholarships, setScholarships] = useState([]);

  useEffect(() => {
    fetchScholarships();
  }, []);

  const fetchScholarships = async () => {
    const { data } = await axios.get('http://localhost:5000/api/scholarships', {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    });
    setScholarships(data);
  };

  const updateStatus = async (id, appId, status) => {
    await axios.put(`http://localhost:5000/api/scholarships/${id}/application/${appId}`, { status }, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    });
    fetchScholarships();
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 lg:ml-64">
        <Navbar />
        <div className="p-4 md:p-6">
      <h1 className="text-2xl md:text-3xl font-bold mb-6">Scholarship Management</h1>

      <div className="grid gap-4">
        {scholarships.map(scholarship => (
          <div key={scholarship._id} className="bg-white rounded-lg shadow p-4 md:p-6">
            <div className="flex flex-col md:flex-row justify-between mb-4 gap-2">
              <div>
                <h3 className="text-xl font-bold">{scholarship.name}</h3>
                <p className="text-gray-600">{scholarship.description}</p>
              </div>
              <div className="text-left md:text-right">
                <p className="text-2xl font-bold text-green-600">₹{scholarship.amount.toLocaleString()}</p>
                <span className={`inline-block px-2 py-1 rounded text-xs ${scholarship.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                  {scholarship.status}
                </span>
              </div>
            </div>

            <div className="overflow-x-auto">
              <h4 className="font-semibold mb-2">Applications ({scholarship.applications.length})</h4>
              <table className="w-full min-w-[480px]">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 py-2 text-left text-xs">Student</th>
                    <th className="px-3 py-2 text-left text-xs">Applied Date</th>
                    <th className="px-3 py-2 text-left text-xs">Status</th>
                    <th className="px-3 py-2 text-left text-xs">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {scholarship.applications.map(app => (
                    <tr key={app._id} className="border-t">
                      <td className="px-3 py-2">{app.student?.name}</td>
                      <td className="px-3 py-2">{new Date(app.appliedDate).toLocaleDateString()}</td>
                      <td className="px-3 py-2">
                        <span className={`px-2 py-1 rounded text-xs ${app.status === 'Approved' ? 'bg-green-100 text-green-800' : app.status === 'Rejected' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}`}>
                          {app.status}
                        </span>
                      </td>
                      <td className="px-3 py-2">
                        <select className="border rounded px-2 py-1 text-sm" value={app.status} onChange={(e) => updateStatus(scholarship._id, app._id, e.target.value)}>
                          <option value="Pending">Pending</option>
                          <option value="Approved">Approve</option>
                          <option value="Rejected">Reject</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>
        </div>
      </div>
    </div>
  );
}
