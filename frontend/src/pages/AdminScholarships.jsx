import { useState, useEffect } from 'react';
import axios from 'axios';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';

export default function AdminScholarships() {
  const [scholarships, setScholarships] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ name: '', description: '', amount: '', eligibility: '', deadline: '' });

  useEffect(() => {
    fetchScholarships();
  }, []);

  const fetchScholarships = async () => {
    const { data } = await axios.get('http://localhost:5000/api/scholarships', {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    });
    setScholarships(data);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await axios.post('http://localhost:5000/api/scholarships', formData, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    });
    setShowModal(false);
    fetchScholarships();
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
      <div className="flex-1 lg:ml-64 overflow-x-hidden">
        <Navbar />
        <div className="p-4 md:p-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
            <div>
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold">Scholarship Management</h1>
              <p className="text-xs sm:text-sm text-gray-600 mt-1">Manage scholarships and applications</p>
            </div>
            <button onClick={() => setShowModal(true)} className="bg-blue-600 text-white px-4 py-2 rounded-lg w-full sm:w-auto hover:bg-blue-700 font-medium text-sm">Add Scholarship</button>
          </div>

          <div className="space-y-4">
            {scholarships.map(scholarship => (
              <div key={scholarship._id} className="bg-white rounded-lg shadow overflow-hidden">
                <div className="p-3 sm:p-4 md:p-6">
                  <div className="flex flex-col lg:flex-row justify-between gap-4 mb-4">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base sm:text-lg md:text-xl font-bold mb-2 break-words">{scholarship.name}</h3>
                      <p className="text-gray-600 text-xs sm:text-sm md:text-base mb-3 break-words">{scholarship.description}</p>
                      <div className="flex flex-col sm:flex-row sm:flex-wrap gap-2 sm:gap-4 text-xs sm:text-sm">
                        <div className="break-words">
                          <span className="text-gray-500">Eligibility:</span>
                          <span className="ml-2 font-medium">{scholarship.eligibility}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Deadline:</span>
                          <span className="ml-2 font-medium">{new Date(scholarship.deadline).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-row sm:flex-col lg:flex-col items-start justify-between sm:justify-start lg:items-end gap-2 flex-shrink-0">
                      <p className="text-xl sm:text-2xl md:text-3xl font-bold text-green-600">₹{scholarship.amount.toLocaleString()}</p>
                      <div className="flex flex-col items-end gap-2">
                        <span className={`inline-block px-2 sm:px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap ${scholarship.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                          {scholarship.status}
                        </span>
                        <span className="text-xs sm:text-sm text-gray-500 whitespace-nowrap">{scholarship.applications.length} Applications</span>
                      </div>
                    </div>
                  </div>

                  {scholarship.applications.length > 0 && (
                    <div className="border-t pt-4">
                      <h4 className="font-semibold mb-3 text-sm md:text-base">Applications</h4>
                      <div style={{overflowX: 'scroll', overflowY: 'scroll', maxHeight: '400px', WebkitOverflowScrolling: 'touch'}}>
                        <div style={{minWidth: '800px'}}>
                          <table className="w-full">
                            <thead className="bg-gray-50">
                              <tr>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Student</th>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Applied Date</th>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y">
                              {scholarship.applications.map(app => (
                                <tr key={app._id} className="hover:bg-gray-50">
                                  <td className="px-3 py-2 text-sm">{app.student?.name}</td>
                                  <td className="px-3 py-2 text-sm">{new Date(app.appliedDate).toLocaleDateString()}</td>
                                  <td className="px-3 py-2">
                                    <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${app.status === 'Approved' ? 'bg-green-100 text-green-800' : app.status === 'Rejected' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                      {app.status}
                                    </span>
                                  </td>
                                  <td className="px-3 py-2">
                                    <select className="border border-gray-300 rounded-lg px-2 py-1 text-sm focus:ring-2 focus:ring-blue-500" value={app.status} onChange={(e) => updateStatus(scholarship._id, app._id, e.target.value)}>
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
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {showModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
              <div className="bg-white rounded-lg p-4 md:p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
                <h2 className="text-lg md:text-xl font-bold mb-4">Add Scholarship</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <input type="text" placeholder="Scholarship Name" className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500" onChange={(e) => setFormData({...formData, name: e.target.value})} required />
                  <textarea placeholder="Description" rows="3" className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500" onChange={(e) => setFormData({...formData, description: e.target.value})} />
                  <input type="number" placeholder="Amount" className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500" onChange={(e) => setFormData({...formData, amount: e.target.value})} required />
                  <input type="text" placeholder="Eligibility Criteria" className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500" onChange={(e) => setFormData({...formData, eligibility: e.target.value})} />
                  <input type="date" className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500" onChange={(e) => setFormData({...formData, deadline: e.target.value})} />
                  <div className="flex flex-col sm:flex-row gap-2">
                    <button type="submit" className="flex-1 bg-blue-600 text-white py-2.5 rounded-lg hover:bg-blue-700 font-medium text-sm">Submit</button>
                    <button type="button" onClick={() => setShowModal(false)} className="flex-1 bg-gray-300 text-gray-700 py-2.5 rounded-lg hover:bg-gray-400 font-medium text-sm">Cancel</button>
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
