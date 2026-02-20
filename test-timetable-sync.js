// Test script to verify timetable synchronization
const axios = require('axios');

const API_BASE = 'http://localhost:5000/api';

// Test credentials (use actual tokens from your system)
const ADMIN_TOKEN = 'your_admin_token_here';
const STAFF_TOKEN = 'your_staff_token_here';

async function testTimetableSync() {
  try {
    console.log('🧪 Testing Timetable Synchronization...\n');

    // 1. Get staff list
    console.log('1. Fetching staff list...');
    const staffResponse = await axios.get(`${API_BASE}/timetable/staff/list`, {
      headers: { Authorization: `Bearer ${ADMIN_TOKEN}` }
    });
    const staff = staffResponse.data;
    console.log(`✅ Found ${staff.length} staff members\n`);

    if (staff.length === 0) {
      console.log('❌ No staff found. Please add staff members first.');
      return;
    }

    const testStaffId = staff[0]._id;
    console.log(`📋 Using staff member: ${staff[0].name} (ID: ${testStaffId})\n`);

    // 2. Get staff timetable (should show free hours initially)
    console.log('2. Fetching staff timetable (initial state)...');
    const initialTimetable = await axios.get(`${API_BASE}/timetable/staff/${testStaffId}`, {
      headers: { Authorization: `Bearer ${STAFF_TOKEN}` }
    });
    
    const mondayPeriods = initialTimetable.data.Monday || [];
    const freeHours = mondayPeriods.filter(p => p.type === 'free').length;
    const assignedHours = mondayPeriods.filter(p => p.type === 'assigned').length;
    
    console.log(`✅ Staff timetable loaded:`);
    console.log(`   - Free hours: ${freeHours}`);
    console.log(`   - Assigned hours: ${assignedHours}\n`);

    // 3. Create a test timetable with staff assignment
    console.log('3. Creating test timetable with staff assignment...');
    const testTimetable = {
      class: 'Test Class',
      section: 'A',
      schedule: {
        Monday: [
          {
            period: 1,
            time: '9:00-9:45',
            subject: 'Mathematics',
            teacher: testStaffId
          },
          {
            period: 2,
            time: '9:45-10:30',
            subject: 'Science',
            teacher: testStaffId
          }
        ],
        Tuesday: [],
        Wednesday: [],
        Thursday: [],
        Friday: []
      }
    };

    const createResponse = await axios.post(`${API_BASE}/timetable`, testTimetable, {
      headers: { Authorization: `Bearer ${ADMIN_TOKEN}` }
    });
    console.log(`✅ Test timetable created with ID: ${createResponse.data._id}\n`);

    // 4. Wait a moment for real-time sync
    console.log('4. Waiting for real-time synchronization...');
    await new Promise(resolve => setTimeout(resolve, 1000));

    // 5. Check staff timetable again (should show assigned periods)
    console.log('5. Fetching updated staff timetable...');
    const updatedTimetable = await axios.get(`${API_BASE}/timetable/staff/${testStaffId}`, {
      headers: { Authorization: `Bearer ${STAFF_TOKEN}` }
    });
    
    const updatedMondayPeriods = updatedTimetable.data.Monday || [];
    const updatedFreeHours = updatedMondayPeriods.filter(p => p.type === 'free').length;
    const updatedAssignedHours = updatedMondayPeriods.filter(p => p.type === 'assigned').length;
    
    console.log(`✅ Updated staff timetable:`);
    console.log(`   - Free hours: ${updatedFreeHours}`);
    console.log(`   - Assigned hours: ${updatedAssignedHours}`);
    
    if (updatedAssignedHours > assignedHours) {
      console.log('🎉 SUCCESS: Timetable synchronization is working!\n');
      
      // Show assigned periods
      const assignedPeriods = updatedMondayPeriods.filter(p => p.type === 'assigned');
      console.log('📚 Assigned periods:');
      assignedPeriods.forEach(period => {
        console.log(`   - Period ${period.period} (${period.time}): ${period.subject} - Class ${period.class} ${period.section}`);
      });
    } else {
      console.log('❌ FAILED: Timetable synchronization not working properly\n');
    }

    // 6. Cleanup - delete test timetable
    console.log('\n6. Cleaning up test data...');
    await axios.delete(`${API_BASE}/timetable/${createResponse.data._id}`, {
      headers: { Authorization: `Bearer ${ADMIN_TOKEN}` }
    });
    console.log('✅ Test timetable deleted\n');

    console.log('🏁 Test completed successfully!');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data?.message || error.message);
  }
}

// Instructions for running the test
console.log(`
📋 TIMETABLE SYNCHRONIZATION TEST
=================================

Before running this test:
1. Start your backend server (npm run dev)
2. Replace ADMIN_TOKEN and STAFF_TOKEN with actual JWT tokens
3. Ensure you have at least one staff member in the database

To get tokens:
1. Login as admin/staff through the frontend
2. Check browser localStorage for 'token'
3. Copy the token values to this script

Run: node test-timetable-sync.js
`);

// Uncomment the line below to run the test
// testTimetableSync();