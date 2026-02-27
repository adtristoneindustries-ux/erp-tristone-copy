# 📅 Exam Schedule Module

A comprehensive exam scheduling and management system for the School ERP with role-based features for Admin, Staff, and Students.

## ✨ Features Overview

### 🔐 Admin Features
- **Full Exam Management**
  - Schedule major exams (Mid Term, Final Exam, etc.)
  - Manual selection of exam details:
    - Exam name and type
    - Date, start time, end time, duration
    - Hall/Room assignment
    - Subject and class selection
    - Total marks configuration
  - **Invigilator Assignment**: Select and assign staff members as invigilators
  - Add custom instructions for each exam
  - Edit and update scheduled exams
  - Delete exams
  - Change exam status (Scheduled, Ongoing, Completed, Cancelled)
  
- **Advanced Filtering**
  - Filter by class
  - Filter by status
  - View all exams or specific categories

- **Conflict Detection**
  - Automatic detection of time slot conflicts
  - Prevents double-booking of exam halls
  - Validates exam scheduling

### 👨‍🏫 Staff Features
- **Test Scheduling**
  - Create minor tests, quizzes, and unit tests
  - Manual selection of:
    - Test name and type
    - Date and time
    - Class and subject
    - Hall/Room
    - Total marks
  - Add test instructions
  
- **Exam Management**
  - Edit own created tests
  - Delete own created tests
  - View all scheduled exams
  - Filter exams by class
  
- **Restrictions**
  - Cannot modify major exams created by admin
  - Can only manage tests they created

### 🎓 Student Features
- **Exam Schedule Viewing**
  - View complete exam timetable
  - See all scheduled exams for their class
  - Exam details include:
    - Exam name and type
    - Date and time
    - Duration
    - Hall/Room location
    - Subject and marks
    - Invigilator names
    - Instructions

- **Upcoming Exams Alert**
  - Prominent display of upcoming exams
  - Shows next 3 upcoming exams
  - Countdown display (days until exam)
  - Quick access to hall ticket download

- **Hall Ticket Download** 📄
  - Professional PDF hall tickets
  - Includes:
    - Student details (name, roll number, class)
    - Exam details (name, subject, date, time, hall)
    - Instructions
    - Important notes
    - Computer-generated timestamp
  - **Note**: Hall tickets NOT available for quizzes
  - Only for scheduled major exams and tests

### 🎨 UI/UX Features
- **Modern Card-Based Design**
  - Beautiful gradient cards
  - Color-coded exam types
  - Status badges
  - Hover effects and animations

- **Responsive Layout**
  - Works on desktop, tablet, and mobile
  - Grid layout adapts to screen size
  - Touch-friendly interface

- **Real-Time Updates**
  - Socket.IO integration
  - Instant updates when exams are created/modified
  - Live synchronization across all users

- **Recent Updates Priority**
  - Recently updated exams appear at the top
  - Sorted by date and creation time
  - Easy to spot new additions

## 🚀 Installation & Setup

### Quick Start
```bash
START_EXAM_MODULE.bat
```

This script will:
1. Install all dependencies
2. Check MongoDB connection
3. Start backend and frontend servers

### Manual Setup

#### Backend Setup
```bash
cd backend
npm install
npm run dev
```

#### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

## 📡 API Endpoints

### Exam Routes
- `GET /api/exams` - Get all exams (with filters)
- `GET /api/exams/upcoming` - Get upcoming exams
- `GET /api/exams/stats` - Get exam statistics
- `GET /api/exams/:id` - Get single exam
- `POST /api/exams` - Create exam (Admin/Staff)
- `PUT /api/exams/:id` - Update exam (Admin/Staff)
- `DELETE /api/exams/:id` - Delete exam (Admin/Staff)

### Query Parameters
- `classId` - Filter by class
- `status` - Filter by status (Scheduled, Ongoing, Completed, Cancelled)
- `startDate` - Filter exams from date
- `endDate` - Filter exams until date

## 🗄️ Database Schema

### Exam Model
```javascript
{
  examName: String,           // e.g., "First Term Mathematics Exam"
  examType: String,           // Major Exam, Minor Test, Quiz, Unit Test, Mid Term, Final Exam
  subject: ObjectId,          // Reference to Subject
  class: ObjectId,            // Reference to Class
  date: Date,                 // Exam date
  startTime: String,          // e.g., "09:00"
  endTime: String,            // e.g., "12:00"
  duration: Number,           // Duration in hours
  hall: String,               // Hall/Room name
  invigilators: [ObjectId],   // Array of staff references
  totalMarks: Number,         // Default: 100
  instructions: String,       // Exam instructions
  createdBy: ObjectId,        // Reference to User (admin/staff)
  status: String,             // Scheduled, Ongoing, Completed, Cancelled
  timestamps: true            // createdAt, updatedAt
}
```

## 🎯 Usage Guide

### For Admin

1. **Navigate to Exam Schedule**
   - Click "Exam Schedule" in sidebar
   - View all scheduled exams

