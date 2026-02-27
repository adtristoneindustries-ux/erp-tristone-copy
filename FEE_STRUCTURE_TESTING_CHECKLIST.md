# Testing Checklist - Class-wise Fee Structure System

## 🧪 Pre-Testing Setup

### Environment Check
- [ ] MongoDB is running
- [ ] Backend server is running on port 5000
- [ ] Frontend server is running on port 3000
- [ ] No console errors on startup
- [ ] Admin user exists in database

### Data Prerequisites
- [ ] At least one class exists in Classes module
- [ ] At least one student is assigned to a class
- [ ] Admin credentials are working

---

## 📋 Functional Testing

### 1. Modal Display
- [ ] Click "Set Class Fee Structure" button
- [ ] Modal opens correctly
- [ ] Modal is centered on screen
- [ ] Modal has proper styling
- [ ] Close button (X) works
- [ ] Cancel button works
- [ ] Modal closes on cancel
- [ ] Form resets on cancel

### 2. Form Fields
- [ ] Academic Year field is visible
- [ ] Academic Year has default value "2024-2025"
- [ ] Academic Year is editable
- [ ] Class dropdown is visible
- [ ] Class dropdown shows "Select Class" placeholder
- [ ] Class dropdown is populated with classes
- [ ] Classes display as "ClassName-Section" format
- [ ] Can select a class from dropdown

### 3. Fee Components
- [ ] One default component row is shown
- [ ] Component Name field is visible
- [ ] Component Amount field is visible
- [ ] Can enter component name
- [ ] Can enter component amount
- [ ] Amount field only accepts numbers
- [ ] "Add Component" button is visible
- [ ] Clicking "Add Component" adds new row
- [ ] Can add multiple components (test 5+)
- [ ] Each component has remove button (X)
- [ ] Remove button works correctly
- [ ] Cannot remove last component
- [ ] Remove button hidden when only one component

### 4. Total Calculation
- [ ] Total displays at bottom
- [ ] Total shows ₹0 initially
- [ ] Total updates when amount is entered
- [ ] Total updates when component is added
- [ ] Total updates when component is removed
- [ ] Total updates when amount is changed
- [ ] Total is formatted with commas (e.g., ₹57,000)
- [ ] Total calculation is accurate

### 5. Form Validation
- [ ] Cannot submit without Academic Year
- [ ] Cannot submit without Class selection
- [ ] Cannot submit without component name
- [ ] Cannot submit without component amount
- [ ] Error message shows for missing fields
- [ ] Negative amounts are prevented
- [ ] Zero amounts are allowed
- [ ] Decimal amounts are allowed

### 6. Save Functionality
- [ ] "Save Structure" button is visible
- [ ] Button is enabled when form is valid
- [ ] Clicking save shows loading state (optional)
- [ ] Success message appears after save
- [ ] Modal closes after successful save
- [ ] Finance table refreshes automatically
- [ ] New records appear in table
- [ ] Form resets after save

---

## 🔄 Integration Testing

### 1. Class Integration
- [ ] Classes are fetched from API
- [ ] Only active classes are shown
- [ ] Class data is accurate
- [ ] Class dropdown updates if classes change
- [ ] Handles empty class list gracefully

### 2. Student Assignment
- [ ] All students in class receive fees
- [ ] Student count is accurate
- [ ] Finance records are created correctly
- [ ] Each student has correct total fee
- [ ] Scholarship discount is 0 by default
- [ ] Paid amount is 0 by default
- [ ] Pending amount equals total fee
- [ ] Transaction is logged

### 3. Finance Module Integration
- [ ] New records appear in finance table
- [ ] Student names are displayed correctly
- [ ] Roll numbers are shown
- [ ] Class information is correct
- [ ] Academic year is correct
- [ ] Amounts are formatted properly
- [ ] Can view student details
- [ ] Scholarship section works

---

## 🚫 Error Handling Testing

### 1. Duplicate Prevention
- [ ] Create fee structure for Class 10-A, Year 2024-2025
- [ ] Try to create same structure again
- [ ] Error message: "Fee structure already exists"
- [ ] Modal stays open
- [ ] Form data is preserved
- [ ] Can change class and retry

