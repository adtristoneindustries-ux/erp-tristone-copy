# Digital Classroom Feature - Implementation Guide

## 🎓 Overview

The Digital Classroom feature allows staff to upload study materials (videos, images, PDFs, documents) for specific classes and sections, and students can view and access these materials in a beautiful, responsive interface.

## ✨ Features

### Staff Features:
- ✅ Upload materials (Video, Image, PDF, Document)
- ✅ Add URL links for external resources
- ✅ Select specific class and section
- ✅ Select subject for the material
- ✅ Add title and description
- ✅ View all uploaded materials
- ✅ Delete materials
- ✅ Real-time sync with students

### Student Features:
- ✅ View materials by subject
- ✅ Beautiful card-based UI
- ✅ Modal popup to view all materials
- ✅ Download/View materials
- ✅ See video count per subject
- ✅ Real-time updates when staff uploads
- ✅ Fully responsive design

## 📦 Installation

### Step 1: Install Dependencies

Run the installation script:
```bash
INSTALL_DEPENDENCIES.bat
```

Or manually install:
```bash
cd frontend
npm install react-hot-toast@^2.4.1 react-icons@^4.11.0
```

### Step 2: Start the Application

Use the existing start script:
```bash
FIX_AND_START.bat
```

## 🎨 UI Design

### Student Dashboard
- **Subject Cards**: Each subject has a beautiful gradient card
- **Video Preview**: Shows first 2 recorded videos
- **View All Button**: Opens modal with all materials
- **Modal Popup**: Full-screen modal with all materials in grid layout
- **Material Cards**: Each material shows icon, title, description, type, size, and date
- **Action Buttons**: Watch Video, View Image, or Download based on type

### Staff Dashboard
- **Upload Button**: Prominent button to upload new materials
- **Material Grid**: Shows all uploaded materials in cards
- **Upload Modal**: Form with all fields (title, description, subject, class, section, file/URL)
- **File Type Support**: Video, Image, PDF, Document
- **URL Support**: Can add external links (YouTube, Google Drive, etc.)

## 🔧 Technical Details

### Backend
- **Model**: Material.js (already exists)
- **Controller**: materialController.js (already exists)
- **Routes**: materialRoutes.js (already exists)
- **File Upload**: Multer middleware (increased to 100MB limit)
- **Socket.IO**: Real-time updates for material upload/delete

### Frontend
- **Student Page**: `/student/digital-classroom`
- **Staff Page**: `/staff/digital-classroom`
- **Components**: 
  - StudentDigitalClassroom.jsx
  - StaffDigitalClassroom.jsx
- **Icons**: react-icons (FaBook, FaVideo, FaImage, FaFilePdf, etc.)
- **Notifications**: react-hot-toast

### Routes Added
```javascript
// Student
/student/digital-classroom

// Staff
/staff/digital-classroom
```

### Sidebar Menu
- Added "Digital Classroom" menu item for both Staff and Student
- Icon: Monitor (from lucide-react)

## 📱 Responsive Design

### Mobile (320px - 767px)
- Single column layout
- Full-width cards
- Touch-friendly buttons
- Modal takes full screen

### Tablet (768px - 1023px)
- 2 column grid
- Optimized spacing
- Modal with padding

### Desktop (1024px+)
- 3 column grid
- Hover effects
- Large modal with max-width

## 🚀 Usage Guide

### For Staff:

1. **Navigate to Digital Classroom**
   - Click "Digital Classroom" in sidebar

2. **Upload Material**
   - Click "Upload Material" button
   - Fill in the form:
     - Title (required)
     - Description (optional)
     - Subject (required)
     - Class (required)
     - Section (required)
     - Upload Type: File or URL
     - Select file or enter URL

3. **Manage Materials**
   - View all uploaded materials
   - Click "View" to open material
   - Click trash icon to delete

### For Students:

1. **Navigate to Digital Classroom**
   - Click "Digital Classroom" in sidebar

2. **Browse Subjects**
   - See all subjects with material count
   - View first 2 videos in each card

3. **View All Materials**
   - Click "View All Materials" button
   - Modal opens with all materials for that subject
   - Click action buttons to watch/view/download

## 🎯 File Type Support

### Supported Formats:
- **Videos**: MP4, AVI, MOV, WMV
- **Images**: JPG, JPEG, PNG, GIF
- **Documents**: PDF, DOC, DOCX
- **URLs**: Any external link

### File Size Limit:
- Maximum: 100MB per file

## 🔄 Real-Time Updates

The system uses Socket.IO for real-time synchronization:

- When staff uploads material → Students see it instantly
- When staff deletes material → Removed from student view instantly
- No page refresh needed

## 🎨 Color Scheme

- **Primary**: Blue (#3B82F6)
- **Success**: Green (#10B981)
- **Danger**: Red (#EF4444)
- **Warning**: Yellow (#F59E0B)
- **Gradient**: Blue to Blue-600

## 📊 Database Schema

```javascript
Material {
  title: String (required)
  description: String
  fileUrl: String (required)
  fileName: String
  fileSize: Number
  fileType: String (Video/Image/PDF/Document/Link)
  subject: ObjectId (ref: Subject)
  uploadedBy: ObjectId (ref: User)
  class: String (required)
  section: String (required)
  isNewMaterial: Boolean (default: true)
  createdAt: Date
  updatedAt: Date
}
```

## 🔒 Security

- **Authentication**: JWT token required
- **Authorization**: Role-based (staff can upload, students can view)
- **File Validation**: Only allowed file types
- **Size Limit**: 100MB maximum
- **Class/Section Filter**: Students only see their class materials

## 🐛 Troubleshooting

### Issue: Dependencies not installed
**Solution**: Run `INSTALL_DEPENDENCIES.bat`

### Issue: File upload fails
**Solution**: Check file size (max 100MB) and file type

### Issue: Materials not showing
**Solution**: 
- Check if class and section match
- Verify subject assignment
- Check browser console for errors

### Issue: Real-time updates not working
**Solution**: 
- Ensure Socket.IO is connected
- Check backend server is running
- Verify WebSocket connection in browser DevTools

## 📝 Notes

- Materials are filtered by class and section
- Staff can select "All Sections" to share with entire class
- File uploads are stored in `backend/uploads/` folder
- URL links are stored as references (no file upload)
- Students can only view materials for their assigned class/section

## 🎉 Success!

Your Digital Classroom feature is now ready to use! Staff can upload materials and students can access them in a beautiful, responsive interface with real-time updates.

## 📞 Support

If you encounter any issues:
1. Check MongoDB is running
2. Verify all dependencies are installed
3. Check backend and frontend servers are running
4. Review browser console for errors
5. Check backend logs for API errors
