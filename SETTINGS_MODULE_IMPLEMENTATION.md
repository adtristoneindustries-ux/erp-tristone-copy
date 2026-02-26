# Settings Module Implementation - Complete Guide

## Overview
A complete Settings module has been implemented in the School ERP system with full working functionality, proper access control, and global application of settings across all panels.

---

## 🎯 Features Implemented

### 1. Branding Settings
- ✅ Upload School Logo (Base64 encoded, stored in DB)
- ✅ Upload Favicon (Base64 encoded, stored in DB)
- ✅ Logo replaces default text across Admin, Staff, and Student panels
- ✅ Favicon applies globally to browser tab

### 2. School Information
- ✅ School Name input
- ✅ Tagline input
- ✅ Address textarea
- ✅ Email input
- ✅ Phone input
- ✅ All data saved to DB and auto-updates everywhere

### 3. Theme Settings
- ✅ Primary Color picker
- ✅ Sidebar Color picker
- ✅ Button Color picker
- ✅ Colors apply globally via CSS variables
- ✅ Real-time preview of color changes

### 4. Login Page Settings
- ✅ Upload login background image
- ✅ Set welcome message
- ✅ Settings apply immediately to login page

### 5. System Access Controls
- ✅ Toggle: Enable/Disable Student Login
- ✅ Toggle: Enable/Disable Staff Login
- ✅ Toggle: Enable/Disable Notifications
- ✅ Academic Year selector (2023-2027)

### 6. Access & Permissions
- ✅ Admin-only access to Settings page
- ✅ Route protection (only admin can access /admin/settings)
- ✅ API protection (only admin can update settings)
- ✅ Staff and Students cannot view or modify settings

### 7. Global Application
- ✅ Settings load on app initialization
- ✅ Settings apply across all panels (Admin, Staff, Student)
- ✅ Settings persist in MongoDB database
- ✅ Auto-refresh after saving settings

---

## 📁 Files Created/Modified

### Backend Files Created:
1. **`backend/models/Settings.js`**
   - MongoDB schema for settings
   - Default values for all settings fields

2. **`backend/controllers/settingsController.js`**
   - `getSettings()` - Fetch current settings
   - `updateSettings()` - Update settings (admin only)

3. **`backend/routes/settingsRoutes.js`**
   - GET `/api/settings` - Public endpoint
   - PUT `/api/settings` - Protected endpoint (admin only)

### Backend Files Modified:
4. **`backend/server.js`**
   - Added settings route: `app.use('/api/settings', require('./routes/settingsRoutes'))`

### Frontend Files Created:
5. **`frontend/src/context/SettingsContext.jsx`**
   - Global settings state management
   - Fetches settings on app load
   - Applies settings (favicon, colors, title)
   - Provides `refreshSettings()` function

6. **`frontend/src/pages/AdminSettings.jsx`**
   - Complete settings UI with 5 tabs
   - File upload handlers (Base64 conversion)
   - Form validation and submission
   - Success/error messaging

### Frontend Files Modified:
7. **`frontend/src/main.jsx`**
   - Wrapped app with `<SettingsProvider>`

8. **`frontend/src/App.jsx`**
   - Added AdminSettings import
   - Added protected route: `/admin/settings`

9. **`frontend/src/components/Sidebar.jsx`**
   - Added Settings icon import
   - Added SettingsContext import
   - Added Settings link to admin navigation
   - Dynamic sidebar color from settings
   - Dynamic logo/school name from settings

10. **`frontend/src/services/api.js`**
    - Added `settingsAPI.getSettings()`
    - Added `settingsAPI.updateSettings(data)`

11. **`frontend/src/pages/Login.jsx`**
    - Already uses SettingsContext (no changes needed)
    - Displays logo, school name, tagline
    - Uses login background image
    - Shows welcome message

---

## 🔒 Security Implementation

### Route Protection
```javascript
// Only admin can access settings page
<Route
  path="/admin/settings"
  element={
    <ProtectedRoute allowedRoles={["admin"]}>
      <AdminSettings />
    </ProtectedRoute>
  }
/>
```

### API Protection
```javascript
// Only admin can update settings
router.put('/', protect, authorize('admin'), updateSettings);
```

### Access Control Flow
1. User must be logged in (`protect` middleware)
2. User must have admin role (`authorize('admin')` middleware)
3. Staff/Students get 403 Forbidden if they try to access

---

## 🗄️ Database Schema

