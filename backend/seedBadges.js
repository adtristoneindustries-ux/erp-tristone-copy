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
    description: 'Achieved 90% or above in final exams',
    autoCalculate: false,
    calculationType: 'manual'
  },
  {
    name: 'Perfect Attendance',
    icon: '⭐',
    category: 'Attendance',
    description: '100% attendance for the month',
    autoCalculate: true,
    calculationType: 'perfect_attendance'
  },
  {
    name: 'Sports Champion',
    icon: '🥇',
    category: 'Sports',
    description: 'Won first place in sports competition',
    autoCalculate: false,
    calculationType: 'manual'
  },
  {
    name: 'Cultural Star',
    icon: '🎭',
    category: 'Cultural',
    description: 'Outstanding performance in cultural events',
    autoCalculate: false,
    calculationType: 'manual'
  },
  {
    name: 'Leadership Award',
    icon: '👑',
    category: 'Leadership',
    description: 'Demonstrated exceptional leadership skills',
    autoCalculate: false,
    calculationType: 'manual'
  },
  {
    name: 'Science Olympiad',
    icon: '🔬',
    category: 'Academic',
    description: 'Participated in Science Olympiad',
    autoCalculate: false,
    calculationType: 'manual'
  },
  {
    name: 'Community Service',
    icon: '💎',
    category: 'Service',
    description: 'Completed 50+ hours of community service',
    autoCalculate: false,
    calculationType: 'manual'
  },
  {
    name: 'Tech Innovator',
    icon: '🚀',
    category: 'Technology',
    description: 'Created innovative tech project',
    autoCalculate: false,
    calculationType: 'manual'
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
