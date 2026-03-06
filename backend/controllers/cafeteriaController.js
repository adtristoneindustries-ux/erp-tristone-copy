const { Canteen, CanteenStaff, FoodItem, Order, Rating } = require('../models/Cafeteria');
const User = require('../models/User');

// ============ ADMIN CONTROLLERS ============

// Canteen Management
exports.createCanteen = async (req, res) => {
  try {
    const { name, location, openingTime, closingTime, contactNumber, staffIds } = req.body;
    const canteen = await Canteen.create({ name, location, openingTime, closingTime, contactNumber });
    
    if (staffIds && staffIds.length > 0) {
      const staffAssignments = staffIds.map((staffId, index) => ({
        user: staffId,
        staffId: `CS${Date.now()}${index}`,
        canteen: canteen._id,
        role: 'Manager'
      }));
      await CanteenStaff.insertMany(staffAssignments);
    }
    
    res.json({ success: true, data: canteen });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getCanteens = async (req, res) => {
  try {
    const canteens = await Canteen.find();
    res.json({ success: true, data: canteens });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateCanteen = async (req, res) => {
  try {
    const { staffIds, ...canteenData } = req.body;
    const canteen = await Canteen.findByIdAndUpdate(req.params.id, canteenData, { new: true });
    
    if (staffIds) {
      await CanteenStaff.deleteMany({ canteen: req.params.id });
      if (staffIds.length > 0) {
        const staffAssignments = staffIds.map((staffId, index) => ({
          user: staffId,
          staffId: `CS${Date.now()}${index}`,
          canteen: canteen._id,
          role: 'Manager'
        }));
        await CanteenStaff.insertMany(staffAssignments);
      }
    }
    
    res.json({ success: true, data: canteen });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteCanteen = async (req, res) => {
  try {
    await CanteenStaff.deleteMany({ canteen: req.params.id });
    await Canteen.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Canteen deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Canteen Staff Management
exports.getStaffUsers = async (req, res) => {
  try {
    const staff = await User.find({ role: 'staff' }).select('name email phone department');
    res.json({ success: true, data: staff });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getCanteenWithStaff = async (req, res) => {
  try {
    const canteen = await Canteen.findById(req.params.id);
    const assignedStaff = await CanteenStaff.find({ canteen: req.params.id }).populate('user');
    res.json({ success: true, data: { canteen, assignedStaff } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.createCanteenStaff = async (req, res) => {
  try {
    const { name, email, phone, canteen, role, staffId } = req.body;
    const user = await User.create({ name, email, phone, role: 'staff', password: 'staff123' });
    const staff = await CanteenStaff.create({ user: user._id, staffId, canteen, role });
    res.json({ success: true, data: await staff.populate('user canteen') });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getCanteenStaff = async (req, res) => {
  try {
    const staff = await CanteenStaff.find().populate('user canteen');
    res.json({ success: true, data: staff });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateCanteenStaff = async (req, res) => {
  try {
    const staff = await CanteenStaff.findByIdAndUpdate(req.params.id, req.body, { new: true }).populate('user canteen');
    res.json({ success: true, data: staff });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Admin Dashboard Analytics
exports.getAdminDashboard = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);

    const [todayOrders, monthOrders, todayRevenue, monthRevenue, pendingOrders] = await Promise.all([
      Order.countDocuments({ createdAt: { $gte: today } }),
      Order.countDocuments({ createdAt: { $gte: monthStart } }),
      Order.aggregate([{ $match: { createdAt: { $gte: today }, status: 'Completed' } }, { $group: { _id: null, total: { $sum: '$totalAmount' } } }]),
      Order.aggregate([{ $match: { createdAt: { $gte: monthStart }, status: 'Completed' } }, { $group: { _id: null, total: { $sum: '$totalAmount' } } }]),
      Order.countDocuments({ status: 'Pending' })
    ]);

    const mostSold = await Order.aggregate([
      { $unwind: '$items' },
      { $group: { _id: '$items.foodItem', count: { $sum: '$items.quantity' } } },
      { $sort: { count: -1 } },
      { $limit: 5 },
      { $lookup: { from: 'fooditems', localField: '_id', foreignField: '_id', as: 'item' } },
      { $unwind: '$item' }
    ]);

    const todaySpecial = await FoodItem.findOne({ isTodaySpecial: true });

    res.json({
      success: true,
      data: {
        todayOrders,
        monthOrders,
        todayRevenue: todayRevenue[0]?.total || 0,
        monthRevenue: monthRevenue[0]?.total || 0,
        pendingOrders,
        mostSold,
        todaySpecial
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Admin Reports
exports.getDailySalesReport = async (req, res) => {
  try {
    const { date } = req.query;
    const targetDate = date ? new Date(date) : new Date();
    targetDate.setHours(0, 0, 0, 0);
    const nextDay = new Date(targetDate);
    nextDay.setDate(nextDay.getDate() + 1);

    const orders = await Order.find({ createdAt: { $gte: targetDate, $lt: nextDay } }).populate('customer items.foodItem');
    const total = orders.reduce((sum, order) => sum + (order.status === 'Completed' ? order.totalAmount : 0), 0);

    res.json({ success: true, data: { orders, total, date: targetDate } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getMonthlySalesReport = async (req, res) => {
  try {
    const { month, year } = req.query;
    const targetMonth = month ? parseInt(month) - 1 : new Date().getMonth();
    const targetYear = year ? parseInt(year) : new Date().getFullYear();
    const startDate = new Date(targetYear, targetMonth, 1);
    const endDate = new Date(targetYear, targetMonth + 1, 1);

    const orders = await Order.find({ createdAt: { $gte: startDate, $lt: endDate } }).populate('customer items.foodItem');
    const total = orders.reduce((sum, order) => sum + (order.status === 'Completed' ? order.totalAmount : 0), 0);

    res.json({ success: true, data: { orders, total, month: targetMonth + 1, year: targetYear } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getItemWiseSalesReport = async (req, res) => {
  try {
    const report = await Order.aggregate([
      { $match: { status: 'Completed' } },
      { $unwind: '$items' },
      { $group: { _id: '$items.foodItem', totalQuantity: { $sum: '$items.quantity' }, totalRevenue: { $sum: { $multiply: ['$items.quantity', '$items.price'] } } } },
      { $lookup: { from: 'fooditems', localField: '_id', foreignField: '_id', as: 'item' } },
      { $unwind: '$item' },
      { $sort: { totalRevenue: -1 } }
    ]);
    res.json({ success: true, data: report });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getPaymentMethodReport = async (req, res) => {
  try {
    const report = await Order.aggregate([
      { $match: { status: 'Completed' } },
      { $group: { _id: '$paymentMethod', count: { $sum: 1 }, totalAmount: { $sum: '$totalAmount' } } }
    ]);
    res.json({ success: true, data: report });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ============ CANTEEN STAFF CONTROLLERS ============

// Food Item Management
exports.createFoodItem = async (req, res) => {
  try {
    const foodItem = await FoodItem.create(req.body);
    res.json({ success: true, data: foodItem });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getFoodItems = async (req, res) => {
  try {
    const { canteen } = req.query;
    const query = canteen ? { canteen } : {};
    const items = await FoodItem.find(query).populate('canteen');
    res.json({ success: true, data: items });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateFoodItem = async (req, res) => {
  try {
    const foodItem = await FoodItem.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ success: true, data: foodItem });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteFoodItem = async (req, res) => {
  try {
    await FoodItem.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Food item deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Order Management
exports.getOrders = async (req, res) => {
  try {
    const { status, canteen } = req.query;
    const query = {};
    if (status) query.status = status;
    if (canteen) query.canteen = canteen;
    const orders = await Order.find(query).populate('customer items.foodItem canteen').sort({ createdAt: -1 });
    res.json({ success: true, data: orders });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findByIdAndUpdate(req.params.id, { status }, { new: true }).populate('customer items.foodItem');
    res.json({ success: true, data: order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Rating Management
exports.getRatings = async (req, res) => {
  try {
    const { foodItem } = req.query;
    const query = foodItem ? { foodItem } : {};
    const ratings = await Rating.find(query).populate('customer foodItem').sort({ createdAt: -1 });
    res.json({ success: true, data: ratings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.respondToRating = async (req, res) => {
  try {
    const { staffResponse } = req.body;
    const rating = await Rating.findByIdAndUpdate(req.params.id, { staffResponse }, { new: true }).populate('customer foodItem');
    res.json({ success: true, data: rating });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ============ USER (ORDERING) CONTROLLERS ============

// Get Available Food Items
exports.getAvailableFoodItems = async (req, res) => {
  try {
    const items = await FoodItem.find({ isAvailable: true }).populate('canteen');
    res.json({ success: true, data: items });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Place Order
exports.placeOrder = async (req, res) => {
  try {
    const { items, paymentMethod, canteen, pickupTime } = req.body;
    let totalAmount = 0;
    const orderItems = [];

    for (const item of items) {
      const foodItem = await FoodItem.findById(item.foodItem);
      if (!foodItem || !foodItem.isAvailable) {
        return res.status(400).json({ success: false, message: `Item ${foodItem?.name || 'unknown'} not available` });
      }
      totalAmount += foodItem.price * item.quantity;
      orderItems.push({ foodItem: foodItem._id, quantity: item.quantity, price: foodItem.price });
    }

    const order = await Order.create({
      customer: req.user.id,
      items: orderItems,
      totalAmount,
      paymentMethod,
      canteen,
      pickupTime
    });

    res.json({ success: true, data: await order.populate('customer items.foodItem canteen') });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get User Orders
exports.getUserOrders = async (req, res) => {
  try {
    const orders = await Order.find({ customer: req.user.id }).populate('items.foodItem canteen').sort({ createdAt: -1 });
    res.json({ success: true, data: orders });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Submit Rating
exports.submitRating = async (req, res) => {
  try {
    const { foodItem, rating, review } = req.body;
    const existingRating = await Rating.findOne({ customer: req.user.id, foodItem });
    
    if (existingRating) {
      existingRating.rating = rating;
      existingRating.review = review;
      await existingRating.save();
      await updateAverageRating(foodItem);
      return res.json({ success: true, data: existingRating });
    }

    const newRating = await Rating.create({ customer: req.user.id, foodItem, rating, review });
    await updateAverageRating(foodItem);
    res.json({ success: true, data: newRating });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getUserRatings = async (req, res) => {
  try {
    const ratings = await Rating.find({ customer: req.user.id }).populate('foodItem').sort({ createdAt: -1 });
    res.json({ success: true, data: ratings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteRating = async (req, res) => {
  try {
    const rating = await Rating.findOneAndDelete({ _id: req.params.id, customer: req.user.id });
    if (rating) await updateAverageRating(rating.foodItem);
    res.json({ success: true, message: 'Rating deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Helper function
async function updateAverageRating(foodItemId) {
  const ratings = await Rating.find({ foodItem: foodItemId });
  const avg = ratings.length > 0 ? ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length : 0;
  await FoodItem.findByIdAndUpdate(foodItemId, { averageRating: avg });
}


exports.checkCanteenStaff = async (req, res) => {
  try {
    const canteenStaff = await CanteenStaff.findOne({ user: req.user.id, isActive: true });
    res.json({ success: true, isCanteenStaff: !!canteenStaff });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
