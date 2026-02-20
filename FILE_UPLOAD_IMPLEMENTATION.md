# File Upload Implementation for Materials

## Overview
The Staff Materials page now supports both file uploads and URL links for study materials. Students can view, open, and download these materials from their Materials page.

## Supported File Types
- **Images**: JPG, JPEG, PNG, GIF
- **Videos**: MP4, AVI, MOV, WMV  
- **Documents**: PDF, DOC, DOCX

## File Size Limit
- Maximum file size: 50MB per file

## Features

### Staff Panel (Upload Materials)
1. **Upload Method Selection**: Choose between "Upload File" or "Add Link"
2. **File Upload**: 
   - Drag and drop or browse to select files
   - Real-time file validation
   - File size and type checking
   - Preview of selected file with size info
3. **URL Links**: Still supported for external resources
4. **File Information**: Shows file name, size, and type in the materials list

### Student Panel (View Materials)
1. **File Display**: Shows file type icons and information
2. **Actions**:
   - **Open**: Opens file in new tab (works for both uploaded files and links)
   - **Download**: Available only for uploaded files (not external links)
3. **File Info**: Displays file name, size, and type badges
4. **Responsive Design**: Optimized for mobile and desktop viewing

## Technical Implementation

### Backend Changes
- Added `multer` middleware for file uploads
- Created `/uploads` directory for file storage
- Updated Material model with `fileName` and `fileSize` fields
- Enhanced material controller to handle both files and URLs
- Added static file serving for uploaded files

### Frontend Changes
- Updated StaffMaterials with file upload UI
- Added radio buttons to choose upload method
- Enhanced form validation for files
- Updated StudentMaterials to handle local files
- Improved responsive design for file information display

## File Storage
- Uploaded files are stored in `backend/uploads/` directory
- Files are accessible via `http://localhost:5000/uploads/filename`
- Unique filenames prevent conflicts

## Usage Instructions

### For Staff:
1. Go to Materials page
2. Click "Upload Material"
3. Choose "Upload File" or "Add Link"
4. Fill in title, description, class, section, and subject
5. Either select a file or enter a URL
6. Click "Upload Material"

### For Students:
1. Go to Materials page
2. View all materials for your class/section
3. Click "Open" to view the material
4. Click "Download" to download uploaded files
5. File information is displayed in the material details

## Error Handling
- File type validation with user-friendly messages
- File size limit enforcement
- Network error handling for uploads
- Fallback for unsupported file types