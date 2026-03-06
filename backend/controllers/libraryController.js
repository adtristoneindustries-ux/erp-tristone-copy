const Book = require('../models/Book');
const BookCategory = require('../models/BookCategory');
const BookIssue = require('../models/BookIssue');
const BookReservation = require('../models/BookReservation');
const User = require('../models/User');

// Book Management
exports.getBooks = async (req, res) => {
  try {
    const { search, category, language, availability } = req.query;
    const query = { status: 'active' };
    
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { author: { $regex: search, $options: 'i' } },
        { isbn: { $regex: search, $options: 'i' } }
      ];
    }
    if (category) query.category = category;
    if (language) query.language = language;
    if (availability === 'available') query.available_copies = { $gt: 0 };
    
    const books = await Book.find(query).populate('category').sort({ createdAt: -1 });
    res.json({ success: true, data: books });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getBookById = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id).populate('category');
    if (!book) return res.status(404).json({ success: false, message: 'Book not found' });
    res.json({ success: true, data: book });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.createBook = async (req, res) => {
  try {
    const barcode = `BK${Date.now()}`;
    const book = await Book.create({ ...req.body, barcode });
    res.status(201).json({ success: true, data: book });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateBook = async (req, res) => {
  try {
    const book = await Book.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!book) return res.status(404).json({ success: false, message: 'Book not found' });
    res.json({ success: true, data: book });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteBook = async (req, res) => {
  try {
    const book = await Book.findByIdAndUpdate(req.params.id, { status: 'inactive' }, { new: true });
    if (!book) return res.status(404).json({ success: false, message: 'Book not found' });
    res.json({ success: true, message: 'Book deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Category Management
exports.getCategories = async (req, res) => {
  try {
    const categories = await BookCategory.find({ status: 'active' });
    res.json({ success: true, data: categories });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.createCategory = async (req, res) => {
  try {
    const category = await BookCategory.create(req.body);
    res.status(201).json({ success: true, data: category });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Issue Management
exports.issueBook = async (req, res) => {
  try {
    const { book_id, member_id, due_date } = req.body;
    
    const book = await Book.findById(book_id);
    if (!book || book.available_copies <= 0) {
      return res.status(400).json({ success: false, message: 'Book not available' });
    }
    
    const member = await User.findById(member_id);
    const maxBooks = member.role === 'student' ? 3 : 5;
    const activeIssues = await BookIssue.countDocuments({ member_id, status: 'issued' });
    
    if (activeIssues >= maxBooks) {
      return res.status(400).json({ success: false, message: `Maximum ${maxBooks} books allowed` });
    }
    
    const issue = await BookIssue.create({
      book_id,
      member_id,
      issued_by: req.user.id,
      due_date
    });
    
    book.available_copies -= 1;
    await book.save();
    
    res.status(201).json({ success: true, data: issue });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.returnBook = async (req, res) => {
  try {
    const issue = await BookIssue.findById(req.params.id);
    if (!issue) return res.status(404).json({ success: false, message: 'Issue not found' });
    
    const returnDate = new Date();
    const dueDate = new Date(issue.due_date);
    const daysLate = Math.max(0, Math.ceil((returnDate - dueDate) / (1000 * 60 * 60 * 24)));
    const fineAmount = daysLate * 5; // ₹5 per day
    
    issue.return_date = returnDate;
    issue.fine_amount = fineAmount;
    issue.status = 'returned';
    await issue.save();
    
    const book = await Book.findById(issue.book_id);
    book.available_copies += 1;
    await book.save();
    
    res.json({ success: true, data: issue });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.renewBook = async (req, res) => {
  try {
    const issue = await BookIssue.findById(req.params.id);
    if (!issue || issue.renewal_count >= 2) {
      return res.status(400).json({ success: false, message: 'Renewal not allowed' });
    }
    
    const newDueDate = new Date(issue.due_date);
    newDueDate.setDate(newDueDate.getDate() + 14);
    
    issue.due_date = newDueDate;
    issue.renewal_count += 1;
    issue.status = 'renewed';
    await issue.save();
    
    res.json({ success: true, data: issue });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getIssues = async (req, res) => {
  try {
    const { member_id, status } = req.query;
    const query = {};
    
    if (member_id) query.member_id = member_id;
    if (status) query.status = status;
    if (req.user.role === 'student') query.member_id = req.user.id;
    
    const issues = await BookIssue.find(query)
      .populate('book_id')
      .populate('member_id', 'name email register_number')
      .sort({ createdAt: -1 });
    
    res.json({ success: true, data: issues });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.collectFine = async (req, res) => {
  try {
    const issue = await BookIssue.findByIdAndUpdate(
      req.params.id,
      { fine_paid: true },
      { new: true }
    );
    res.json({ success: true, data: issue });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Reservation Management
exports.createReservation = async (req, res) => {
  try {
    const { book_id } = req.body;
    
    const existing = await BookReservation.findOne({
      book_id,
      member_id: req.user.id,
      status: 'pending'
    });
    
    if (existing) {
      return res.status(400).json({ success: false, message: 'Already reserved' });
    }
    
    const reservation = await BookReservation.create({
      book_id,
      member_id: req.user.id
    });
    
    res.status(201).json({ success: true, data: reservation });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getReservations = async (req, res) => {
  try {
    const query = req.user.role === 'student' ? { member_id: req.user.id } : {};
    const reservations = await BookReservation.find(query)
      .populate('book_id')
      .populate('member_id', 'name email')
      .sort({ createdAt: -1 });
    
    res.json({ success: true, data: reservations });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateReservation = async (req, res) => {
  try {
    const { status } = req.body;
    const reservation = await BookReservation.findByIdAndUpdate(
      req.params.id,
      { status, processed_by: req.user.id, processed_date: Date.now() },
      { new: true }
    );
    res.json({ success: true, data: reservation });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Dashboard Stats
exports.getLibraryStats = async (req, res) => {
  try {
    const totalBooks = await Book.countDocuments({ status: 'active' });
    const totalCategories = await BookCategory.countDocuments({ status: 'active' });
    const issuedBooks = await BookIssue.countDocuments({ status: 'issued' });
    const availableBooks = await Book.aggregate([
      { $match: { status: 'active' } },
      { $group: { _id: null, total: { $sum: '$available_copies' } } }
    ]);
    const reservedBooks = await BookReservation.countDocuments({ status: 'pending' });
    const lostBooks = await BookIssue.countDocuments({ status: 'lost' });
    const overdueBooks = await BookIssue.countDocuments({
      status: 'issued',
      due_date: { $lt: new Date() }
    });
    const totalFines = await BookIssue.aggregate([
      { $match: { fine_paid: false } },
      { $group: { _id: null, total: { $sum: '$fine_amount' } } }
    ]);
    
    res.json({
      success: true,
      data: {
        totalBooks,
        totalCategories,
        issuedBooks,
        availableBooks: availableBooks[0]?.total || 0,
        reservedBooks,
        lostBooks,
        overdueBooks,
        totalFines: totalFines[0]?.total || 0
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getMostBorrowedBooks = async (req, res) => {
  try {
    const books = await BookIssue.aggregate([
      { $group: { _id: '$book_id', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
      { $lookup: { from: 'books', localField: '_id', foreignField: '_id', as: 'book' } },
      { $unwind: '$book' }
    ]);
    res.json({ success: true, data: books });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
