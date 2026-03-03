require('dotenv').config();
const mongoose = require('mongoose');
const Activity = require('./models/Activity');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB connected');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

const sampleActivities = [
  {
    title: 'Science Club',
    type: 'club',
    description: 'Explore the wonders of science through experiments and projects',
    icon: '🔬',
    memberCount: 25,
    maxMembers: 50,
    activities: [
      {
        title: 'Science Fair Preparation',
        description: 'Prepare projects for the annual science fair',
        date: new Date('2024-02-15'),
        location: 'Science Lab'
      },
      {
        title: 'Guest Lecture on Robotics',
        description: 'Learn about robotics from industry experts',
        date: new Date('2024-02-20'),
        location: 'Auditorium'
      }
    ]
  },
  {
    title: 'Literary Club',
    type: 'club',
    description: 'Enhance your reading, writing, and public speaking skills',
    icon: '📚',
    memberCount: 30,
    maxMembers: 40,
    activities: [
      {
        title: 'Book Discussion',
        description: 'Monthly book club meeting',
        date: new Date('2024-02-10'),
        location: 'Library'
      },
      {
        title: 'Creative Writing Workshop',
        description: 'Learn creative writing techniques',
        date: new Date('2024-02-25'),
        location: 'Room 201'
      }
    ]
  },
  {
    title: 'Music Club',
    type: 'club',
    description: 'Learn and perform various musical instruments and vocals',
    icon: '🎵',
    memberCount: 20,
    maxMembers: 35,
    activities: [
      {
        title: 'Band Practice',
        description: 'Weekly band rehearsal',
        date: new Date('2024-02-12'),
        location: 'Music Room'
      }
    ]
  },
  {
    title: 'Art & Craft Club',
    type: 'club',
    description: 'Express your creativity through various art forms',
    icon: '🎨',
    memberCount: 18,
    maxMembers: 30,
    activities: [
      {
        title: 'Painting Workshop',
        description: 'Learn watercolor techniques',
        date: new Date('2024-02-18'),
        location: 'Art Studio'
      }
    ]
  },
  {
    title: 'Advanced Mathematics',
    type: 'course',
    description: 'Deep dive into calculus, algebra, and problem-solving',
    icon: '📐',
    memberCount: 15,
    maxMembers: 25,
    activities: [
      {
        title: 'Calculus Workshop',
        description: 'Advanced calculus problem solving',
        date: new Date('2024-02-14'),
        location: 'Room 305'
      }
    ]
  },
  {
    title: 'Computer Programming',
    type: 'course',
    description: 'Learn Python, Java, and web development',
    icon: '💻',
    memberCount: 28,
    maxMembers: 30,
    activities: [
      {
        title: 'Python Basics',
        description: 'Introduction to Python programming',
        date: new Date('2024-02-16'),
        location: 'Computer Lab'
      },
      {
        title: 'Web Development Project',
        description: 'Build your first website',
        date: new Date('2024-02-22'),
        location: 'Computer Lab'
      }
    ]
  },
  {
    title: 'Public Speaking',
    type: 'course',
    description: 'Master the art of effective communication and presentation',
    icon: '🎤',
    memberCount: 12,
    maxMembers: 20,
    activities: [
      {
        title: 'Speech Practice',
        description: 'Practice impromptu speaking',
        date: new Date('2024-02-19'),
        location: 'Auditorium'
      }
    ]
  },
  {
    title: 'Basketball',
    type: 'sport',
    description: 'Join the school basketball team and compete in tournaments',
    icon: '🏀',
    memberCount: 22,
    maxMembers: 25,
    activities: [
      {
        title: 'Team Practice',
        description: 'Regular basketball practice session',
        date: new Date('2024-02-13'),
        location: 'Basketball Court'
      },
      {
        title: 'Inter-School Match',
        description: 'Match against rival school',
        date: new Date('2024-02-28'),
        location: 'Main Stadium'
      }
    ]
  },
  {
    title: 'Football',
    type: 'sport',
    description: 'Train with the school football team',
    icon: '⚽',
    memberCount: 26,
    maxMembers: 30,
    activities: [
      {
        title: 'Training Session',
        description: 'Weekly football training',
        date: new Date('2024-02-11'),
        location: 'Football Field'
      }
    ]
  },
  {
    title: 'Cricket',
    type: 'sport',
    description: 'Practice and play cricket at competitive level',
    icon: '🏏',
    memberCount: 24,
    maxMembers: 28,
    activities: [
      {
        title: 'Net Practice',
        description: 'Batting and bowling practice',
        date: new Date('2024-02-17'),
        location: 'Cricket Ground'
      }
    ]
  },
  {
    title: 'Swimming',
    type: 'sport',
    description: 'Learn swimming techniques and compete in events',
    icon: '🏊',
    memberCount: 16,
    maxMembers: 20,
    activities: [
      {
        title: 'Swimming Training',
        description: 'Technique improvement session',
        date: new Date('2024-02-21'),
        location: 'Swimming Pool'
      }
    ]
  },
  {
    title: 'Chess Club',
    type: 'club',
    description: 'Improve your strategic thinking through chess',
    icon: '♟️',
    memberCount: 14,
    maxMembers: 25,
    activities: [
      {
        title: 'Chess Tournament',
        description: 'Monthly chess competition',
        date: new Date('2024-02-24'),
        location: 'Activity Room'
      }
    ]
  }
];

const seedActivities = async () => {
  try {
    await connectDB();
    
    await Activity.deleteMany({});
    console.log('🗑️  Cleared existing activities');
    
    await Activity.insertMany(sampleActivities);
    console.log('✅ Sample activities seeded successfully');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding activities:', error);
    process.exit(1);
  }
};

seedActivities();
