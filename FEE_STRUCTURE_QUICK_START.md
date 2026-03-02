# Quick Start Guide - Class-wise Fee Structure

## How to Use the New Fee Structure System

### Step 1: Start the Application
```bash
# Run the quick start script
FIX_AND_START.bat
```

### Step 2: Login as Admin
- Open: http://localhost:3000
- Email: `admin@school.com`
- Password: `admin123`

### Step 3: Navigate to Fee Management
- Click on "Finance" in the sidebar
- You'll see the Fee & Scholarships Management page

### Step 4: Set Class Fee Structure
1. Click the **"Set Class Fee Structure"** button (blue button, top right)
2. A modal will open

### Step 5: Fill the Form

#### Select Academic Year
- Default: 2024-2025
- You can change it if needed

#### Select Class
- Dropdown shows all active classes
- Format: "ClassName-Section" (e.g., "10-A", "11-Science")
- Select the class you want to set fees for

#### Add Fee Components
**Default Component:**
- One empty component row is shown

**Add Components:**
1. Enter Component Name (e.g., "Tuition Fee")
2. Enter Amount (e.g., 50000)
3. Click **"Add Component"** to add more rows

**Example Components:**
- Tuition Fee: ₹50,000
- Lab Fee: ₹5,000
- Library Fee: ₹2,000
- Sports Fee: ₹3,000
- Exam Fee: ₹2,500

**Remove Components:**
- Click the ❌ button next to any component (except if only one remains)

#### View Total
- Total fee is calculated automatically at the bottom
- Updates in real-time as you add/modify components

### Step 6: Save Structure
1. Click **"Save Structure"** button
2. System will:
   - Create the fee structure
   - Find all students in that class
   - Assign fees to each student automatically
3. Success message shows: "✅ Fee structure created and assigned to all students successfully!"

### Step 7: Verify Assignment
1. The finance table will refresh
2. You'll see new records for all students in that class
3. Each student will have:
   - Total Fee = Sum of all components
   - Scholarship Discount = ₹0 (default)
   - Final Payable = Total Fee
   - Paid Amount = ₹0 (default)
   - Pending Amount = Total Fee

## Example Scenario

### Setting Fee for Class 10-A

**Step 1:** Click "Set Class Fee Structure"

**Step 2:** Fill form:
- Academic Year: 2024-2025
- Class: 10-A

**Step 3:** Add components:
1. Tuition Fee: ₹45,000
2. Lab Fee: ₹5,000
3. Library Fee: ₹2,000
4. Sports Fee: ₹3,000
5. Exam Fee: ₹2,500

**Total:** ₹57,500

**Step 4:** Click "Save Structure"

**Result:**
- Fee structure created for Class 10-A
- All students in 10-A get ₹57,500 total fee
- Each student's pending amount = ₹57,500

## Important Notes

### ✅ What Happens Automatically
- All students in the class get the fee assigned
- Finance records are created instantly
- Total is calculated automatically
- Pending amount is set correctly

### ⚠️ Restrictions
- **One structure per class per year**: You cannot create duplicate structures
- **Cannot modify after creation**: Currently, you need to delete and recreate (or use update API)
- **Requires active class**: Class must exist in the Classes module

### 💡 Tips
- Add all components before saving
- Double-check amounts before saving
- Use descriptive component names
- Keep academic year consistent

## Troubleshooting

### Error: "Fee structure already exists"
**Solution:** A structure already exists for this class and year. You need to update it instead of creating a new one.

### Error: "Class not found"
**Solution:** The selected class doesn't exist. Refresh the page and try again.

### No students assigned
**Reason:** The class has no students enrolled yet.
**Solution:** Add students to the class first, then set the fee structure.

### Classes dropdown is empty
**Reason:** No classes exist in the system.
**Solution:** Go to Classes module and create classes first.

## Next Steps

### After Setting Fee Structure
1. **Approve Scholarships**: Go to Scholarships module to approve student scholarships
2. **Record Payments**: Use the finance table to record student payments
3. **Generate Reports**: Export finance data using the "Export" button
4. **Monitor Pending**: Track students with pending fees

### Managing Fees
- View individual student details by clicking "View" button
- See scholarship history and payment records
- Track pending amounts
- Export data for accounting

## API Testing (Optional)

### Create Fee Structure via API
```bash
POST http://localhost:5000/api/finance/fee-structure
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "classId": "60d5ec49f1b2c72b8c8e4a1b",
  "academicYear": "2024-2025",
  "components": [
    { "name": "Tuition Fee", "amount": 50000 },
    { "name": "Lab Fee", "amount": 5000 }
  ]
}
```

### Get All Fee Structures
```bash
GET http://localhost:5000/api/finance/fee-structure
Authorization: Bearer <admin_token>
```

## Support

For issues or questions:
1. Check the console for error messages
2. Verify MongoDB is running
3. Ensure backend server is running on port 5000
4. Ensure frontend is running on port 3000
5. Check CLASS_FEE_STRUCTURE_IMPLEMENTATION.md for technical details

---

**Happy Fee Management! 🎓💰**
