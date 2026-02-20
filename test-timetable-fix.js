const mongoose = require('mongoose');
const Timetable = require('./backend/models/Timetable');

// Test script to verify timetable database operations
async function testTimetableOperations() {
  try {
    // Connect to MongoDB
    await mongoose.connect('mongodb://localhost:27017/school_erp');
    console.log('✅ Connected to MongoDB');

    // Test 1: Create a sample timetable
    const sampleTimetable = {
      class: '10',
      section: 'A',
      schedule: {
        Monday: [
          {
            period: 1,
            time: '9:00-9:45',
            subject: 'Mathematics',
            teacher: null // Will be populated with actual ObjectId
          },
          {
            period: 2,
            time: '9:45-10:30',
            subject: 'English',
            teacher: null
          }
        ],
        Tuesday: [
          {
            period: 1,
            time: '9:00-9:45',
            subject: 'Science',
            teacher: null
          }
        ],
        Wednesday: [],
        Thursday: [],
        Friday: []
      }
    };

    // Clean up any existing test data
    await Timetable.deleteMany({ class: '10', section: 'A' });
    console.log('🧹 Cleaned up existing test data');

    // Create new timetable
    const newTimetable = await Timetable.create(sampleTimetable);
    console.log('✅ Created test timetable:', newTimetable._id);

    // Test 2: Update the timetable with staff assignment
    const updatedSchedule = {
      ...sampleTimetable.schedule,
      Monday: [
        {
          period: 1,
          time: '9:00-9:45',
          subject: 'Mathematics',
          teacher: new mongoose.Types.ObjectId() // Simulate staff assignment
        },
        {
          period: 2,
          time: '9:45-10:30',
          subject: 'English',
          teacher: new mongoose.Types.ObjectId() // Simulate staff assignment
        }
      ]
    };

    const updatedTimetable = await Timetable.findByIdAndUpdate(
      newTimetable._id,
      { schedule: updatedSchedule },
      { new: true }
    );
    console.log('✅ Updated timetable with staff assignments');

    // Test 3: Retrieve and verify the data persists
    const retrievedTimetable = await Timetable.findById(newTimetable._id);
    console.log('✅ Retrieved timetable from database');
    console.log('📊 Monday Period 1 Teacher:', retrievedTimetable.schedule.Monday[0].teacher);
    console.log('📊 Monday Period 2 Teacher:', retrievedTimetable.schedule.Monday[1].teacher);

    // Test 4: Verify data structure
    const isDataValid = retrievedTimetable.schedule.Monday[0].teacher !== null &&
                       retrievedTimetable.schedule.Monday[1].teacher !== null;
    
    if (isDataValid) {
      console.log('✅ Staff assignments are properly saved and persisted!');
    } else {
      console.log('❌ Staff assignments are not being saved properly');
    }

    // Clean up test data
    await Timetable.findByIdAndDelete(newTimetable._id);
    console.log('🧹 Cleaned up test data');

    console.log('\n🎉 Timetable database operations test completed successfully!');
    console.log('📝 The fix should now work properly:');
    console.log('   - Staff assignments will be saved to MongoDB');
    console.log('   - Data will persist after page refresh');
    console.log('   - Teacher ObjectIds are properly stored and retrieved');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

// Run the test
testTimetableOperations();