2. **Schedule New Exam**
   - Click "Schedule Exam" button
   - Fill in exam details:
     - Exam name (e.g., "Mid Term Mathematics")
     - Select exam type
     - Choose class and subject
     - Set date and time
     - Enter duration
     - Assign hall/room
     - Set total marks
     - Select invigilators (hold Ctrl/Cmd for multiple)
     - Add instructions (optional)
   - Click "Schedule Exam"

3. **Edit Exam**
   - Click edit icon on exam card
   - Modify details
   - Click "Update Exam"

4. **Delete Exam**
   - Click delete icon
   - Confirm deletion

5. **Filter Exams**
   - Use class filter dropdown
   - Use status filter dropdown

### For Staff

1. **Navigate to Exam Schedule**
   - Click "Exam Schedule" in sidebar

2. **Schedule Test**
   - Click "Schedule Test" button
   - Fill in test details:
     - Test name
     - Select test type (Minor Test, Quiz, Unit Test)
     - Choose class and subject
     - Set date and time
     - Enter duration and hall
     - Set marks
     - Add instructions
   - Click "Schedule Test"

3. **Edit/Delete Own Tests**
   - Only tests you created can be edited/deleted
   - Major exams are view-only

4. **View All Exams**
   - See complete exam schedule
   - Filter by class

### For Students

1. **Navigate to Exam Schedule**
   - Click "Exam Schedule" in sidebar

2. **View Upcoming Exams**
   - See highlighted upcoming exams at top
   - Check countdown to exam
   - Download hall ticket directly

3. **View Complete Schedule**
   - Scroll down to see all exams
   - View exam details in cards

4. **Download Hall Ticket**
   - Click "Download Hall Ticket" button
   - PDF will be generated and downloaded
   - Hall ticket includes all exam details
   - **Note**: Not available for quizzes

## 🎨 Color Coding

### Exam Types
- **Major Exam**: Purple
- **Minor Test**: Blue
- **Quiz**: Green
- **Unit Test**: Yellow
- **Mid Term**: Orange
- **Final Exam**: Red

### Status
- **Scheduled**: Blue
- **Ongoing**: Yellow
- **Completed**: Green
- **Cancelled**: Red

## 🔒 Security Features

- JWT authentication required
- Role-based access control
- Staff can only modify their own tests
- Admin has full control
- Students have read-only access
- Conflict detection prevents scheduling errors

## 📱 Responsive Design

- **Desktop**: 3-column grid layout
- **Tablet**: 2-column grid layout
- **Mobile**: Single column layout
- Touch-friendly buttons and cards
- Optimized for all screen sizes

## 🔄 Real-Time Features

- Socket.IO integration
- Events:
  - `examCreated` - New exam scheduled
  - `examUpdated` - Exam modified
  - `examDeleted` - Exam removed
- Automatic UI updates
- No page refresh needed

## 📊 Statistics

- Total exams count
- Scheduled exams count
- Completed exams count
- Upcoming exams count
- Available via `/api/exams/stats` endpoint

## 🐛 Troubleshooting

### Exams not showing
- Check if MongoDB is running
- Verify user is logged in
- Check class assignment for students
- Refresh the page

### Hall ticket not downloading
- Ensure jsPDF is installed: `npm install jspdf`
- Check browser console for errors
- Verify exam is not a quiz
- Check exam status is "Scheduled"

### Cannot create exam
- Verify you have admin/staff role
- Check all required fields are filled
- Ensure no time slot conflicts
- Verify class and subject exist

### Socket updates not working
- Check backend server is running
- Verify Socket.IO connection
- Check browser console for errors
- Refresh the page

## 🎓 Best Practices

1. **Schedule exams well in advance**
   - Give students enough preparation time
   - Avoid last-minute scheduling

2. **Assign invigilators early**
   - Ensure staff availability
   - Assign multiple invigilators for large exams

3. **Add clear instructions**
   - Specify what students should bring
   - Mention any special requirements
   - Include exam pattern details

4. **Use appropriate exam types**
   - Major Exam for important assessments
   - Minor Test for chapter tests
   - Quiz for quick assessments

5. **Update exam status**
   - Mark as "Ongoing" when exam starts
   - Mark as "Completed" after exam
   - Cancel if needed with proper notification

## 📝 Notes

- Hall tickets are NOT generated for quizzes
- Students can only see exams for their class
- Staff can create tests but not major exams
- Admin has full control over all exams
- Exam conflicts are automatically detected
- Recent exams appear at the top
- All times are in 24-hour format

## 🚀 Future Enhancements

- Email notifications for upcoming exams
- SMS alerts for exam reminders
- Bulk exam scheduling
- Exam result integration
- Seating arrangement generation
- Admit card customization
- Exam analytics and reports
- Calendar view of exams
- Export exam schedule to PDF/Excel

## 📞 Support

For issues or questions:
1. Check this documentation
2. Verify MongoDB is running
3. Check browser console for errors
4. Ensure all dependencies are installed
5. Restart backend and frontend servers

## 📄 License

This module is part of the School ERP System and follows the same license.

---

**Developed with ❤️ for School ERP System**
