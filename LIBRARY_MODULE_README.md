# Library Management Module - Documentation

## Overview
Complete Library Management System integrated into the School ERP with role-based access control for Admin, Librarian, and Students.

## Features Implemented

### 1. Admin Dashboard (Monitoring Only)
**Route:** `/admin/library`

**Features:**
- Library Overview Statistics
  - Total Books Count
  - Total Categories
  - Total Issued Books
  - Available Books
  - Reserved Books
  - Lost Books
  - Overdue Books
  - Total Pending Fines

- Visual Analytics
  - Most Borrowed Books (Bar Chart)
  - Library Statistics (Pie Chart)
  - Overdue Books Table with Fine Calculation

**Access:** Admin role only - Read-only monitoring

---

### 2. Librarian Dashboard (Full Control)

#### Book Management
**Route:** `/staff/library/books`

**Features:**
- Add New Book with fields:
  - Title, ISBN, Author, Publisher, Edition
  - Category, Language
  - Total Copies, Available Copies
  - Rack Number, Shelf Number
  - Description
  - Auto-generated Barcode
  
- Edit Book Details
- Delete Book (Soft Delete)
- Search & Filter Books
  - Search by Title, Author, ISBN
  - Filter by Category
  - Filter by Language
  
- View Book Location (Rack/Shelf)
- QR Code Generation Support

#### Issue & Return Management
**Route:** `/staff/library/issues`

**Features:**
- Issue Book to Student/Staff
  - Automatic validation (max 3 books for students, 5 for staff)
  - Set due date
  - Check book availability
  
- Return Book
  - Automatic fine calculation (₹5 per day overdue)
  - Update book availability
  
- Collect Fine
- View Active Issues
- View Returned Books History
- Overdue Highlighting

#### Reservation Management
**Route:** `/staff/library/reservations`

**Features:**
- View Pending Reservations
- Approve Reservation
- Reject Reservation
- View Processed Reservations History

**Access:** Librarian role only

---

### 3. Student Dashboard

**Route:** `/student/library`

**Features:**

#### Search Books Tab
- Advanced Search
  - Search by Title, Author, ISBN
  - Filter by Category
  - Filter by Language
  - Filter by Availability
  
- Book Cards Display
  - Book Details (Title, Author, Publisher)
  - Category Badge
  - Availability Status
  - Reserve Button (if unavailable)

#### My Books Tab
- View Currently Issued Books
- Book Details with Issue/Due Dates
- Overdue Status Highlighting
- Fine Amount Display
- Renew Book (max 2 renewals, 14 days each)
- Renewal Counter

#### My Reservations Tab
- View All Reservations
- Reservation Status (Pending/Approved/Rejected)
- Request Date

#### Statistics Dashboard
- Books Issued Count
- Active Reservations Count
- Pending Fines Amount

**Access:** Student role only

---

## Database Schema

### Book Model
```javascript
{
  title: String (required),
  isbn: String (required, unique),
  author: String (required),
  publisher: String (required),
  edition: String,
  category: ObjectId (ref: BookCategory),
  language: String (default: 'English'),
  total_copies: Number (required),
  available_copies: Number (required),
  rack_number: String,
  shelf_number: String,
  cover_image: String,
  description: String,
  barcode: String (auto-generated),
  status: String (active/inactive)
}
```

### BookCategory Model
```javascript
{
  name: String (required, unique),
  description: String,
  status: String (active/inactive)
}
```

### BookIssue Model
```javascript
{
  book_id: ObjectId (ref: Book),
  member_id: ObjectId (ref: User),
  issued_by: ObjectId (ref: User),
  issue_date: Date,
  due_date: Date,
  return_date: Date,
  fine_amount: Number (default: 0),
  fine_paid: Boolean (default: false),
  status: String (issued/returned/lost/damaged/renewed),
  renewal_count: Number (default: 0),
  notes: String
}
```

### BookReservation Model
```javascript
{
  book_id: ObjectId (ref: Book),
  member_id: ObjectId (ref: User),
  reservation_date: Date,
  status: String (pending/approved/rejected/cancelled/fulfilled),
  processed_by: ObjectId (ref: User),
  processed_date: Date,
  notes: String
}
```

---

## API Endpoints

### Books
- `GET /api/library/books` - Get all books (with search/filter)
- `GET /api/library/books/:id` - Get book by ID
- `POST /api/library/books` - Create book (Librarian only)
- `PUT /api/library/books/:id` - Update book (Librarian only)
- `DELETE /api/library/books/:id` - Delete book (Librarian only)