### 2. Invalid Class
- [ ] Select a class
- [ ] Delete that class from database (manually)
- [ ] Try to save structure
- [ ] Error message: "Class not found"
- [ ] Handles error gracefully

### 3. No Students in Class
- [ ] Create a class with no students
- [ ] Set fee structure for that class
- [ ] Structure is created successfully
- [ ] Message shows "0 students assigned"
- [ ] No finance records created
- [ ] No errors occur

### 4. Network Errors
- [ ] Stop backend server
- [ ] Try to save structure
- [ ] Error message appears
- [ ] Modal stays open
- [ ] Can retry after server restart

### 5. Invalid Data
- [ ] Enter very large amount (999999999)
- [ ] Enter special characters in name
- [ ] Enter empty component name
- [ ] Enter negative amount
- [ ] All cases handled properly

---

## 🎨 UI/UX Testing

### 1. Responsive Design
- [ ] Test on desktop (1920px)
- [ ] Test on laptop (1366px)
- [ ] Test on tablet (768px)
- [ ] Test on mobile (375px)
- [ ] Modal is responsive
- [ ] Components stack properly
- [ ] Buttons are accessible
- [ ] Text is readable

### 2. Visual Consistency
- [ ] Colors match ERP theme
- [ ] Fonts are consistent
- [ ] Spacing is uniform
- [ ] Buttons have hover effects
- [ ] Focus states are visible
- [ ] Borders are consistent
- [ ] Shadows are appropriate

### 3. User Experience
- [ ] Tab navigation works
- [ ] Enter key submits form
- [ ] Escape key closes modal
- [ ] Loading states are clear
- [ ] Success messages are visible
- [ ] Error messages are clear
- [ ] Form is intuitive
- [ ] No confusing elements

---

## 🔐 Security Testing

### 1. Authentication
- [ ] Logout and try to access page
- [ ] Redirects to login
- [ ] Cannot access API without token
- [ ] Token is validated

### 2. Authorization
- [ ] Login as Student
- [ ] Cannot see "Set Class Fee Structure" button
- [ ] Cannot access fee structure API
- [ ] Login as Staff
- [ ] Cannot see "Set Class Fee Structure" button
- [ ] Cannot access fee structure API
- [ ] Login as Admin
- [ ] Can see button
- [ ] Can access API

### 3. Data Validation
- [ ] SQL injection attempts fail
- [ ] XSS attempts are sanitized
- [ ] Invalid IDs are rejected
- [ ] Malformed requests are rejected

---

## 📊 Performance Testing

### 1. Load Time
- [ ] Modal opens in < 1 second
- [ ] Classes load in < 2 seconds
- [ ] Form is responsive
- [ ] No lag when typing

### 2. Save Performance
- [ ] Structure saves in < 2 seconds
- [ ] 10 students assigned in < 3 seconds
- [ ] 50 students assigned in < 5 seconds
- [ ] 100 students assigned in < 10 seconds

### 3. Calculation Performance
- [ ] Total calculates instantly
- [ ] No delay with 10 components
- [ ] No delay with 20 components
- [ ] UI remains responsive

---

## 🔄 Edge Cases

### 1. Unusual Inputs
- [ ] Academic Year: "2023-2024"
- [ ] Academic Year: "2025-2026"
- [ ] Component Name: Very long text (100+ chars)
- [ ] Amount: 0
- [ ] Amount: 0.50 (decimal)
- [ ] Amount: 999999999 (very large)

### 2. Unusual Scenarios
- [ ] Add 50 components
- [ ] Remove all but one component
- [ ] Change class after entering components
- [ ] Change academic year after entering components
- [ ] Open modal, close, open again
- [ ] Submit form twice quickly

### 3. Data Consistency
- [ ] Create structure for Class A
- [ ] Verify all students have fees
- [ ] Add new student to Class A
- [ ] New student does NOT have fees (expected)
- [ ] Update structure
- [ ] Existing students' fees update
- [ ] New student still has no fees (expected)

