const mongoose = require('mongoose');

const menuItemSchema = new mongoose.Schema({
  name: String,
  items: [String],
  calories: Number,
  price: Number,
  rating: { type: Number, default: 5 },
  available: { type: Boolean, default: true }
});

const orderSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  items: [{
    mealType: String,
    itemName: String,
    price: Number
  }],
  totalAmount: { type: Number, required: true },
  status: { type: String, enum: ['pending', 'completed', 'cancelled'], default: 'pending' },
  orderDate: { type: Date, default: Date.now }
});

const walletSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  balance: { type: Number, default: 0 },
  transactions: [{
    type: { type: String, enum: ['credit', 'debit'] },
    amount: Number,
    description: String,
    date: { type: Date, default: Date.now }
  }]
});

const specialSchema = new mongoose.Schema({
  name: String,
  description: String,
  price: Number,
  image: String,
  rating: { type: Number, default: 5 },
  available: { type: Boolean, default: true }
});

const MenuItem = mongoose.model('MenuItem', menuItemSchema);
const Order = mongoose.model('Order', orderSchema);
const Wallet = mongoose.model('Wallet', walletSchema);
const Special = mongoose.model('Special', specialSchema);

module.exports = { MenuItem, Order, Wallet, Special };
