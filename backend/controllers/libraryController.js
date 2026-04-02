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

exports.updateCategory = async (req, res) => {
  try {
    const category = await BookCategory.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!category) return res.status(404).json({ success: false, message: 'Category not found' });
    res.json({ success: true, data: category });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteCategory = async (req, res) => {
  try {
    const booksInCategory = await Book.countDocuments({ category: req.params.id, status: 'active' });
    if (booksInCategory > 0) {
      return res.status(400).json({ success: false, message: `Cannot delete: ${booksInCategory} book(s) exist in this category` });
    }
    await BookCategory.findByIdAndUpdate(req.params.id, { status: 'inactive' });
    res.json({ success: true, message: 'Category deleted' });
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

    // Auto-fulfill any pending/approved reservation for this member+book
    await BookReservation.findOneAndUpdate(
      { book_id, member_id, status: { $in: ['pending', 'approved'] } },
      { status: 'fulfilled', processed_by: req.user.id, processed_date: new Date() }
    );
    
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

    // Check if already issued to this member
    const alreadyIssued = await BookIssue.findOne({
      book_id,
      member_id: req.user.id,
      status: { $in: ['issued', 'renewed'] }
    });
    if (alreadyIssued) {
      return res.status(400).json({ success: false, message: 'You already have this book issued' });
    }

    // Check duplicate pending/approved request
    const existing = await BookReservation.findOne({
      book_id,
      member_id: req.user.id,
      status: { $in: ['pending', 'approved'] }
    });
    if (existing) {
      return res.status(400).json({ success: false, message: 'You already have a pending request for this book' });
    }

    const reservation = await BookReservation.create({ book_id, member_id: req.user.id });
    res.status(201).json({ success: true, data: reservation });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.cancelReservation = async (req, res) => {
  try {
    const reservation = await BookReservation.findOne({
      _id: req.params.id,
      member_id: req.user.id,
      status: 'pending'
    });
    if (!reservation) return res.status(404).json({ success: false, message: 'Reservation not found or cannot be cancelled' });
    reservation.status = 'cancelled';
    await reservation.save();
    res.json({ success: true, message: 'Reservation cancelled' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getReservations = async (req, res) => {
  try {
    // student, staff, admin — show own requests; librarian — show all
    const query = (req.user.role === 'librarian') ? {} : { member_id: req.user.id };
    const reservations = await BookReservation.find(query)
      .populate('book_id')
      .populate('member_id', 'name email class section role rollNumber')
      .sort({ createdAt: -1 });
    res.json({ success: true, data: reservations });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateReservation = async (req, res) => {
  try {
    const { status, due_date } = req.body;

    const reservation = await BookReservation.findById(req.params.id)
      .populate('book_id')
      .populate('member_id');
    if (!reservation) return res.status(404).json({ success: false, message: 'Reservation not found' });

    // If approving → auto issue the book
    if (status === 'approved') {
      const book = await Book.findById(reservation.book_id._id || reservation.book_id);
      if (!book || book.available_copies <= 0) {
        return res.status(400).json({ success: false, message: 'Book not available to issue' });
      }
      const memberId = reservation.member_id._id || reservation.member_id;
      const member = await User.findById(memberId);
      const maxBooks = member.role === 'student' ? 3 : 5;
      const activeIssues = await BookIssue.countDocuments({ member_id: memberId, status: { $in: ['issued','renewed'] } });
      if (activeIssues >= maxBooks) {
        return res.status(400).json({ success: false, message: `Member has reached maximum book limit (${maxBooks})` });
      }

      const issueDate = new Date();
      const dueDate = due_date ? new Date(due_date) : new Date(issueDate.getTime() + 14 * 24 * 60 * 60 * 1000);

      await BookIssue.create({
        book_id: book._id,
        member_id: memberId,
        issued_by: req.user.id,
        due_date: dueDate
      });

      book.available_copies -= 1;
      await book.save();

      reservation.status = 'fulfilled';
      reservation.processed_by = req.user.id;
      reservation.processed_date = new Date();
      await reservation.save();

      return res.json({ success: true, data: reservation, message: 'Book approved and issued successfully' });
    }

    // For reject / other status updates
    reservation.status = status;
    reservation.processed_by = req.user.id;
    reservation.processed_date = new Date();
    await reservation.save();

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
