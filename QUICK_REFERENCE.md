# 🚀 QUICK REFERENCE - DATA VERIFICATION

## ✅ எல்லாம் சரியா இருக்கா என்று check செய்ய

### 1️⃣ Quick Check (5 seconds)
```bash
cd backend
node verifyData.js
```
**Output-ல் பார்க்க வேண்டியவை:**
- ✅ "Connected to MongoDB" - Connection working
- ✅ "No TTL indexes found" - No auto-delete
- ✅ "VERIFICATION COMPLETE" - All checks passed

---

### 2️⃣ MongoDB Direct Check (10 seconds)
```bash
mongosh school_erp
```

**Commands:**
```javascript
// எல்லா collections பார்க்க
show collections

// Scholarships count
db.scholarships.countDocuments()

// Applications count
db.scholarshipapplications.countDocuments()

// Latest scholarship பார்க்க
db.scholarships.find().sort({createdAt: -1}).limit(1).pretty()

// Latest application பார்க்க
db.scholarshipapplications.find().sort({createdAt: -1}).limit(1).pretty()

// Exit
exit
```

---

### 3️⃣ Application Check (30 seconds)

**Admin-ஆக login செய்து:**
1. Go to Scholarship Management
2. Create new scholarship
3. Note the scholarship name

**Student-ஆக login செய்து:**
1. Go to Scholarships
2. Apply for the scholarship you created
3. Submit application

**Admin-ஆக திரும்பி:**
1. Go to Scholarship Management
2. Check if application appears in table
3. ✅ If visible → Everything working!

**Server restart செய்து:**
```bash
# Backend-ல்
Ctrl+C
npm run dev
```

**Check again:**
1. Login as admin
2. Go to Scholarship Management
3. ✅ If data still there → Permanent storage working!

---

## 🔍 Common Checks

### Check 1: Data Exists?
```bash
mongosh school_erp
db.scholarships.countDocuments()
```
**Expected**: Number > 0

### Check 2: Auto-delete Configured?
```bash
cd backend
node verifyData.js
```
**Expected**: "No TTL indexes found"

### Check 3: Timestamps Working?
```bash
mongosh school_erp
db.scholarships.findOne()
```
**Expected**: Should see `createdAt` and `updatedAt` fields

### Check 4: Data Persists After Restart?
1. Note current scholarship count
2. Restart server
3. Check count again
**Expected**: Same count

---

## 📊 Expected Results

### Verification Script Output:
```
✅ Connected to MongoDB
📊 DATABASE STATISTICS
============================================================
scholarships                   : X documents
scholarshipapplications        : Y documents
users                          : Z documents
...
============================================================
✅ All data is properly stored in MongoDB
✅ No automatic deletion configured
✅ No TTL indexes found - Data will NOT auto-delete
✅ VERIFICATION COMPLETE - ALL DATA IS SAFE
```

### MongoDB Query Output:
```javascript
// db.scholarships.findOne()
{
  _id: ObjectId("..."),
  name: "Merit Scholarship",
  description: "For top performers",
  type: "Merit",
  amount: 10000,
  amountType: "Fixed",
  academicYear: "2024-2025",
  status: "Active",
  createdAt: ISODate("2026-04-11T06:22:49.000Z"),
  updatedAt: ISODate("2026-04-11T06:22:49.000Z")
}
```

---

## ⚠️ Troubleshooting

### Problem: "Connection refused"
**Solution:**
```bash
# Start MongoDB
net start MongoDB
```

### Problem: "No data found"
**Solution:**
1. Create scholarship via admin panel
2. Apply as student
3. Check again

### Problem: "Data disappeared"
**Check:**
1. Did someone manually delete?
2. Check MongoDB directly: `db.scholarships.find()`
3. Check backup: `mongorestore`

---

## 💾 Backup Commands

### Create Backup
```bash
# Full backup
mongodump --db school_erp --out ./backup

# Specific collection
mongodump --db school_erp --collection scholarships --out ./backup
```

### Restore Backup
```bash
# Full restore
mongorestore --db school_erp ./backup/school_erp

# Specific collection
mongorestore --db school_erp --collection scholarships ./backup/school_erp/scholarships.bson
```

---

## 📝 Quick Test Checklist

- [ ] Run `node verifyData.js` → Should show "VERIFICATION COMPLETE"
- [ ] Check MongoDB → `db.scholarships.countDocuments()` > 0
- [ ] Create scholarship → Should save
- [ ] Apply for scholarship → Should save
- [ ] Restart server → Data should persist
- [ ] Check for TTL → Should be "None found"
- [ ] Check timestamps → Should exist on all records

---

## ✅ All Clear Indicators

**You're good if you see:**
- ✅ "No TTL indexes found"
- ✅ "All data is properly stored"
- ✅ "VERIFICATION COMPLETE"
- ✅ Data persists after restart
- ✅ Timestamps on all records
- ✅ No automatic deletion

---

## 📞 Quick Help

**எதாவது doubt-ஆ?**
1. Run: `node verifyData.js`
2. Check: `VERIFICATION_COMPLETE.md`
3. Tamil guide: `DATA_PERSISTENCE_TAMIL.md`
4. Full docs: `CRUD_VERIFICATION.md`

---

**எல்லாம் சரியா வேலை செய்யுது! 🎉**
**All data is safe in MongoDB! ✅**