### Categories
- `GET /api/library/categories` - Get all categories
- `POST /api/library/categories` - Create category (Librarian only)

### Issues
- `GET /api/library/issues` - Get issues (filtered by role)
- `POST /api/library/issues` - Issue book (Librarian only)
- `PUT /api/library/issues/:id/return` - Return book (Librarian only)
- `PUT /api/library/issues/:id/renew` - Renew book (Student)
- `PUT /api/library/issues/:id/collect-fine` - Collect fine (Librarian only)

### Reservations
- `GET /api/library/reservations` - Get reservations (filtered by role)
- `POST /api/library/reservations` - Create reservation (Student only)
- `PUT /api/library/reservations/:id` - Update reservation (Librarian only)

### Dashboard
- `GET /api/library/stats` - Get library statistics
- `GET /api/library/reports/most-borrowed` - Get most borrowed books

---

## Business Rules

### Book Limits
- Students: Maximum 3 books at a time
- Staff: Maximum 5 books at a time

### Renewal Policy
- Maximum 2 renewals per book
- Each renewal extends due date by 14 days
- Cannot renew overdue books

### Fine Calculation
- ₹5 per day for overdue books
- Calculated automatically on return
- Must be collected before issuing new books

### Reservation Rules
- Can only reserve unavailable books
- One reservation per book per student
- Librarian can approve/reject reservations

---

## Installation & Setup

### 1. Backend Setup

The models, controllers, and routes are already created. Run the seed script:

```bash
cd backend
node seedLibrary.js
```

This will create:
- 8 book categories
- 5 sample books

### 2. Frontend Setup

All pages are created and routes are configured in App.jsx and Sidebar.jsx.

### 3. User Roles

To test the librarian features, create a user with role `librarian`:

```javascript
// In MongoDB or through admin panel
{
  name: "Library Staff",
  email: "librarian@school.com",
  password: "librarian123", // Will be hashed
  role: "librarian"
}
```

---

## Usage Guide

### For Admin
1. Navigate to `/admin/library`
2. View statistics and analytics
3. Monitor overdue books and fines
4. View most borrowed books report

### For Librarian
1. Navigate to `/staff/library/books`
2. Add/Edit/Delete books
3. Go to `/staff/library/issues` to issue/return books
4. Go to `/staff/library/reservations` to manage reservations
5. Collect fines from overdue returns

### For Students
1. Navigate to `/student/library`
2. Search for books using filters
3. Reserve unavailable books
4. View issued books in "My Books" tab
5. Renew books before due date
6. Check reservations status

---

## UI Features

### Responsive Design
- Mobile-first approach
- Tablet and desktop optimized
- Touch-friendly buttons
- Collapsible mobile menu

### Modern UI Components
- Clean card layouts
- Data tables with sorting
- Modal forms
- Status badges
- Color-coded alerts
- Charts and graphs (Recharts)
- Search bars with icons
- Filter dropdowns

### Color Scheme
- Blue: Primary actions
- Green: Success/Available
- Red: Overdue/Errors
- Yellow: Pending/Warnings
- Purple: Reservations

---

## Security Features

- Role-based access control
- JWT authentication
- Protected API routes
- Input validation
- SQL injection prevention (MongoDB)
- XSS protection

---

## Performance Optimizations

- Indexed database queries
- Pagination support (ready to implement)
- Lazy loading
- Optimized API calls
- Efficient state management

---

## Future Enhancements (Optional)

- Book cover image upload
- QR code scanning
- Email notifications
- SMS alerts for due dates
- Book recommendations
- Reading history analytics
- Digital library integration
- Barcode printing
- Advanced reporting
- Export to Excel/PDF

---

## Testing

### Test Scenarios

1. **Book Management**
   - Add book with all fields
   - Edit book details
   - Delete book
   - Search books

2. **Issue/Return**
   - Issue book to student
   - Return book on time (no fine)
   - Return book late (with fine)
   - Exceed book limit

3. **Reservations**
   - Reserve unavailable book
   - Approve reservation
   - Reject reservation

4. **Student Features**
   - Search books
   - Renew book
   - View fines

---

## Support

For issues or questions:
- Check MongoDB connection
- Verify user roles
- Check API endpoints
- Review browser console for errors

---

## License

Part of School ERP System - Educational Use
