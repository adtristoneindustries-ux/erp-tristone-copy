const jwt = require('jsonwebtoken');
const User = require('../models/User');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

exports.login = async (req, res) => {
  try {
    const { email, password, role } = req.body;

    // Validate required fields
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    // Find user by email only (ignore role for librarian)
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'User not found with this email' });
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid password' });
    }

    // If role was specified, verify it matches (allow librarian to login as staff)
    if (role && user.role !== role) {
      if (!(role === 'staff' && user.role === 'librarian')) {
        return res.status(401).json({ message: `User is not a ${role}` });
      }
    }

    const token = generateToken(user._id);
    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        class: user.class,
        section: user.section,
        rollNumber: user.rollNumber,
        hasPlacementAccess: user.hasPlacementAccess
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    res.json({
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      class: user.class,
      section: user.section,
      rollNumber: user.rollNumber,
      hasPlacementAccess: user.hasPlacementAccess,
      year: user.year,
      department: user.department,
      cgpa: user.cgpa,
      arrears_count: user.arrears_count,
      resume_url: user.resume_url,
      skills: user.skills,
      portfolio_link: user.portfolio_link
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
