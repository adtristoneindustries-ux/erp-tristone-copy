const Fee = require('../models/Fee');

exports.getFees = async (req, res) => {
  try {
    const { student } = req.query;
    const query = student ? { student } : {};
    const fees = await Fee.find(query).populate('student', 'name email rollNumber');
    res.json(fees);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createFee = async (req, res) => {
  try {
    const fee = new Fee(req.body);
    await fee.save();
    req.io.emit('feeUpdate', fee);
    res.status(201).json(fee);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.updateFee = async (req, res) => {
  try {
    const fee = await Fee.findByIdAndUpdate(req.params.id, req.body, { new: true });
    req.io.emit('feeUpdate', fee);
    res.json(fee);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.addPayment = async (req, res) => {
  try {
    const fee = await Fee.findById(req.params.id);
    fee.payments.push(req.body);
    fee.paidAmount += req.body.amount;
    fee.dueAmount = fee.totalAmount - fee.paidAmount;
    fee.status = fee.dueAmount === 0 ? 'Paid' : 'Pending';
    await fee.save();
    req.io.emit('feeUpdate', fee);
    res.json(fee);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.deleteFee = async (req, res) => {
  try {
    await Fee.findByIdAndDelete(req.params.id);
    res.json({ message: 'Fee deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
