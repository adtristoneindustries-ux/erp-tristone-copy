// This script updates all pages to be responsive
// Run with: node responsive-update.cjs

const fs = require('fs');
const path = require('path');

const pages = [
  'AdminClasses.jsx',
  'AdminStaff.jsx', 
  'AdminSubjects.jsx',
  'AdminAnnouncements.jsx',
  'AdminStaffAttendance.jsx',
  'AdminStudentAttendance.jsx',
  'StudentMarks.jsx',
  'StudentAttendance.jsx',
  'StudentMaterials.jsx',
  'StudentTimetable.jsx',
  'StudentAnnouncements.jsx',
  'StaffStudentAttendance.jsx',
  'StaffTimetable.jsx'
];

const responsiveReplacements = [
  // Main layout
  {
    from: '<div className="flex">',
    to: '<div className="flex min-h-screen bg-gray-50">'
  },
  {
    from: '<div className="flex-1 ml-64">',
    to: '<div className="flex-1 lg:ml-64 transition-all duration-300">'
  },
  {
    from: '<div className="p-6">',
    to: '<div className="p-4 lg:p-6">'
  },
  // Headers
  {
    from: 'className="text-2xl font-bold',
    to: 'className="text-xl lg:text-2xl font-bold'
  },
  {
    from: 'className="text-xl font-bold',
    to: 'className="text-lg lg:text-xl font-bold'
  },
  // Buttons and actions
  {
    from: 'className="flex justify-between items-center mb-6">',
    to: 'className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 lg:mb-6 gap-4">'
  },
  // Grids
  {
    from: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
    to: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4'
  },
  {
    from: 'grid-cols-1 md:grid-cols-3',
    to: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
  },
  {
    from: 'gap-6 mb-8',
    to: 'gap-4 lg:gap-6 mb-6 lg:mb-8'
  },
  // Tables
  {
    from: '<div className="bg-white rounded-lg shadow-md">',
    to: '<div className="bg-white rounded-lg shadow-md overflow-hidden">'
  },
  // Icons
  {
    from: '<Edit size={18} />',
    to: '<Edit size={16} />'
  },
  {
    from: '<Trash2 size={18} />',
    to: '<Trash2 size={16} />'
  }
];

pages.forEach(pageFile => {
  const filePath = path.join(__dirname, 'src', 'pages', pageFile);
  
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    
    responsiveReplacements.forEach(replacement => {
      content = content.replace(new RegExp(replacement.from, 'g'), replacement.to);
    });
    
    fs.writeFileSync(filePath, content);
    console.log(`Updated ${pageFile}`);
  }
});

console.log('All pages updated for responsiveness!');