const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  getBooks,
  getBookById,
  createBook,
  updateBook,
  deleteBook,
  getCategories,
  createCategory,
  issueBook,
  returnBook,
  renewBook,
  getIssues,
  collectFine,
  createReservation,
  getReservations,
  updateReservation,
  getLibraryStats,
  getMostBorrowedBooks
} = require('../controllers/libraryController');

// Public routes (all authenticated users)
router.get('/books', protect, getBooks);
router.get('/books/:id', protect, getBookById);
router.get('/categories', protect, getCategories);
router.get('/issues', protect, getIssues);
router.get('/reservations', protect, getReservations);
router.get('/stats', protect, getLibraryStats);
router.get('/reports/most-borrowed', protect, authorize('admin', 'librarian'), getMostBorrowedBooks);

// Librarian only routes
router.post('/books', protect, authorize('librarian'), createBook);
router.put('/books/:id', protect, authorize('librarian'), updateBook);
router.delete('/books/:id', protect, authorize('librarian'), deleteBook);
router.post('/categories', protect, authorize('librarian'), createCategory);
router.post('/issues', protect, authorize('librarian'), issueBook);
router.put('/issues/:id/return', protect, authorize('librarian'), returnBook);
router.put('/issues/:id/collect-fine', protect, authorize('librarian'), collectFine);
router.put('/reservations/:id', protect, authorize('librarian'), updateReservation);

// Student routes
router.post('/reservations', protect, authorize('student', 'staff'), createReservation);
router.put('/issues/:id/renew', protect, authorize('student'), renewBook);

module.exports = router;