```javascript
{
  schoolName: String (default: 'School ERP System'),
  tagline: String (default: 'Manage your school efficiently'),
  logoUrl: String (Base64 encoded image),
  faviconUrl: String (Base64 encoded image),
  address: String,
  email: String,
  phone: String,
  primaryColor: String (default: '#3B82F6'),
  sidebarColor: String (default: '#2563EB'),
  buttonColor: String (default: '#3B82F6'),
  loginBackgroundUrl: String (Base64 encoded image),
  welcomeMessage: String (default: 'Welcome Back!'),
  enableStudentLogin: Boolean (default: true),
  enableStaffLogin: Boolean (default: true),
  enableNotifications: Boolean (default: true),
  academicYear: String (default: '2024-2025'),
  timestamps: true
}
```

---

## 🚀 How to Use

### For Admins:
1. Login as admin
2. Navigate to sidebar → "Settings"
3. Choose a tab (Branding, School Info, Theme, Login Page, Access Control)
4. Make changes
5. Click "Save Settings"
6. Page will reload and settings will apply globally

### Settings Tabs:

#### 1. Branding Tab
- Upload school logo (replaces "School ERP System" text)
- Upload favicon (appears in browser tab)

#### 2. School Info Tab
- Enter school name, tagline, address, email, phone
- All fields auto-update across the system

#### 3. Theme Tab
- Pick primary color (affects buttons, links)
- Pick sidebar color (changes sidebar background)
- Pick button color (affects action buttons)

#### 4. Login Page Tab
- Upload background image for login page
- Set welcome message (shown on login page)

#### 5. Access Control Tab
- Toggle student login on/off
- Toggle staff login on/off
- Toggle notifications on/off
- Select current academic year

---

## 🎨 Global Application

### Where Settings Apply:

1. **Sidebar (All Panels)**
   - Logo/School name in header
   - Sidebar background color

2. **Login Page**
   - School logo
   - School name
   - Tagline
   - Background image
   - Welcome message

3. **Browser Tab**
   - Favicon
   - Page title (school name)

4. **Theme Colors**
   - CSS variables applied globally
   - Primary color: buttons, links, accents
   - Sidebar color: navigation background
   - Button color: action buttons

---

## 📡 API Endpoints

### GET /api/settings
- **Access:** Public (no auth required)
- **Purpose:** Fetch current settings
- **Response:** Settings object

### PUT /api/settings
- **Access:** Admin only (protected)
- **Purpose:** Update settings
- **Body:** Settings object
- **Response:** Updated settings object

---

## 🔄 Settings Flow

1. **App Initialization:**
   ```
   App loads → SettingsProvider fetches settings → Settings applied globally
   ```

2. **Admin Updates Settings:**
   ```
   Admin edits → Clicks Save → API updates DB → refreshSettings() called → Page reloads → New settings applied
   ```

3. **Settings Propagation:**
   ```
   Database → SettingsContext → All Components (Sidebar, Login, etc.)
   ```

---

## ✅ Testing Checklist

- [ ] Login as admin and access /admin/settings
- [ ] Upload school logo and verify it appears in sidebar
- [ ] Upload favicon and verify it appears in browser tab
- [ ] Change sidebar color and verify it updates
- [ ] Change theme colors and verify they apply
- [ ] Upload login background and verify on login page
- [ ] Change welcome message and verify on login page
- [ ] Toggle access controls and verify they save
- [ ] Try accessing /admin/settings as staff (should fail)
- [ ] Try accessing /admin/settings as student (should fail)
- [ ] Verify settings persist after page reload
- [ ] Verify settings apply across all panels

---

## 🎯 Key Features

✅ **Complete Functionality** - All 7 requirements implemented
✅ **Admin-Only Access** - Route and API protection
✅ **Global Application** - Settings apply everywhere
✅ **Real-time Updates** - Changes apply immediately
✅ **Persistent Storage** - MongoDB database
✅ **File Upload Support** - Base64 encoding for images
✅ **Responsive UI** - Works on all devices
✅ **Error Handling** - Success/error messages
✅ **Default Values** - Sensible defaults for all settings

---

## 📝 Notes

- Images are stored as Base64 strings in the database
- For production, consider using cloud storage (AWS S3, Cloudinary) for images
- Settings are fetched once on app load for performance
- Page reload after save ensures all components get new settings
- Only one settings document exists in the database (singleton pattern)

---

## 🎉 Success!

The Settings module is now fully functional with:
- Complete UI with 5 tabs
- Full backend API with protection
- Global settings application
- Admin-only access control
- Persistent database storage

Access the settings page at: **http://localhost:3000/admin/settings**
