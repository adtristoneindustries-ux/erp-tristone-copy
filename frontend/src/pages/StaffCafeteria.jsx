import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';

const StaffCafeteria = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('orders');
  const [foodItems, setFoodItems] = useState([]);
  const [orders, setOrders] = useState([]);
  const [ratings, setRatings] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({});
  const [isCanteenStaff, setIsCanteenStaff] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAccess();
  }, []);

  const checkAccess = async () => {
    const token = localStorage.getItem('token');
    try {
      const res = await axios.get('http://localhost:5000/api/cafeteria/check-staff', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.data.isCanteenStaff) {
        navigate('/staff');
        return;
      }
      setIsCanteenStaff(true);
      setLoading(false);
    } catch (error) {
      navigate('/staff');
    }
  };

  useEffect(() => {
    if (isCanteenStaff) {
      fetchData();
    }
  }, [activeTab, isCanteenStaff]);

  const fetchData = async () => {
    const token = localStorage.getItem('token');
    try {
      if (activeTab === 'orders') {
        const res = await axios.get('http://localhost:5000/api/cafeteria/orders', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setOrders(res.data.data);
      } else if (activeTab === 'foodItems') {
        const res = await axios.get('http://localhost:5000/api/cafeteria/food-items', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setFoodItems(res.data.data);
      } else if (activeTab === 'ratings') {
        const res = await axios.get('http://localhost:5000/api/cafeteria/ratings', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setRatings(res.data.data);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    try {
      if (formData._id) {
        await axios.put(`http://localhost:5000/api/cafeteria/food-items/${formData._id}`, formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } else {
        await axios.post('http://localhost:5000/api/cafeteria/food-items', formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
      setShowModal(false);
      setFormData({});
      fetchData();
    } catch (error) {
      console.error('Error submitting:', error);
    }
  };

  const updateOrderStatus = async (orderId, status) => {
    const token = localStorage.getItem('token');
    try {
      await axios.put(`http://localhost:5000/api/cafeteria/orders/${orderId}/status`, { status }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchData();
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const deleteItem = async (id) => {
    if (!confirm('Delete this item?')) return;
    const token = localStorage.getItem('token');
    try {
      await axios.delete(`http://localhost:5000/api/cafeteria/food-items/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchData();
    } catch (error) {
      console.error('Error deleting:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Checking access...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 lg:ml-64">
        <Navbar />
        <div className="p-6">
          <h1 className="text-3xl font-bold mb-6">Canteen Staff Dashboard</h1>

      <div className="flex gap-2 mb-6 border-b">
        {['orders', 'foodItems', 'ratings'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 font-medium ${activeTab === tab ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-600'}`}
          >
            {tab === 'foodItems' ? 'Food Items' : tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {activeTab === 'orders' && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-3 text-left">Customer</th>
                <th className="px-4 py-3 text-left">Role</th>
                <th className="px-4 py-3 text-left">Items</th>
                <th className="px-4 py-3 text-left">Amount</th>
                <th className="px-4 py-3 text-left">Payment</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map(order => (
                <tr key={order._id} className="border-t">
                  <td className="px-4 py-3">{order.customer?.name}</td>
                  <td className="px-4 py-3 capitalize">{order.customer?.role}</td>
                  <td className="px-4 py-3">
                    {order.items.map((item, i) => (
                      <div key={i}>{item.foodItem?.name} x{item.quantity}</div>
                    ))}
                  </td>
                  <td className="px-4 py-3">₹{order.totalAmount}</td>
                  <td className="px-4 py-3">{order.paymentMethod}</td>
                  <td className="px-4 py-3">
                    <select
                      value={order.status}
                      onChange={(e) => updateOrderStatus(order._id, e.target.value)}
                      className="border rounded px-2 py-1 text-sm"
                    >
                      <option value="Pending">Pending</option>
                      <option value="Approved">Approved</option>
                      <option value="In Preparation">In Preparation</option>
                      <option value="Ready for Pickup">Ready for Pickup</option>
                      <option value="Completed">Completed</option>
                      <option value="Rejected">Rejected</option>
                      <option value="Out of Stock">Out of Stock</option>
                    </select>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-500">
                    {new Date(order.createdAt).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'foodItems' && (
        <div>
          <button
            onClick={() => { setShowModal(true); setFormData({}); }}
            className="mb-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Add Food Item
          </button>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {foodItems.map(item => (
              <div key={item._id} className="bg-white rounded-lg shadow p-4">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold text-lg">{item.name}</h3>
                  {item.isTodaySpecial && (
                    <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded">Special</span>
                  )}
                </div>
                <p className="text-sm text-gray-600 mb-2">{item.description}</p>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-lg font-bold text-green-600">₹{item.price}</span>
                  <span className="text-sm text-gray-500">{item.category}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-600 mb-2">
                  <span>Prep: {item.preparationTime}min</span>
                  <span>Qty: {item.quantityAvailable}</span>
                </div>
                <div className="flex justify-between text-sm mb-3">
                  <span>Rating: ⭐ {item.averageRating.toFixed(1)}</span>
                  <span className={item.isAvailable ? 'text-green-600' : 'text-red-600'}>
                    {item.isAvailable ? 'Available' : 'Out of Stock'}
                  </span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => { setShowModal(true); setFormData(item); }}
                    className="flex-1 bg-blue-600 text-white py-1 rounded text-sm hover:bg-blue-700"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => deleteItem(item._id)}
                    className="flex-1 bg-red-600 text-white py-1 rounded text-sm hover:bg-red-700"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'ratings' && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-3 text-left">Customer</th>
                <th className="px-4 py-3 text-left">Food Item</th>
                <th className="px-4 py-3 text-left">Rating</th>
                <th className="px-4 py-3 text-left">Review</th>
                <th className="px-4 py-3 text-left">Date</th>
              </tr>
            </thead>
            <tbody>
              {ratings.map(rating => (
                <tr key={rating._id} className="border-t">
                  <td className="px-4 py-3">{rating.customer?.name}</td>
                  <td className="px-4 py-3">{rating.foodItem?.name}</td>
                  <td className="px-4 py-3">{'⭐'.repeat(rating.rating)}</td>
                  <td className="px-4 py-3">{rating.review}</td>
                  <td className="px-4 py-3 text-sm text-gray-500">
                    {new Date(rating.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">{formData._id ? 'Edit' : 'Add'} Food Item</h2>
            <form onSubmit={handleSubmit} className="space-y-3">
              <input type="text" placeholder="Name" value={formData.name || ''} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full border p-2 rounded" required />
              <select value={formData.category || ''} onChange={e => setFormData({...formData, category: e.target.value})} className="w-full border p-2 rounded" required>
                <option value="">Select Category</option>
                <option value="Snacks">Snacks</option>
                <option value="Meals">Meals</option>
                <option value="Juice">Juice</option>
                <option value="Beverages">Beverages</option>
              </select>
              <input type="number" placeholder="Price" value={formData.price || ''} onChange={e => setFormData({...formData, price: e.target.value})} className="w-full border p-2 rounded" required />
              <textarea placeholder="Description" value={formData.description || ''} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full border p-2 rounded" rows="2"></textarea>
              <input type="number" placeholder="Preparation Time (min)" value={formData.preparationTime || ''} onChange={e => setFormData({...formData, preparationTime: e.target.value})} className="w-full border p-2 rounded" />
              <input type="number" placeholder="Quantity Available" value={formData.quantityAvailable || ''} onChange={e => setFormData({...formData, quantityAvailable: e.target.value})} className="w-full border p-2 rounded" />
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={formData.isAvailable || false} onChange={e => setFormData({...formData, isAvailable: e.target.checked})} />
                <span>Available</span>
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={formData.isTodaySpecial || false} onChange={e => setFormData({...formData, isTodaySpecial: e.target.checked})} />
                <span>Today's Special</span>
              </label>
              <div className="flex gap-2">
                <button type="submit" className="flex-1 bg-blue-600 text-white py-2 rounded hover:bg-blue-700">Save</button>
                <button type="button" onClick={() => { setShowModal(false); setFormData({}); }} className="flex-1 bg-gray-300 py-2 rounded hover:bg-gray-400">Cancel</button>
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

export default StaffCafeteria;
