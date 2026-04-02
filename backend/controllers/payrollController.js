const Payroll = require('../models/Payroll');
const User = require('../models/User');

exports.getPayrolls = async (req, res) => {
  try {
    const { month, year } = req.query;
    const query = {};
    if (month) query.month = month;
    if (year) query.year = parseInt(year);
    const payrolls = await Payroll.find(query).populate('staff', 'name email designation department').sort({ createdAt: -1 });
    res.json(payrolls);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createPayroll = async (req, res) => {
  try {
    const payroll = new Payroll(req.body);
    await payroll.save();
    res.status(201).json(payroll);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.updatePayroll = async (req, res) => {
  try {
    if (req.body.status === 'Paid') req.body.paidOn = new Date();
    const payroll = await Payroll.findByIdAndUpdate(req.params.id, req.body, { new: true }).populate('staff', 'name email designation');
    res.json(payroll);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.deletePayroll = async (req, res) => {
  try {
    await Payroll.findByIdAndDelete(req.params.id);
    res.json({ message: 'Payroll record deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.generateMonthlyPayroll = async (req, res) => {
  try {
    const { month, year, basicSalary } = req.body;
    const staffList = await User.find({ role: 'staff' }).select('_id name');
    const records = staffList.map(s => ({
      staff: s._id,
      month,
      year: parseInt(year),
      basicSalary: basicSalary || 45000,
      allowances: 5000,
      deductions: 2000,
      netSalary: (basicSalary || 45000) + 5000 - 2000,
      status: 'Pending'
    }));
    await Payroll.insertMany(records, { ordered: false });
    res.status(201).json({ message: `Generated payroll for ${records.length} staff` });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
