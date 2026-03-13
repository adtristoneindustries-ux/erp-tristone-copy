const mongoose = require('mongoose');

const canteenSchema = new mongoose.Schema({
  name: { type: String, required: true },
  location: { type: String, required: true },
  openingTime: { type: String, required: true },
  closingTime: { type: String, required: true },
  contactNumber: { type: String, required: true },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

const canteenStaffSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  staffId: { type: String, required: true, unique: true },
  canteen: { type: mongoose.Schema.Types.ObjectId, ref: 'Canteen', required: true },
  role: { type: String, enum: ['Manager', 'Cashier', 'Cook'], required: true },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

const foodItemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: { type: String, enum: ['Breakfast', 'Lunch', 'Snacks', 'Beverages', 'Desserts'], required: true },
  price: { type: Number, required: true },
  description: String,
  preparationTime: { type: Number, default: 10 },
  quantityAvailable: { type: Number, default: 0 },
  image: String,
  available: { type: Boolean, default: true },
  isAvailable: { type: Boolean, default: true },
  isTodaySpecial: { type: Boolean, default: false },
  canteen: { type: mongoose.Schema.Types.ObjectId, ref: 'Canteen' },
  averageRating: { type: Number, default: 0 }
}, { timestamps: true });

const orderSchema = new mongoose.Schema({
  customer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  items: [{
    foodItem: { type: mongoose.Schema.Types.ObjectId, ref: 'FoodItem', required: true },
    quantity: { type: Number, required: true },
    price: { type: Number, required: true }
  }],
  totalAmount: { type: Number, required: true },
  paymentMethod: { type: String, enum: ['UPI', 'Card', 'Cash'], default: 'Cash' },
  status: { type: String, enum: ['Pending', 'In Preparation', 'Ready', 'Completed', 'Cancelled'], default: 'Pending' },
  canteen: { type: mongoose.Schema.Types.ObjectId, ref: 'Canteen' },
  pickupTime: String,
  orderNumber: String
}, { timestamps: true });

const ratingSchema = new mongoose.Schema({
  customer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  foodItem: { type: mongoose.Schema.Types.ObjectId, ref: 'FoodItem' },
  rating: { type: Number, min: 1, max: 5, required: true },
  comment: String,
  review: String,
  staffResponse: String
}, { timestamps: true });

const Canteen = mongoose.model('Canteen', canteenSchema);
const CanteenStaff = mongoose.model('CanteenStaff', canteenStaffSchema);
const FoodItem = mongoose.model('FoodItem', foodItemSchema);
const Order = mongoose.model('CafeteriaOrder', orderSchema);
const Rating = mongoose.model('FoodRating', ratingSchema);

module.exports = { Canteen, CanteenStaff, FoodItem, Order, Rating };
