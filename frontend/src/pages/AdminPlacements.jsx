import { useState, useEffect } from 'react';
import axios from 'axios';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';

export default function AdminPlacements() {
  const [placements, setPlacements] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ company: '', position: '', package: '', description: '', requirements: '', deadline: '' });

  useEffect(() => {
    fetchPlacements();
  }, []);

  const fetchPlacements = async () => {
    const { data } = await axios.get('http://localhost:5000/api/placements', {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    });
    setPlacements(data);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await axios.post('http://localhost:5000/api/placements', formData, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    });
    setShowModal(false);
    fetchPlacements();
  };

  const updateStatus = async (id, appId, status) => {
    await axios.put(`http://localhost:5000/api/placements/${id}/application/${appId}`, { status }, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    });
    fetchPlacements();
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 lg:ml-64">
        <Navbar />
        <div className="p-4 md:p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h1 className="text-2xl md:text-3xl font-bold">Placement Management</h1>
        <button onClick={() => setShowModal(true)} className="bg-blue-600 text-white px-4 py-2 rounded-lg w-full sm:w-auto">Add Placement</button>
      </div>

      <div className="grid gap-4">
        {placements.map(placement => (
          <div key={placement._id} className="bg-white rounded-lg shadow p-4 md:p-6">
            <div className="flex flex-col md:flex-row justify-between mb-4 gap-2">
              <div>
                <h3 className="text-xl font-bold">{placement.company}</h3>
                <p className="text-gray-600">{placement.position}</p>
                <p className="text-sm text-gray-500 mt-1">{placement.description}</p>
              </div>
              <div className="text-left md:text-right">
                <p className="text-2xl font-bold text-blue-600">₹{placement.package?.toLocaleString()}</p>
                <span className={`inline-block px-2 py-1 rounded text-xs ${placement.status === 'Open' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                  {placement.status}
                </span>
              </div>
            </div>

            <div className="overflow-x-auto">
              <h4 className="font-semibold mb-2">Applications ({placement.applications.length})</h4>
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
                  {placement.applications.map(app => (
                    <tr key={app._id} className="border-t">
                      <td className="px-3 py-2">{app.student?.name}</td>
                      <td className="px-3 py-2">{new Date(app.appliedDate).toLocaleDateString()}</td>
                      <td className="px-3 py-2">
                        <span className={`px-2 py-1 rounded text-xs ${
                          app.status === 'Selected' ? 'bg-green-100 text-green-800' : 
                          app.status === 'Rejected' ? 'bg-red-100 text-red-800' : 
                          app.status === 'Shortlisted' ? 'bg-blue-100 text-blue-800' : 
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {app.status}
                        </span>
                      </td>
                      <td className="px-3 py-2">
                        <select className="border rounded px-2 py-1 text-sm" value={app.status} onChange={(e) => updateStatus(placement._id, app._id, e.target.value)}>
                          <option value="Applied">Applied</option>
                          <option value="Shortlisted">Shortlist</option>
                          <option value="Selected">Select</option>
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

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">Add Placement</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input type="text" placeholder="Company Name" className="w-full border rounded p-2" onChange={(e) => setFormData({...formData, company: e.target.value})} required />
              <input type="text" placeholder="Position" className="w-full border rounded p-2" onChange={(e) => setFormData({...formData, position: e.target.value})} required />
              <input type="number" placeholder="Package (LPA)" className="w-full border rounded p-2" onChange={(e) => setFormData({...formData, package: e.target.value})} />
              <textarea placeholder="Description" className="w-full border rounded p-2" onChange={(e) => setFormData({...formData, description: e.target.value})} />
              <textarea placeholder="Requirements" className="w-full border rounded p-2" onChange={(e) => setFormData({...formData, requirements: e.target.value})} />
              <input type="date" className="w-full border rounded p-2" onChange={(e) => setFormData({...formData, deadline: e.target.value})} />
              <div className="flex gap-2">
                <button type="submit" className="flex-1 bg-blue-600 text-white py-2 rounded">Submit</button>
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 bg-gray-300 py-2 rounded">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
        </div>
      </div>
    </div>
  );
}