---

## 📱 Browser Testing

### Desktop Browsers
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)

### Mobile Browsers
- [ ] Chrome Mobile
- [ ] Safari Mobile
- [ ] Firefox Mobile

---

## 🔍 API Testing

### 1. Create Fee Structure
```bash
POST /api/finance/fee-structure
- [ ] Returns 201 on success
- [ ] Returns 400 on duplicate
- [ ] Returns 404 on invalid class
- [ ] Returns 401 without auth
- [ ] Returns 403 for non-admin
```

### 2. Get Fee Structures
```bash
GET /api/finance/fee-structure
- [ ] Returns 200 on success
- [ ] Returns empty array if none exist
- [ ] Returns 401 without auth
- [ ] Returns 403 for non-admin
```

### 3. Update Fee Structure
```bash
PUT /api/finance/fee-structure/:id
- [ ] Returns 200 on success
- [ ] Returns 404 on invalid ID
- [ ] Returns 401 without auth
- [ ] Returns 403 for non-admin
```

---

## 📝 Database Testing

### 1. FeeStructure Collection
- [ ] Document is created correctly
- [ ] All fields are populated
- [ ] Total is calculated correctly
- [ ] Timestamps are set
- [ ] Unique constraint works

### 2. Finance Collection
- [ ] Records are created for students
- [ ] All fields are correct
- [ ] References are valid
- [ ] Transactions are logged
- [ ] Amounts are accurate

---

## ✅ Acceptance Criteria

### Must Pass
- [ ] Can create fee structure
- [ ] Students receive fees automatically
- [ ] Total calculates correctly
- [ ] Duplicate prevention works
- [ ] Admin-only access enforced
- [ ] UI is responsive
- [ ] No console errors
- [ ] Success message appears

### Should Pass
- [ ] Performance is acceptable
- [ ] Error messages are clear
- [ ] Form validation works
- [ ] Can add many components
- [ ] Works on all browsers
- [ ] Mobile-friendly

### Nice to Have
- [ ] Smooth animations
- [ ] Loading indicators
- [ ] Keyboard shortcuts
- [ ] Accessibility features

---

## 🎯 Test Scenarios

### Scenario 1: Happy Path
1. Login as admin
2. Navigate to Finance
3. Click "Set Class Fee Structure"
4. Select Academic Year: 2024-2025
5. Select Class: 10-A
6. Add components:
   - Tuition Fee: 50000
   - Lab Fee: 5000
   - Library Fee: 2000
7. Verify total: ₹57,000
8. Click "Save Structure"
9. Verify success message
10. Verify students have fees

**Expected:** ✅ All steps pass

### Scenario 2: Duplicate Prevention
1. Create structure for 10-A, 2024-2025
2. Try to create same structure again
3. Verify error message
4. Change class to 10-B
5. Save successfully

**Expected:** ✅ Duplicate prevented, different class works

### Scenario 3: Multiple Components
1. Open modal
2. Add 10 different components
3. Verify total updates
4. Remove 5 components
5. Verify total updates
6. Save structure
7. Verify success

**Expected:** ✅ All operations work smoothly

---

## 📊 Test Results Template

```
Test Date: ___________
Tester: ___________
Environment: ___________

Total Tests: ___
Passed: ___
Failed: ___
Skipped: ___

Pass Rate: ___%

Critical Issues: ___
Major Issues: ___
Minor Issues: ___

Notes:
_______________________
_______________________
_______________________
```

---

## 🐛 Bug Report Template

```
Bug ID: ___
Severity: [Critical/Major/Minor]
Priority: [High/Medium/Low]

Title: _______________

Steps to Reproduce:
1. _______________
2. _______________
3. _______________

Expected Result:
_______________

Actual Result:
_______________

Screenshots:
_______________

Environment:
- Browser: ___
- OS: ___
- Screen Size: ___

Additional Notes:
_______________
```

---

**Testing Complete! 🎉**

**Remember:** Test thoroughly before deploying to production!
