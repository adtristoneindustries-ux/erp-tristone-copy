const { MenuItem, Order, Wallet, Special } = require('../models/Cafeteria');

// Get weekly menu
exports.getWeeklyMenu = async (req, res) => {
  try {
    const menu = await MenuItem.find({ available: true });
    res.json({ success: true, data: menu });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get wallet balance
exports.getWallet = async (req, res) => {
  try {
    let wallet = await Wallet.findOne({ student: req.user.id });
    if (!wallet) {
      wallet = await Wallet.create({ student: req.user.id, balance: 250 });
    }
    res.json({ success: true, data: wallet });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Add money to wallet
exports.addMoney = async (req, res) => {
  try {
    const { amount } = req.body;
    let wallet = await Wallet.findOne({ student: req.user.id });
    if (!wallet) {
      wallet = await Wallet.create({ student: req.user.id, balance: 0 });
    }
    wallet.balance += amount;
    wallet.transactions.push({
      type: 'credit',
      amount,
      description: 'Money added to wallet'
    });
    await wallet.save();
    res.json({ success: true, data: wallet });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get transaction history
exports.getTransactionHistory = async (req, res) => {
  try {
    const wallet = await Wallet.findOne({ student: req.user.id });
    res.json({ success: true, data: wallet?.transactions || [] });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get today's specials
exports.getTodaySpecials = async (req, res) => {
  try {
    const specials = await Special.find({ available: true });
    res.json({ success: true, data: specials });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Place order
exports.placeOrder = async (req, res) => {
  try {
    const { items, totalAmount } = req.body;
    const wallet = await Wallet.findOne({ student: req.user.id });
    
    if (!wallet || wallet.balance < totalAmount) {
      return res.status(400).json({ success: false, message: 'Insufficient balance' });
    }

    wallet.balance -= totalAmount;
    wallet.transactions.push({
      type: 'debit',
      amount: totalAmount,
      description: 'Order placed'
    });
    await wallet.save();

    const order = await Order.create({
      student: req.user.id,
      items,
      totalAmount
    });

    res.json({ success: true, data: order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get order history
exports.getOrderHistory = async (req, res) => {
  try {
    const orders = await Order.find({ student: req.user.id }).sort({ orderDate: -1 });
    res.json({ success: true, data: orders });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
