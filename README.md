# School ERP Web Application

A complete School ERP system built with React, Node.js, Express, and MongoDB featuring role-based authentication, real-time updates, and comprehensive management features.

## 🚀 Features

### Authentication
- Three separate login portals (Admin, Staff, Student)
- JWT-based authentication
- Password hashing with bcrypt
- Role-based access control

### Admin Dashboard
- Add/Edit/Delete Students and Staff
- Assign subjects to teachers
- View attendance and marks
- Dynamic analytics with charts
- Global search functionality

### Staff Dashboard
- Add/Update student marks (real-time sync)
- Mark attendance (real-time sync)
- Upload study materials
- All changes instantly reflect in student dashboard

### Student Dashboard
- View marks (auto-updated via WebSocket)
- View attendance records
- Access timetable
- Download study materials
- View announcements

### Real-Time Data Sync
- WebSocket integration using Socket.IO
- Instant updates when staff modifies marks/attendance
- Live dashboard statistics

## 📁 Project Structure

```
school-erp/
├── backend/
│   ├── config/
│   │   └── db.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── userController.js
│   │   ├── attendanceController.js
│   │   ├── markController.js
│   │   ├── subjectController.js
│   │   ├── materialController.js
│   │   ├── announcementController.js
│   │   ├── timetableController.js
│   │   └── dashboardController.js
│   ├── middleware/
│   │   └── auth.js
│   ├── models/
│   │   ├── User.js
│   │   ├── Subject.js
│   │   ├── Attendance.js
│   │   ├── Mark.js
│   │   ├── Material.js
│   │   ├── Announcement.js
│   │   └── Timetable.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── userRoutes.js
│   │   ├── attendanceRoutes.js
│   │   ├── markRoutes.js
│   │   ├── subjectRoutes.js
│   │   ├── materialRoutes.js
│   │   ├── announcementRoutes.js
│   │   ├── timetableRoutes.js
│   │   └── dashboardRoutes.js
│   ├── server.js
│   ├── seed.js
│   ├── package.json
│   └── .env
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Sidebar.jsx
│   │   │   ├── Navbar.jsx
│   │   │   ├── Card.jsx
│   │   │   ├── Table.jsx
│   │   │   └── Modal.jsx
│   │   ├── context/
│   │   │   ├── AuthContext.jsx
│   │   │   └── SocketContext.jsx
│   │   ├── pages/
│   │   │   ├── Login.jsx
│   │   │   ├── AdminDashboard.jsx
│   │   │   ├── AdminStudents.jsx
│   │   │   ├── AdminStaff.jsx
│   │   │   ├── StaffDashboard.jsx
│   │   │   ├── StaffMarks.jsx
│   │   │   ├── StaffAttendance.jsx
│   │   │   ├── StaffMaterials.jsx
│   │   │   ├── StudentDashboard.jsx
│   │   │   ├── StudentMarks.jsx
│   │   │   ├── StudentAttendance.jsx
│   │   │   ├── StudentMaterials.jsx
│   │   │   ├── StudentTimetable.jsx
│   │   │   └── StudentAnnouncements.jsx
│   │   ├── services/
│   │   │   └── api.js
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── index.html
└── README.md
```

## 🛠️ Installation & Setup

### ⚡ QUICK START (Recommended)

**Just run this script:**
```bash
FIX_AND_START.bat
```

This automatically:
- ✅ Checks MongoDB
- ✅ Installs all dependencies
- ✅ Seeds database with sample data
- ✅ Starts both servers

**Then open:** http://localhost:3000

---

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (v5 or higher)
- npm or yarn

### Backend Setup

1. Navigate to backend directory:
```bash
cd school-erp/backend
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables (already created in `.env`):
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/school_erp
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
NODE_ENV=development
```

4. Start MongoDB:
```bash
# Windows
net start MongoDB

# macOS/Linux
sudo systemctl start mongod
```

5. Seed the database with sample data:
```bash
node seed.js
```

6. Start the backend server:
```bash
npm run dev
```

Backend will run on `http://localhost:5000`

### Frontend Setup

1. Open a new terminal and navigate to frontend directory:
```bash
cd school-erp/frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

Frontend will run on `http://localhost:3000`

## 🔑 Demo Credentials

