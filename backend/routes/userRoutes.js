const express = require('express');
const { createUser, getUsers, getUser, updateUser, deleteUser, createStaffWithDocs, uploadMiddleware } = require('../controllers/userController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.route('/')
  .get(getUsers)
  .post(authorize('admin'), createUser);

// New route for staff creation with documents
router.post('/staff-with-docs', authorize('admin'), uploadMiddleware, createStaffWithDocs);

router.route('/:id')
  .get(getUser)
  .put(authorize('admin'), updateUser)
  .delete(authorize('admin'), deleteUser);

module.exports = router;
