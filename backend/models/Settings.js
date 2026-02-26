const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
  schoolName: { type: String, default: 'School ERP System' },
  tagline: { type: String, default: 'Manage your school efficiently' },
  logoUrl: { type: String, default: '' },
  faviconUrl: { type: String, default: '' },
  address: { type: String, default: '' },
  email: { type: String, default: '' },
  phone: { type: String, default: '' },
  primaryColor: { type: String, default: '#3B82F6' },
  sidebarColor: { type: String, default: '#2563EB' },
  buttonColor: { type: String, default: '#3B82F6' },
  loginBackgroundUrl: { type: String, default: '' },
  welcomeMessage: { type: String, default: 'Welcome Back!' },
  enableStudentLogin: { type: Boolean, default: true },
  enableStaffLogin: { type: Boolean, default: true },
  enableNotifications: { type: Boolean, default: true },
  academicYear: { type: String, default: '2024-2025' }
}, { timestamps: true });

module.exports = mongoose.model('Settings', settingsSchema);
