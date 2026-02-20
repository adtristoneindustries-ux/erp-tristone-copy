// Alert System Update Guide
// This file contains all the files that need to be updated to use the modern alert system

const filesToUpdate = [
  // Admin Panel Files
  'AdminClasses.jsx',
  'AdminStudentAttendance.jsx', 
  'AdminStudents.jsx',
  'AdminStudentTimetable.jsx',
  'AdminSubjects.jsx',
  'AdminTimetable.jsx',
  
  // Staff Panel Files
  'StaffAnnouncements.jsx',
  'StaffAttendance.jsx',
  'StaffMarks.jsx',
  'StaffMyAttendance.jsx',
  'StaffStudentAttendance.jsx',
  
  // Other Files
  'TimetableModule.jsx'
];

// Steps to update each file:
// 1. Add import: import { useAlert } from '../hooks/useAlert';
// 2. Add hook: const { showSuccess, showError, showWarning, showInfo } = useAlert();
// 3. Replace alert() calls:
//    - alert('Success message') → showSuccess('Success message')
//    - alert('Error message') → showError('Error message')
//    - alert('Warning message') → showWarning('Warning message')
//    - alert('Info message') → showInfo('Info message')

export default filesToUpdate;