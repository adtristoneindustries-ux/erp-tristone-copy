require('dotenv').config();
const mongoose = require('mongoose');

async function fixIndexes() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const db = mongoose.connection.db;
    const collection = db.collection('attendances');

    // Get existing indexes
    const indexes = await collection.indexes();
    console.log('Current indexes:', indexes.map(idx => ({ name: idx.name, key: idx.key })));

    // Drop the problematic index if it exists
    try {
      await collection.dropIndex('student_1_date_1');
      console.log('Dropped student_1_date_1 index');
    } catch (error) {
      console.log('Index student_1_date_1 not found or already dropped');
    }

    // Ensure correct index exists
    await collection.createIndex({ user: 1, date: 1 }, { unique: true });
    console.log('Created user_1_date_1 index');

    console.log('Index fix completed');
    process.exit(0);
  } catch (error) {
    console.error('Error fixing indexes:', error);
    process.exit(1);
  }
}

fixIndexes();