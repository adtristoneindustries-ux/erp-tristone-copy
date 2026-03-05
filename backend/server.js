require('dotenv').config();
const express = require('express');
const cors = require('cors');
const http = require('http');
const path = require('path');
const { Server } = require('socket.io');
const connectDB = require('./config/db');
const User = require('./models/User');

const app = express();
const server = http.createServer(app);

// CORS configuration
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Socket.IO with CORS
const io = new Server(server, {
  cors: {
    origin: ['http://localhost:3000', 'http://localhost:3001'],
    methods: ['GET', 'POST']
  }
});

// Connect to database
connectDB();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Add io to request object
app.use((req, res, next) => {
  req.io = io;
  next();
});

// Make io available to controllers
app.set('io', io);

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/classes', require('./routes/classRoutes'));
app.use('/api/subjects', require('./routes/subjectRoutes'));
app.use('/api/attendance', require('./routes/attendanceRoutes'));
app.use('/api/staff-attendance', require('./routes/staffAttendanceRoutes'));
app.use('/api/leave-requests', require('./routes/leaveRequestRoutes'));
app.use('/api/marks', require('./routes/markRoutes'));
app.use('/api/materials', require('./routes/materialRoutes'));
app.use('/api/announcements', require('./routes/announcementRoutes'));
app.use('/api/timetable', require('./routes/timetableRoutes'));
app.use('/api/dashboard', require('./routes/dashboardRoutes'));
app.use('/api/homework', require('./routes/homeworkRoutes'));
app.use('/api/cafeteria', require('./routes/cafeteriaRoutes'));
app.use('/api/transport', require('./routes/transportRoutes'));
app.use('/api/hostel', require('./routes/hostelRoutes'));
app.use('/api/feedback', require('./routes/feedbackRoutes'));
app.use('/api/exams', require('./routes/examRoutes'));
app.use('/api/discipline', require('./routes/disciplineRoutes'));
app.use('/api/settings', require('./routes/settingsRoutes'));
app.use('/api/scholarships', require('./routes/scholarshipRoutes'));
app.use('/api/finance', require('./routes/financeRoutes'));
app.use('/api/chat', require('./routes/chatRoutes'));
app.use('/api/placement', require('./routes/placementRoutes'));
app.use('/api/activities', require('./routes/activityRoutes'));
app.use('/api/courses', require('./routes/courseRoutes'));
app.use('/api/library', require('./routes/libraryRoutes'));

// Health check endpoint
app.get('/', (req, res) => {
  res.json({ message: 'School ERP Backend Server is running!' });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ message: `Route ${req.originalUrl} not found` });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

// Socket.IO connection
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
  
  // User comes online
  socket.on('userOnline', async (userId) => {
    try {
      await User.findByIdAndUpdate(userId, { 
        isOnline: true, 
        socketId: socket.id,
        lastSeen: new Date()
      });
      io.emit('userStatusChange', { userId, isOnline: true });
    } catch (error) {
      console.error('Error updating user online status:', error);
    }
  });
  
  // User goes offline
  socket.on('disconnect', async () => {
    console.log('Client disconnected:', socket.id);
    try {
      const user = await User.findOne({ socketId: socket.id });
      if (user) {
        await User.findByIdAndUpdate(user._id, { 
          isOnline: false,
          lastSeen: new Date(),
          socketId: null
        });
        io.emit('userStatusChange', { userId: user._id, isOnline: false });
      }
    } catch (error) {
      console.error('Error updating user offline status:', error);
    }
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
  console.log(`🌐 API available at http://localhost:${PORT}/api`);
});

module.exports = app;