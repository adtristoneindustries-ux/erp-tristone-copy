require('dotenv').config();
const mongoose = require('mongoose');
const Badge = require('./models/Badge');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB Connected');
  } catch (error) {
    console.error('❌ MongoDB Connection Error:', error);
    process.exit(1);
  }
};

const sampleBadges = [
  {
    name: 'Academic Excellence',
    icon: '🏆',
    category: 'Academic',
    description: 'Achieved 90% or above in final exams'
  },
  {
    name: 'Perfect Attendance',
    icon: '⭐',
    category: 'Attendance',
    description: '100% attendance for the semester'
  },
  {
    name: 'Sports Champion',
    icon: '🥇',
    category: 'Sports',
    description: 'Won first place in sports competition'
  },
  {
    name: 'Cultural Star',
    icon: '🎭',
    category: 'Cultural',
    description: 'Outstanding performance in cultural events'
  },
  {
    name: 'Leadership Award',
    icon: '👑',
    category: 'Leadership',
    description: 'Demonstrated exceptional leadership skills'
  },
  {
    name: 'Science Olympiad',
    icon: '🔬',
    category: 'Academic',
    description: 'Participated in Science Olympiad'
  },
  {
    name: 'Community Service',
    icon: '💎',
    category: 'Service',
    description: 'Completed 50+ hours of community service'
  },
  {
    name: 'Tech Innovator',
    icon: '🚀',
    category: 'Technology',
    description: 'Created innovative tech project'
  }
];

const seedBadges = async () => {
  try {
    await connectDB();
    
    // Clear existing badges
    await Badge.deleteMany({});
    console.log('🗑️  Cleared existing badges');
    
    // Insert sample badges
    await Badge.insertMany(sampleBadges);
    console.log('✅ Sample badges created successfully');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding badges:', error);
    process.exit(1);
  }
};

seedBadges();
