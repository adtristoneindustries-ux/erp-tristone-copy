# 🎓 Exam Schedule Module - Tamil Guide

## 🚀 Eppadi Start Pannurathu

### Method 1: Easy Way (Recommended)
```bash
START_EXAM_MODULE.bat
```
Ithu double click pannunga. Ellam automatic ah setup aagum!

### Method 2: Manual Way
```bash
# Terminal 1 - Backend
cd backend
npm install
npm run dev

# Terminal 2 - Frontend  
cd frontend
npm install
npm run dev
```

## 📱 Eppadi Use Pannurathu

### 🔐 Admin Features

**Exam Schedule Page ku Ponga:**
1. Login pannunga (admin@school.com / admin123)
2. Sidebar la "Exam Schedule" click pannunga

**Exam Create Pannurathu:**
1. "Schedule Exam" button click pannunga
2. Fill pannunga:
   - Exam name (e.g., "Mid Term Mathematics")
   - Exam type select pannunga
   - Class and Subject select pannunga
   - Date and Time set pannunga
   - Duration enter pannunga (hours la)
   - Hall number enter pannunga
   - Total marks enter pannunga
   - Invigilators assign pannunga (Ctrl hold panni multiple select pannalam)
   - Instructions add pannunga (optional)
3. "Schedule Exam" click pannunga

**Exam Edit Pannurathu:**
- Exam card la edit icon click pannunga
- Details change pannunga
- "Update Exam" click pannunga

**Exam Delete Pannurathu:**
- Delete icon click pannunga
- Confirm pannunga

**Filter Pannurathu:**
- Class dropdown la select pannunga
- Status dropdown la select pannunga

### 👨🏫 Staff Features

**Test Schedule Pannurathu:**
1. Login pannunga (staff@school.com / staff123)
2. "Exam Schedule" page ku ponga
3. "Schedule Test" button click pannunga
4. Details fill pannunga:
   - Test name
   - Test type (Minor Test, Quiz, Unit Test)
   - Class and Subject
   - Date, Time, Duration
   - Hall number
   - Total marks
   - Instructions
5. "Schedule Test" click pannunga

**Important:**
- Ungaloda tests mattum than edit/delete panna mudiyum
- Admin create panna major exams ah edit panna mudiyathu
- Ella exams um view panna mudiyum

### 🎓 Student Features

**Exam Schedule Paakurathu:**
1. Login pannunga (student@school.com / student123)
2. "Exam Schedule" page ku ponga
3. Top la upcoming exams display aagum
4. Countdown um kaatum (e.g., "In 5 days")

**Hall Ticket Download Pannurathu:**
1. Exam card la "Download Hall Ticket" button click pannunga
2. PDF automatic ah download aagum
3. Hall ticket la irukum:
   - Unga details (name, roll number, class)
   - Exam details (name, subject, date, time, hall)
   - Instructions
   - Important notes

**Note:** Quiz ku hall ticket kidaiyathu!

## 🎨 Color Meanings

### Exam Types
- **Purple** = Major Exam
- **Blue** = Minor Test
- **Green** = Quiz
- **Yellow** = Unit Test
- **Orange** = Mid Term
- **Red** = Final Exam

### Status
- **Blue** = Scheduled (Plan panna)
- **Yellow** = Ongoing (Nadakuthu)
- **Green** = Completed (Mudinjiruchu)
- **Red** = Cancelled (Cancel aagiruchi)

## ✨ Special Features

### Admin
✅ Ella exams um create panna mudiyum
✅ Invigilators assign panna mudiyum
✅ Ella exams um edit/delete panna mudiyum
✅ Class and status filter pannalam
✅ Conflict detection (same time la vera exam iruntha alert varum)

### Staff
✅ Small tests create panna mudiyum
✅ Own tests edit/delete pannalam
✅ Ella exams um view pannalam
✅ Class filter pannalam

### Student
✅ Ella exams um view pannalam
✅ Upcoming exams alert kaatum
✅ Hall ticket download pannalam (PDF)
✅ Countdown display (exam ku evlo days iruku)
✅ Beautiful card layout

## 🔄 Real-Time Updates

- Yaravathu exam create pannuna, automatic ah ella users kum update aagum
- Page refresh panna theva illa
- Socket.IO use panrom

## 🐛 Problems Iruntha

### Exams Display Aagala
1. MongoDB running ah check pannunga: `net start MongoDB`
2. Backend running ah check pannunga (port 5000)
3. Frontend running ah check pannunga (port 3000)
4. Page refresh pannunga

### Hall Ticket Download Aagala
1. Quiz ku hall ticket kidaiyathu (by design)
2. Browser console la error check pannunga
3. jsPDF install aagiruka check pannunga: `npm install jspdf`

### Exam Create Panna Mudiyala
1. Admin/Staff ah login pannirkingala check pannunga
2. Ella required fields um fill pannirkingala check pannunga
3. Time conflict irukkanu check pannunga
4. Class and Subject exist aaguthanu check pannunga

## 📊 Features Summary

### Admin Dashboard
- Full exam management
- Invigilator assignment
- Edit/Delete any exam
- Advanced filtering
- Conflict detection

### Staff Dashboard  
- Create tests
- Edit own tests
- View all exams
- Class filtering

### Student Dashboard
- View exam schedule
- Upcoming exams alert
- Download hall tickets
- Beautiful UI

## 🎯 Testing Steps

### Admin Test
1. Login as admin
2. Exam schedule page ku ponga
3. Exam create pannunga
4. Invigilators assign pannunga
5. Edit pannunga
6. Filter use pannunga
7. Delete pannunga

### Staff Test
1. Login as staff
2. Test create pannunga
3. Edit pannunga
4. Admin exam edit panna try pannunga (work aagakoodathu)
5. Delete pannunga

### Student Test
1. Login as student
2. Exams view pannunga
3. Hall ticket download pannunga
4. Upcoming exams check pannunga

## 📞 Help

Problems iruntha:
1. MongoDB running ah check pannunga
2. Backend and Frontend running ah check pannunga
3. Browser console la errors check pannunga
4. Dependencies install aagiruka check pannunga
5. Servers restart pannunga

## 🎊 Success!

Ipo ungaluku iruku:
✅ Admin full control
✅ Staff test creation
✅ Student exam viewing
✅ Hall ticket download
✅ Real-time updates
✅ Beautiful UI
✅ Responsive design

**Ready to use! Enjoy! 🚀**

## 📝 Important Notes

1. Hall tickets quiz ku generate aagaathu
2. Students avanga class exams mattum paakka mudiyum
3. Staff admin exams ah modify panna mudiyathu
4. MongoDB running irukanum
5. Recent exams top la display aagum

## 🎓 Best Practices

1. Exams ah advance la schedule pannunga
2. Invigilators ah early assign pannunga
3. Clear instructions add pannunga
4. Correct exam type use pannunga
5. Status update pannunga (Ongoing, Completed)

---

**Made with ❤️ for School ERP**
