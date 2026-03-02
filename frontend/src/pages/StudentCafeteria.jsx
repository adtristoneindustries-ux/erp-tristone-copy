import { useState, useEffect } from 'react';
import { UtensilsCrossed, Wallet, History, Star, Plus, Minus } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import { cafeteriaAPI } from '../services/api';

const StudentCafeteria = () => {
  const [weeklyMenu, setWeeklyMenu] = useState([]);
  const [wallet, setWallet] = useState({ balance: 0, transactions: [] });
  const [todaySpecials, setTodaySpecials] = useState([]);
  const [showAddMoney, setShowAddMoney] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [amount, setAmount] = useState('');
  const [cart, setCart] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [menuRes, walletRes, specialsRes] = await Promise.all([
        cafeteriaAPI.getWeeklyMenu(),
        cafeteriaAPI.getWallet(),
        cafeteriaAPI.getTodaySpecials()
      ]);
      setWeeklyMenu(menuRes.data.data || []);
      setWallet(walletRes.data.data || { balance: 0, transactions: [] });
      setTodaySpecials(specialsRes.data.data || []);
    } catch (error) {
      console.error('Error fetching cafeteria data:', error);
    }
  };

  const handleAddMoney = async () => {
    if (!amount || amount <= 0) return;
    try {
      const res = await cafeteriaAPI.addMoney({ amount: parseFloat(amount) });
      setWallet(res.data.data);
      setAmount('');
      setShowAddMoney(false);
    } catch (error) {
      console.error('Error adding money:', error);
    }
  };

  const addToCart = (item, mealType) => {
    setCart([...cart, { ...item, mealType }]);
  };

  const removeFromCart = (index) => {
    setCart(cart.filter((_, i) => i !== index));
  };

  const placeOrder = async () => {
    if (cart.length === 0) return;
    const totalAmount = cart.reduce((sum, item) => sum + item.price, 0);
    try {
      await cafeteriaAPI.placeOrder({
        items: cart.map(item => ({
          mealType: item.mealType,
          itemName: item.name,
          price: item.price
        })),
        totalAmount
      });
      setCart([]);
      fetchData();
      alert('Order placed successfully!');
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to place order');
    }
  };

  const menuData = [
    { name: 'Breakfast', items: ['Oatmeal', 'Toast', 'Fruits', 'Juice'], calories: 350, price: 50, color: 'blue' },
    { name: 'Lunch', items: ['Rice', 'Dal', 'Vegetables', 'Roti'], calories: 650, price: 120, color: 'green' },
    { name: 'Snacks', items: ['Sandwich', 'Tea/Coffee', 'Cookies'], calories: 200, price: 40, color: 'yellow' },
    { name: 'Dinner', items: ['Rice', 'Curry', 'Salad', 'Dessert'], calories: 550, price: 100, color: 'orange' }
  ];

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 lg:ml-64">
        <Navbar />
        <div className="p-4 lg:p-6">
          <h1 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <UtensilsCrossed className="text-blue-600" />
            Cafeteria
          </h1>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Weekly Menu */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-bold mb-4">Weekly Menu</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {menuData.map((meal, index) => (
                    <div key={index} className="border rounded-lg p-4 hover:shadow-lg transition">
                      <div className="flex justify-between items-start mb-3">
                        <h3 className="text-lg font-semibold text-blue-600">{meal.name}</h3>
                        <div className="flex items-center gap-2">
                          <span className={`px-3 py-1 rounded-full text-white text-sm font-medium ${
                            meal.color === 'blue' ? 'bg-blue-500' :
                            meal.color === 'green' ? 'bg-green-500' :
                            meal.color === 'yellow' ? 'bg-yellow-500' : 'bg-orange-500'
                          }`}>
                            ₹{meal.price}
                          </span>
                          <button
                            onClick={() => addToCart(meal, meal.name)}
                            className="w-8 h-8 rounded-full bg-green-500 text-white flex items-center justify-center hover:bg-green-600"
                          >
                            <Plus size={16} />
                          </button>
                        </div>
                      </div>
                      <ul className="space-y-1 mb-3">
                        {meal.items.map((item, i) => (
                          <li key={i} className="text-sm text-gray-600">• {item}</li>
                        ))}
                      </ul>
                      <div className="flex justify-between items-center pt-2 border-t">
                        <span className="text-xs text-gray-500">{meal.calories} cal</span>
                        <div className="flex gap-1">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} size={14} className="fill-yellow-400 text-yellow-400" />
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Wallet & Specials */}
            <div className="space-y-6">
              {/* Wallet Balance */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-lg font-bold mb-4 text-orange-600">Wallet Balance</h2>
                <div className="text-center mb-4">
                  <div className="text-4xl font-bold text-orange-600 mb-4">₹{wallet.balance}</div>
                  <button
                    onClick={() => setShowAddMoney(true)}
                    className="w-full bg-orange-500 text-white py-3 rounded-lg font-medium hover:bg-orange-600 flex items-center justify-center gap-2"
                  >
                    <Wallet size={20} />
                    Add Money
                  </button>
                  <button
                    onClick={() => setShowHistory(true)}
                    className="w-full mt-2 border border-orange-500 text-orange-600 py-2 rounded-lg font-medium hover:bg-orange-50"
                  >
                    View History
                  </button>
                </div>
              </div>

              {/* Today's Special */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-lg font-bold mb-4">Today's Special</h2>
                <div className="bg-gradient-to-r from-orange-100 to-red-100 rounded-lg overflow-hidden">
                  <div className="h-32 bg-gradient-to-br from-orange-200 to-red-200 flex items-center justify-center">
                    <UtensilsCrossed size={48} className="text-orange-600" />
                  </div>
                  <div className="p-4">
                    <h3 className="font-bold text-lg mb-2">Biryani Special</h3>
                    <div className="flex justify-between items-center">
                      <span className="text-green-600 font-bold text-xl">₹150</span>
                      <div className="flex gap-1">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} size={14} className="fill-yellow-400 text-yellow-400" />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Cart */}
              {cart.length > 0 && (
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h2 className="text-lg font-bold mb-4">Your Cart</h2>
                  <div className="space-y-2 mb-4">
                    {cart.map((item, index) => (
                      <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                        <span className="text-sm">{item.name}</span>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">₹{item.price}</span>
                          <button
                            onClick={() => removeFromCart(index)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <Minus size={16} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="border-t pt-3 mb-3">
                    <div className="flex justify-between font-bold">
                      <span>Total:</span>
                      <span>₹{cart.reduce((sum, item) => sum + item.price, 0)}</span>
                    </div>
                  </div>
                  <button
                    onClick={placeOrder}
                    className="w-full bg-green-500 text-white py-2 rounded-lg font-medium hover:bg-green-600"
                  >
                    Place Order
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Add Money Modal */}
      {showAddMoney && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-xl font-bold mb-4">Add Money to Wallet</h3>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Enter amount"
              className="w-full border rounded-lg p-3 mb-4"
            />
            <div className="flex gap-3">
              <button
                onClick={handleAddMoney}
                className="flex-1 bg-orange-500 text-white py-2 rounded-lg hover:bg-orange-600"
              >
                Add Money
              </button>
              <button
                onClick={() => setShowAddMoney(false)}
                className="flex-1 border border-gray-300 py-2 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Transaction History Modal */}
      {showHistory && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              <History size={24} />
              Transaction History
            </h3>
            <div className="space-y-2">
              {wallet.transactions?.length > 0 ? (
                wallet.transactions.slice().reverse().map((txn, index) => (
                  <div key={index} className="flex justify-between items-center p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">{txn.description}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(txn.date).toLocaleString()}
                      </p>
                    </div>
                    <span className={`font-bold ${txn.type === 'credit' ? 'text-green-600' : 'text-red-600'}`}>
                      {txn.type === 'credit' ? '+' : '-'}₹{txn.amount}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-center text-gray-500 py-8">No transactions yet</p>
              )}
            </div>
            <button
              onClick={() => setShowHistory(false)}
              className="w-full mt-4 bg-gray-200 py-2 rounded-lg hover:bg-gray-300"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentCafeteria;
