import { useState, useEffect } from 'react';
import axios from 'axios';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import { Edit2, Trash2, X } from 'lucide-react';

export default function AdminScholarships() {
  const [scholarships, setScholarships] = useState([]);
  const [applications, setApplications] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentId, setCurrentId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'Merit',
    amount: '',
    amountType: 'Fixed',
    academicYear: new Date().getFullYear() + '-' + (new Date().getFullYear() + 1),
    deadline: '',
    status: 'Active',
    eligibilityCriteria: {
      minAttendance: 0,
      maxFamilyIncome: 0,
      minCGPA: 0,
      classes: [],
      description: ''
    }
  });

  useEffect(() => {
    fetchScholarships();
    fetchApplications();
  }, []);

  const fetchScholarships = async () => {
    try {
      const { data } = await axios.get('http://localhost:5000/api/scholarships', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setScholarships(data.data || []);
    } catch (error) {
      console.error('Error fetching scholarships:', error);
    }
  };

  const fetchApplications = async () => {
    try {
      const { data } = await axios.get('http://localhost:5000/api/scholarships/applications', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setApplications(data.data || []);
    } catch (error) {
      console.error('Error fetching applications:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editMode) {
        await axios.put(`http://localhost:5000/api/scholarships/${currentId}`, formData, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
      } else {
        await axios.post('http://localhost:5000/api/scholarships', formData, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
      }
      resetForm();
      fetchScholarships();
    } catch (error) {
      alert(error.response?.data?.message || 'Error saving scholarship');
    }
  };

  const handleEdit = (scholarship) => {
    setFormData({
      name: scholarship.name,
      description: scholarship.description || '',
      type: scholarship.type,
      amount: scholarship.amount,
      amountType: scholarship.amountType,
      academicYear: scholarship.academicYear,
      deadline: scholarship.deadline ? scholarship.deadline.split('T')[0] : '',
      status: scholarship.status,
      eligibilityCriteria: scholarship.eligibilityCriteria || {
        minAttendance: 0,
        maxFamilyIncome: 0,
        minCGPA: 0,
        classes: [],
        description: ''
      }
    });
    setCurrentId(scholarship._id);
    setEditMode(true);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this scholarship?')) return;
    try {
      await axios.delete(`http://localhost:5000/api/scholarships/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      fetchScholarships();
    } catch (error) {
      alert(error.response?.data?.message || 'Error deleting scholarship');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      type: 'Merit',
      amount: '',
      amountType: 'Fixed',
      academicYear: new Date().getFullYear() + '-' + (new Date().getFullYear() + 1),
      deadline: '',
      status: 'Active',
      eligibilityCriteria: {
        minAttendance: 0,
        maxFamilyIncome: 0,
        minCGPA: 0,
        classes: [],
        description: ''
      }
    });
    setShowModal(false);
    setEditMode(false);
    setCurrentId(null);
  };

  const updateApplicationStatus = async (appId, status, remarks = '') => {
    try {
      await axios.put(`http://localhost:5000/api/scholarships/applications/${appId}/review`, 
        { status, adminRemarks: remarks },
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      fetchApplications();
    } catch (error) {
      alert(error.response?.data?.message || 'Error updating application');
    }
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
              <p className="text-xs sm:text-sm text-gray-600 mt-1">Create, edit, and manage scholarships</p>
            </div>
            <button onClick={() => setShowModal(true)} className="bg-blue-600 text-white px-4 py-2 rounded-lg w-full sm:w-auto hover:bg-blue-700 font-medium text-sm">+ Add Scholarship</button>
          </div>

          {/* Scholarships List */}
          <div className="space-y-4 mb-8">
            <h2 className="text-lg font-semibold">Available Scholarships</h2>
            {scholarships.length === 0 ? (
              <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
                No scholarships available. Create one to get started.
              </div>
            ) : (
              scholarships.map(scholarship => (
                <div key={scholarship._id} className="bg-white rounded-lg shadow overflow-hidden">
                  <div className="p-4 md:p-6">
                    <div className="flex flex-col lg:flex-row justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="text-lg md:text-xl font-bold">{scholarship.name}</h3>
                          <div className="flex gap-2 ml-4">
                            <button onClick={() => handleEdit(scholarship)} className="text-blue-600 hover:text-blue-800 p-1">
                              <Edit2 size={18} />
                            </button>
                            <button onClick={() => handleDelete(scholarship._id)} className="text-red-600 hover:text-red-800 p-1">
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </div>
                        <p className="text-gray-600 text-sm mb-3">{scholarship.description}</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                          <div><span className="text-gray-500">Type:</span> <span className="font-medium">{scholarship.type}</span></div>
                          <div><span className="text-gray-500">Academic Year:</span> <span className="font-medium">{scholarship.academicYear}</span></div>
                          <div><span className="text-gray-500">Amount:</span> <span className="font-medium text-green-600">₹{scholarship.amount.toLocaleString()} ({scholarship.amountType})</span></div>
                          <div><span className="text-gray-500">Deadline:</span> <span className="font-medium">{scholarship.deadline ? new Date(scholarship.deadline).toLocaleDateString() : 'N/A'}</span></div>
                        </div>
                      </div>
                      <div className="flex flex-row sm:flex-col items-center justify-between sm:justify-start gap-2">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${scholarship.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                          {scholarship.status}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Applications List */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="p-4 md:p-6">
              <h2 className="text-lg font-semibold mb-4">Scholarship Applications</h2>
              {applications.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No applications yet</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Student</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Scholarship</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Applied Date</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {applications.map(app => (
                        <tr key={app._id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm">
                            <div>{app.student?.name}</div>
                            <div className="text-xs text-gray-500">{app.student?.rollNumber}</div>
                          </td>
                          <td className="px-4 py-3 text-sm">{app.scholarship?.name}</td>
                          <td className="px-4 py-3 text-sm">{new Date(app.appliedDate).toLocaleDateString()}</td>
                          <td className="px-4 py-3">
                            <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                              app.status === 'Approved' ? 'bg-green-100 text-green-800' :
                              app.status === 'Rejected' ? 'bg-red-100 text-red-800' :
                              app.status === 'Verified' ? 'bg-blue-100 text-blue-800' :
                              'bg-yellow-100 text-yellow-800'
                            }`}>
                              {app.status}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            {app.status === 'Pending' && (
                              <div className="flex gap-2">
                                <button onClick={() => updateApplicationStatus(app._id, 'Approved')} className="text-xs bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700">Approve</button>
                                <button onClick={() => updateApplicationStatus(app._id, 'Rejected')} className="text-xs bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700">Reject</button>
                              </div>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          {/* Modal */}
          {showModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
              <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold">{editMode ? 'Edit Scholarship' : 'Add Scholarship'}</h2>
                  <button onClick={resetForm} className="text-gray-500 hover:text-gray-700">
                    <X size={24} />
                  </button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Scholarship Name *</label>
                    <input type="text" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full border rounded-lg p-2.5 text-sm" required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Description</label>
                    <textarea value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} rows="3" className="w-full border rounded-lg p-2.5 text-sm" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Type *</label>
                      <select value={formData.type} onChange={(e) => setFormData({...formData, type: e.target.value})} className="w-full border rounded-lg p-2.5 text-sm">
                        <option value="Merit">Merit</option>
                        <option value="Government">Government</option>
                        <option value="Sports">Sports</option>
                        <option value="Minority">Minority</option>
                        <option value="Management">Management</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Status *</label>
                      <select value={formData.status} onChange={(e) => setFormData({...formData, status: e.target.value})} className="w-full border rounded-lg p-2.5 text-sm">
                        <option value="Active">Active</option>
                        <option value="Closed">Closed</option>
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Amount *</label>
                      <input type="number" value={formData.amount} onChange={(e) => setFormData({...formData, amount: e.target.value})} className="w-full border rounded-lg p-2.5 text-sm" required />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Amount Type *</label>
                      <select value={formData.amountType} onChange={(e) => setFormData({...formData, amountType: e.target.value})} className="w-full border rounded-lg p-2.5 text-sm">
                        <option value="Fixed">Fixed Amount</option>
                        <option value="Percentage">Percentage</option>
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Academic Year *</label>
                      <input type="text" value={formData.academicYear} onChange={(e) => setFormData({...formData, academicYear: e.target.value})} placeholder="2024-2025" className="w-full border rounded-lg p-2.5 text-sm" required />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Deadline</label>
                      <input type="date" value={formData.deadline} onChange={(e) => setFormData({...formData, deadline: e.target.value})} className="w-full border rounded-lg p-2.5 text-sm" />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button type="submit" className="flex-1 bg-blue-600 text-white py-2.5 rounded-lg hover:bg-blue-700 font-medium">
                      {editMode ? 'Update' : 'Create'} Scholarship
                    </button>
                    <button type="button" onClick={resetForm} className="flex-1 bg-gray-300 text-gray-700 py-2.5 rounded-lg hover:bg-gray-400 font-medium">Cancel</button>
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