After seeding the database, use these credentials:

**Admin Login:**
- Email: `admin@school.com`
- Password: `admin123`

**Staff Login:**
- Email: `staff@school.com`
- Password: `staff123`

**Student Login:**
- Email: `student@school.com`
- Password: `student123`

## 📡 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user

### Users
- `GET /api/users` - Get all users (with role filter)
- `GET /api/users/:id` - Get user by ID
- `POST /api/users` - Create user (Admin only)
- `PUT /api/users/:id` - Update user (Admin only)
- `DELETE /api/users/:id` - Delete user (Admin only)

### Subjects
- `GET /api/subjects` - Get all subjects
- `POST /api/subjects` - Create subject (Admin only)
- `PUT /api/subjects/:id` - Update subject (Admin only)
- `DELETE /api/subjects/:id` - Delete subject (Admin only)

### Attendance
- `GET /api/attendance` - Get attendance records
- `POST /api/attendance` - Create attendance (Admin/Staff)
- `PUT /api/attendance/:id` - Update attendance (Admin/Staff)
- `DELETE /api/attendance/:id` - Delete attendance (Admin/Staff)

### Marks
- `GET /api/marks` - Get marks
- `POST /api/marks` - Create marks (Admin/Staff)
- `PUT /api/marks/:id` - Update marks (Admin/Staff)
- `DELETE /api/marks/:id` - Delete marks (Admin/Staff)

### Materials
- `GET /api/materials` - Get study materials
- `POST /api/materials` - Upload material (Admin/Staff)
- `DELETE /api/materials/:id` - Delete material (Admin/Staff)

### Announcements
- `GET /api/announcements` - Get announcements
- `POST /api/announcements` - Create announcement (Admin/Staff)
- `DELETE /api/announcements/:id` - Delete announcement (Admin)

### Timetable
- `GET /api/timetable` - Get timetable
- `POST /api/timetable` - Create timetable (Admin)
- `PUT /api/timetable/:id` - Update timetable (Admin)

### Dashboard
- `GET /api/dashboard/admin` - Get admin statistics
- `GET /api/dashboard/student` - Get student statistics

## 🔄 Real-Time Updates

The application uses Socket.IO for real-time data synchronization:

- When staff updates marks → Student dashboard updates instantly
- When staff marks attendance → Student attendance view updates instantly
- WebSocket events: `markUpdate`, `attendanceUpdate`

## 🎨 UI Features

- Fully responsive design (mobile, tablet, desktop)
- Tailwind CSS for styling
- Modern card-based layouts
- Interactive charts using Recharts
- Clean sidebar navigation
- Modal forms for CRUD operations
- Search functionality
- Status badges and color coding

## 🔒 Security Features

- JWT token-based authentication
- Password hashing with bcrypt
- Role-based access control middleware
- Protected API routes
- Secure HTTP headers

## 📱 Responsive Design

The application is fully responsive and works seamlessly on:
- Desktop (1920px and above)
- Laptop (1024px - 1919px)
- Tablet (768px - 1023px)
- Mobile (320px - 767px)

## 🚀 Production Deployment

### Backend
1. Set `NODE_ENV=production` in `.env`
2. Use a production MongoDB instance (MongoDB Atlas recommended)
3. Change `JWT_SECRET` to a strong random string
4. Deploy to services like Heroku, AWS, or DigitalOcean

### Frontend
1. Build the production bundle:
```bash
npm run build
```
2. Deploy the `dist` folder to Netlify, Vercel, or AWS S3

## 🧪 Testing the Application

1. Login as Admin and create students/staff
2. Login as Staff and add marks for students
3. Login as Student and verify marks appear instantly
4. Test attendance marking and real-time updates
5. Upload materials as Staff and access as Student

## 📝 Notes

- MongoDB must be running before starting the backend
- Run `node seed.js` to populate sample data
- WebSocket connection requires both frontend and backend running
- All passwords are hashed before storing in database
- File uploads use URL references (integrate with cloud storage for production)

## 🤝 Support

For issues or questions, please check:
- MongoDB connection is active
- All dependencies are installed
- Ports 3000 and 5000 are available
- Environment variables are correctly set

## 📄 License

This project is open-source and available for educational purposes.
