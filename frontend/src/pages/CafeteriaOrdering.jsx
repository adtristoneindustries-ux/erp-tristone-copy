import { useState, useEffect } from 'react';
import axios from 'axios';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';

const CafeteriaOrdering = () => {
  const [activeTab, setActiveTab] = useState('menu');
  const [foodItems, setFoodItems] = useState([]);
  const [canteens, setCanteens] = useState([]);
  const [selectedCanteen, setSelectedCanteen] = useState('');
  const [cart, setCart] = useState([]);
  const [orders, setOrders] = useState([]);
  const [ratings, setRatings] = useState([]);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [showCartModal, setShowCartModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('UPI');
  const [pickupTime, setPickupTime] = useState('');
  const [ratingData, setRatingData] = useState({ rating: 5, review: '' });

  useEffect(() => {
    fetchCanteens();
    fetchData();
  }, [activeTab, selectedCanteen]);

  const fetchCanteens = async () => {
    const token = localStorage.getItem('token');
    try {
      const res = await axios.get('http://localhost:5000/api/cafeteria/canteens', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCanteens(res.data.data);
      if (res.data.data.length > 0 && !selectedCanteen) {
        setSelectedCanteen(res.data.data[0]._id);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const fetchData = async () => {
    const token = localStorage.getItem('token');
    try {
      if (activeTab === 'menu') {
        const query = selectedCanteen ? `?canteen=${selectedCanteen}` : '';
        const res = await axios.get(`http://localhost:5000/api/cafeteria/menu${query}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setFoodItems(res.data.data);
      } else if (activeTab === 'orders') {
        const res = await axios.get('http://localhost:5000/api/cafeteria/my-orders', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setOrders(res.data.data);
      } else if (activeTab === 'ratings') {
        const res = await axios.get('http://localhost:5000/api/cafeteria/my-ratings', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setRatings(res.data.data);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const addToCart = (item) => {
    const existing = cart.find(c => c.foodItem === item._id);
    if (existing) {
      setCart(cart.map(c => c.foodItem === item._id ? {...c, quantity: c.quantity + 1} : c));
    } else {
      setCart([...cart, { foodItem: item._id, quantity: 1, price: item.price, name: item.name, canteen: item.canteen }]);
    }
  };

  const removeFromCart = (itemId) => {
    const existing = cart.find(c => c.foodItem === itemId);
    if (existing.quantity > 1) {
      setCart(cart.map(c => c.foodItem === itemId ? {...c, quantity: c.quantity - 1} : c));
    } else {
      setCart(cart.filter(c => c.foodItem !== itemId));
    }
  };

  const placeOrder = async () => {
    if (cart.length === 0) return;
    const token = localStorage.getItem('token');
    try {
      await axios.post('http://localhost:5000/api/cafeteria/order', {
        items: cart.map(c => ({ foodItem: c.foodItem, quantity: c.quantity })),
        paymentMethod,
        canteen: cart[0]?.canteen || selectedCanteen,
        pickupTime
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCart([]);
      setShowOrderModal(false);
      alert('Order placed successfully!');
      setActiveTab('orders');
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to place order');
    }
  };

  const submitRating = async () => {
    const token = localStorage.getItem('token');
    try {
      await axios.post('http://localhost:5000/api/cafeteria/rate', {
        foodItem: selectedItem._id,
        ...ratingData
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setShowRatingModal(false);
      setRatingData({ rating: 5, review: '' });
      alert('Rating submitted!');
      fetchData();
    } catch (error) {
      alert('Failed to submit rating');
    }
  };

  const deleteRating = async (id) => {
    if (!confirm('Delete this rating?')) return;
    const token = localStorage.getItem('token');
    try {
      await axios.delete(`http://localhost:5000/api/cafeteria/ratings/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchData();
    } catch (error) {
      alert('Failed to delete rating');
    }
  };

  const totalAmount = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 lg:ml-64">
        <Navbar />
        <div className="p-6">
          <h1 className="text-3xl font-bold mb-6">Cafeteria</h1>

          <div className="flex gap-2 mb-6 border-b">
            {['menu', 'orders', 'ratings'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 font-medium ${activeTab === tab ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-600'}`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
            {cart.length > 0 && (
              <button
                onClick={() => setShowCartModal(true)}
                className="ml-auto px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                🛒 Cart ({cart.reduce((sum, c) => sum + c.quantity, 0)})
              </button>
            )}
          </div>

          {activeTab === 'menu' && (
            <div>
              <div className="mb-4">
                <label className="block mb-2 font-medium">Select Canteen:</label>
                <select
                  value={selectedCanteen}
                  onChange={(e) => setSelectedCanteen(e.target.value)}
                  className="border p-2 rounded w-full max-w-md"
                >
                  {canteens.map(c => (
                    <option key={c._id} value={c._id}>{c.name} - {c.location}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {foodItems.map(item => (
                  <div key={item._id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition">
                    <div className="h-32 bg-gradient-to-br from-orange-200 to-red-200 flex items-center justify-center">
                      <span className="text-4xl">🍽️</span>
                    </div>
                    <div className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-bold text-lg">{item.name}</h3>
                        {item.isTodaySpecial && (
                          <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded">Special</span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{item.description}</p>
                      <p className="text-xs text-gray-500 mb-2">📍 {item.canteen?.name} - {item.canteen?.location}</p>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-xl font-bold text-green-600">₹{item.price}</span>
                        <span className="text-xs bg-gray-100 px-2 py-1 rounded">{item.category}</span>
                      </div>
                      <div className="flex justify-between text-xs text-gray-600 mb-3">
                        <span>⏱️ {item.preparationTime}min</span>
                        <span>⭐ {item.averageRating.toFixed(1)}</span>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => addToCart(item)}
                          disabled={!item.isAvailable}
                          className={`flex-1 py-2 rounded font-medium ${item.isAvailable ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}
                        >
                          {item.isAvailable ? 'Add to Cart' : 'Out of Stock'}
                        </button>
                        <button
                          onClick={() => { setSelectedItem(item); setShowRatingModal(true); }}
                          className="px-3 py-2 border border-blue-600 text-blue-600 rounded hover:bg-blue-50"
                        >
                          ⭐
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {showCartModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6 w-full max-w-md">
                <h2 className="text-xl font-bold mb-4">Your Cart</h2>
                <div className="space-y-2 mb-4 max-h-60 overflow-y-auto">
                  {cart.map(item => (
                    <div key={item.foodItem} className="flex justify-between items-center border-b pb-2">
                      <div>
                        <div className="font-medium">{item.name}</div>
                        <div className="text-xs text-gray-500">Qty: {item.quantity}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">₹{item.price * item.quantity}</span>
                        <button onClick={() => removeFromCart(item.foodItem)} className="text-red-600 text-sm">-</button>
                        <button onClick={() => addToCart({ _id: item.foodItem, price: item.price, canteen: item.canteen })} className="text-green-600 text-sm">+</button>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="border-t pt-3 mb-4">
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total:</span>
                    <span>₹{totalAmount}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => { setShowCartModal(false); setShowOrderModal(true); }} className="flex-1 bg-green-600 text-white py-2 rounded">Checkout</button>
                  <button onClick={() => setShowCartModal(false)} className="flex-1 bg-gray-300 py-2 rounded">Close</button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'orders' && (
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-4 py-3 text-left">Order ID</th>
                    <th className="px-4 py-3 text-left">Items</th>
                    <th className="px-4 py-3 text-left">Amount</th>
                    <th className="px-4 py-3 text-left">Payment</th>
                    <th className="px-4 py-3 text-left">Status</th>
                    <th className="px-4 py-3 text-left">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map(order => (
                    <tr key={order._id} className="border-t">
                      <td className="px-4 py-3 font-mono text-sm">{order._id.slice(-6)}</td>
                      <td className="px-4 py-3">
                        {order.items.map((item, i) => (
                          <div key={i} className="text-sm">{item.foodItem?.name} x{item.quantity}</div>
                        ))}
                      </td>
                      <td className="px-4 py-3 font-bold">₹{order.totalAmount}</td>
                      <td className="px-4 py-3">{order.paymentMethod}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded text-xs ${
                          order.status === 'Completed' ? 'bg-green-100 text-green-800' :
                          order.status === 'Rejected' ? 'bg-red-100 text-red-800' :
                          order.status === 'Ready for Pickup' ? 'bg-blue-100 text-blue-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500">
                        {new Date(order.createdAt).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'ratings' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {ratings.map(rating => (
                <div key={rating._id} className="bg-white rounded-lg shadow p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold">{rating.foodItem?.name}</h3>
                    <button
                      onClick={() => deleteRating(rating._id)}
                      className="text-red-600 text-sm hover:underline"
                    >
                      Delete
                    </button>
                  </div>
                  <div className="mb-2">
                    {'⭐'.repeat(rating.rating)}
                  </div>
                  <p className="text-sm text-gray-600">{rating.review}</p>
                  <p className="text-xs text-gray-400 mt-2">
                    {new Date(rating.createdAt).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          )}

          {showOrderModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6 w-full max-w-md">
                <h2 className="text-xl font-bold mb-4">Order Summary</h2>
                <div className="space-y-2 mb-4">
                  {cart.map(item => (
                    <div key={item.foodItem} className="flex justify-between items-center">
                      <span>{item.name} x{item.quantity}</span>
                      <span className="font-medium">₹{item.price * item.quantity}</span>
                    </div>
                  ))}
                </div>
                <div className="border-t pt-3 mb-4">
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total:</span>
                    <span>₹{totalAmount}</span>
                  </div>
                </div>
                <div className="space-y-3">
                  <select
                    value={paymentMethod}
                    onChange={e => setPaymentMethod(e.target.value)}
                    className="w-full border p-2 rounded"
                  >
                    <option value="UPI">UPI / Online Payment</option>
                    <option value="Card">Card Payment</option>
                    <option value="Cash">Cash at Canteen</option>
                  </select>
                  <input
                    type="time"
                    value={pickupTime}
                    onChange={e => setPickupTime(e.target.value)}
                    placeholder="Pickup Time (Optional)"
                    className="w-full border p-2 rounded"
                  />
                </div>
                <div className="flex gap-2 mt-4">
                  <button onClick={placeOrder} className="flex-1 bg-green-600 text-white py-2 rounded hover:bg-green-700">
                    Confirm Order
                  </button>
                  <button onClick={() => setShowOrderModal(false)} className="flex-1 bg-gray-300 py-2 rounded hover:bg-gray-400">
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}

          {showRatingModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6 w-full max-w-md">
                <h2 className="text-xl font-bold mb-4">Rate {selectedItem?.name}</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block mb-2">Rating</label>
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5].map(star => (
                        <button
                          key={star}
                          onClick={() => setRatingData({...ratingData, rating: star})}
                          className="text-3xl"
                        >
                          {star <= ratingData.rating ? '⭐' : '☆'}
                        </button>
                      ))}
                    </div>
                  </div>
                  <textarea
                    placeholder="Write your review..."
                    value={ratingData.review}
                    onChange={e => setRatingData({...ratingData, review: e.target.value})}
                    className="w-full border p-2 rounded"
                    rows="3"
                  ></textarea>
                </div>
                <div className="flex gap-2 mt-4">
                  <button onClick={submitRating} className="flex-1 bg-blue-600 text-white py-2 rounded hover:bg-blue-700">
                    Submit
                  </button>
                  <button onClick={() => { setShowRatingModal(false); setRatingData({ rating: 5, review: '' }); }} className="flex-1 bg-gray-300 py-2 rounded hover:bg-gray-400">
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CafeteriaOrdering;
