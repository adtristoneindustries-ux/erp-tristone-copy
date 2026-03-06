import { useState, useEffect } from 'react';
import axios from 'axios';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';

const AdminCafeteria = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [canteens, setCanteens] = useState([]);
  const [staff, setStaff] = useState([]);
  const [allStaff, setAllStaff] = useState([]);
  const [dashboard, setDashboard] = useState({});
  const [reports, setReports] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('');
  const [formData, setFormData] = useState({});
  const [selectedStaff, setSelectedStaff] = useState([]);

  useEffect(() => {
    fetchData();
    if (activeTab === 'canteens') fetchAllStaff();
  }, [activeTab]);

  const fetchAllStaff = async () => {
    const token = localStorage.getItem('token');
    try {
      const res = await axios.get('http://localhost:5000/api/cafeteria/staff-users', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const cafeteriaStaff = res.data.data.filter(s => s.department === 'Cafeteria');
      
      // Get already assigned staff from all canteens
      const canteensRes = await axios.get('http://localhost:5000/api/cafeteria/canteens', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const assignedStaffIds = [];
      for (const canteen of canteensRes.data.data) {
        if (formData?._id && canteen._id === formData._id) continue; // Skip current canteen when editing
        try {
          const staffRes = await axios.get(`http://localhost:5000/api/cafeteria/canteens/${canteen._id}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          staffRes.data.data.assignedStaff?.forEach(s => {
            if (s.user?._id) assignedStaffIds.push(s.user._id);
          });
        } catch (err) {
          console.error('Error fetching canteen staff:', err);
        }
      }
      
      // Mark staff as assigned
      const staffWithStatus = cafeteriaStaff.map(s => ({
        ...s,
        isAssigned: assignedStaffIds.includes(s._id)
      }));
      
      setAllStaff(staffWithStatus);
    } catch (error) {
      console.error('Error:', error);
      setAllStaff([]);
    }
  };

  const fetchData = async () => {
    const token = localStorage.getItem('token');
    try {
      if (activeTab === 'dashboard') {
        const res = await axios.get('http://localhost:5000/api/cafeteria/admin/dashboard', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setDashboard(res.data.data);
        // Fetch canteens for location-wise display
        const canteensRes = await axios.get('http://localhost:5000/api/cafeteria/canteens', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setCanteens(canteensRes.data.data);
      } else if (activeTab === 'canteens') {
        const res = await axios.get('http://localhost:5000/api/cafeteria/canteens', {
          headers: { Authorization: `Bearer ${token}` }
        });
        const canteensWithStaff = await Promise.all(res.data.data.map(async (c) => {
          const staffRes = await axios.get(`http://localhost:5000/api/cafeteria/canteens/${c._id}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          return { ...c, assignedStaff: staffRes.data.data.assignedStaff };
        }));
        setCanteens(canteensWithStaff);
      } else if (activeTab === 'staff') {
        const res = await axios.get('http://localhost:5000/api/cafeteria/staff', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setStaff(res.data.data);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    try {
      const payload = { ...formData, staffIds: selectedStaff };
      if (formData._id) {
        await axios.put(`http://localhost:5000/api/cafeteria/canteens/${formData._id}`, payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } else {
        await axios.post('http://localhost:5000/api/cafeteria/canteens', payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
      setShowModal(false);
      setFormData({});
      setSelectedStaff([]);
      fetchData();
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const fetchReport = async (type) => {
    const token = localStorage.getItem('token');
    try {
      const res = await axios.get(`http://localhost:5000/api/cafeteria/admin/reports/${type}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setReports(res.data.data);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const openEditModal = async (canteen) => {
    const token = localStorage.getItem('token');
    try {
      const res = await axios.get(`http://localhost:5000/api/cafeteria/canteens/${canteen._id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setFormData(canteen);
      setSelectedStaff(res.data.data.assignedStaff?.map(s => s.user?._id).filter(Boolean) || []);
      setModalType('canteen');
      setShowModal(true);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const openViewModal = async (canteen) => {
    const token = localStorage.getItem('token');
    try {
      const res = await axios.get(`http://localhost:5000/api/cafeteria/canteens/${canteen._id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setFormData({ ...canteen, assignedStaff: res.data.data.assignedStaff });
      setModalType('view');
      setShowModal(true);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const deleteCanteen = async (id) => {
    if (!confirm('Delete this canteen?')) return;
    const token = localStorage.getItem('token');
    try {
      await axios.delete(`http://localhost:5000/api/cafeteria/canteens/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchData();
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 lg:ml-64">
        <Navbar />
        <div className="p-6">
          <h1 className="text-3xl font-bold mb-6">Cafeteria Management</h1>

          <div className="flex gap-2 mb-6 border-b">
            {['dashboard', 'canteens', 'reports'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 font-medium ${activeTab === tab ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-600'}`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>

          {activeTab === 'dashboard' && (
            <div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <div className="bg-white p-6 rounded-lg shadow">
                  <h3 className="text-gray-500 text-sm">Today's Orders</h3>
                  <p className="text-3xl font-bold">{dashboard.todayOrders || 0}</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow">
                  <h3 className="text-gray-500 text-sm">Month's Orders</h3>
                  <p className="text-3xl font-bold">{dashboard.monthOrders || 0}</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow">
                  <h3 className="text-gray-500 text-sm">Today's Revenue</h3>
                  <p className="text-3xl font-bold">₹{dashboard.todayRevenue || 0}</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow">
                  <h3 className="text-gray-500 text-sm">Month's Revenue</h3>
                  <p className="text-3xl font-bold">₹{dashboard.monthRevenue || 0}</p>
                </div>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-bold mb-4">Location-wise Statistics</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {canteens.map(canteen => (
                    <div key={canteen._id} className="border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer" onClick={() => fetchReport('daily')}>
                      <h3 className="font-semibold text-lg mb-2">{canteen.name}</h3>
                      <p className="text-sm text-gray-600 mb-3">📍 {canteen.location}</p>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Orders Today:</span>
                          <span className="font-medium">-</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Revenue Today:</span>
                          <span className="font-medium">₹-</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'canteens' && (
            <div>
              <button
                onClick={() => { setModalType('canteen'); setShowModal(true); setFormData({}); setSelectedStaff([]); }}
                className="mb-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                Add Canteen
              </button>
              <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="px-4 py-3 text-left">Name</th>
                      <th className="px-4 py-3 text-left">Location</th>
                      <th className="px-4 py-3 text-left">Timing</th>
                      <th className="px-4 py-3 text-left">Staff</th>
                      <th className="px-4 py-3 text-left">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {canteens.map(canteen => (
                      <tr key={canteen._id} className="border-t">
                        <td className="px-4 py-3">{canteen.name}</td>
                        <td className="px-4 py-3">{canteen.location}</td>
                        <td className="px-4 py-3">{canteen.openingTime} - {canteen.closingTime}</td>
                        <td className="px-4 py-3">
                          {canteen.assignedStaff?.length > 0 ? (
                            <div className="text-sm">{canteen.assignedStaff.map(s => s.user?.name).join(', ')}</div>
                          ) : (
                            <span className="text-gray-400 text-sm">No staff</span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex gap-2">
                            <button onClick={() => openViewModal(canteen)} className="text-green-600 hover:underline">View</button>
                            <button onClick={() => openEditModal(canteen)} className="text-blue-600 hover:underline">Edit</button>
                            <button onClick={() => deleteCanteen(canteen._id)} className="text-red-600 hover:underline">Delete</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'reports' && (
            <div className="space-y-4">
              <div className="flex gap-2">
                <button onClick={() => fetchReport('daily')} className="bg-blue-600 text-white px-4 py-2 rounded">Daily</button>
                <button onClick={() => fetchReport('monthly')} className="bg-blue-600 text-white px-4 py-2 rounded">Monthly</button>
                <button onClick={() => fetchReport('items')} className="bg-blue-600 text-white px-4 py-2 rounded">Items</button>
              </div>
            </div>
          )}

          {showModal && modalType === 'view' && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6 w-full max-w-md">
                <h2 className="text-xl font-bold mb-4">Canteen Details</h2>
                <div className="space-y-3">
                  <div><span className="font-medium">Name:</span> {formData.name}</div>
                  <div><span className="font-medium">Location:</span> {formData.location}</div>
                  <div><span className="font-medium">Timing:</span> {formData.openingTime} - {formData.closingTime}</div>
                  <div><span className="font-medium">Contact:</span> {formData.contactNumber}</div>
                  <div>
                    <span className="font-medium">Assigned Staff:</span>
                    <div className="mt-2 space-y-1">
                      {formData.assignedStaff?.length > 0 ? formData.assignedStaff.map(s => (
                        <div key={s._id} className="text-sm bg-gray-50 p-2 rounded">{s.user?.name} ({s.user?.email})</div>
                      )) : <div className="text-sm text-gray-500">No staff assigned</div>}
                    </div>
                  </div>
                </div>
                <button onClick={() => { setShowModal(false); setFormData({}); }} className="w-full mt-4 bg-gray-300 py-2 rounded">Close</button>
              </div>
            </div>
          )}

          {showModal && modalType === 'canteen' && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
                <h2 className="text-xl font-bold mb-4">{formData._id ? 'Edit' : 'Add'} Canteen</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <input type="text" placeholder="Name" value={formData.name || ''} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full border p-2 rounded" required />
                  <input type="text" placeholder="Location" value={formData.location || ''} onChange={e => setFormData({...formData, location: e.target.value})} className="w-full border p-2 rounded" required />
                  <input type="time" value={formData.openingTime || ''} onChange={e => setFormData({...formData, openingTime: e.target.value})} className="w-full border p-2 rounded" required />
                  <input type="time" value={formData.closingTime || ''} onChange={e => setFormData({...formData, closingTime: e.target.value})} className="w-full border p-2 rounded" required />
                  <input type="text" placeholder="Contact" value={formData.contactNumber || ''} onChange={e => setFormData({...formData, contactNumber: e.target.value})} className="w-full border p-2 rounded" required />
                  <div>
                    <label className="block mb-2 font-medium">Assign Staff</label>
                    {allStaff.length === 0 ? (
                      <div className="border rounded p-4 text-center text-gray-500">
                        No staff with Cafeteria department found. Please add staff with department 'Cafeteria' in User Management.
                      </div>
                    ) : (
                      <div className="border rounded p-2 max-h-40 overflow-y-auto">
                        {allStaff.map(s => (
                          <label key={s._id} className={`flex items-center gap-2 p-1 hover:bg-gray-50 ${s.isAssigned ? 'opacity-50 cursor-not-allowed' : ''}`}>
                            <input
                              type="checkbox"
                              checked={selectedStaff.includes(s._id)}
                              disabled={s.isAssigned}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedStaff([...selectedStaff, s._id]);
                                } else {
                                  setSelectedStaff(selectedStaff.filter(id => id !== s._id));
                                }
                              }}
                            />
                            <span className="text-sm">{s.name} ({s.email}) {s.isAssigned && <span className="text-red-500 text-xs">- Already Assigned</span>}</span>
                          </label>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <button type="submit" className="flex-1 bg-blue-600 text-white py-2 rounded">Save</button>
                    <button type="button" onClick={() => { setShowModal(false); setFormData({}); setSelectedStaff([]); }} className="flex-1 bg-gray-300 py-2 rounded">Cancel</button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminCafeteria;
