const mongoose = require('mongoose');
const BookCategory = require('./models/BookCategory');
const Book = require('./models/Book');
require('dotenv').config();

const seedLibrary = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing data
    await BookCategory.deleteMany({});
    await Book.deleteMany({});
    console.log('Cleared existing library data');

    // Create categories
    const categories = await BookCategory.insertMany([
      { name: 'Computer Science', description: 'Programming, algorithms, data structures' },
      { name: 'Mathematics', description: 'Calculus, algebra, statistics' },
      { name: 'Physics', description: 'Mechanics, thermodynamics, quantum physics' },
      { name: 'Chemistry', description: 'Organic, inorganic, physical chemistry' },
      { name: 'Literature', description: 'Novels, poetry, drama' },
      { name: 'History', description: 'World history, ancient civilizations' },
      { name: 'Business', description: 'Management, economics, finance' },
      { name: 'Engineering', description: 'Mechanical, electrical, civil engineering' }
    ]);
    console.log('Created categories');

    // Create sample books
    const books = await Book.insertMany([
      {
        title: 'Introduction to Algorithms',
        isbn: '978-0262033848',
        author: 'Thomas H. Cormen',
        publisher: 'MIT Press',
        edition: '3rd Edition',
        category: categories[0]._id,
        language: 'English',
        total_copies: 5,
        available_copies: 5,
        rack_number: 'A1',
        shelf_number: 'S1',
        description: 'Comprehensive guide to algorithms',
        barcode: 'BK' + Date.now()
      },
      {
        title: 'Clean Code',
        isbn: '978-0132350884',
        author: 'Robert C. Martin',
        publisher: 'Prentice Hall',
        edition: '1st Edition',
        category: categories[0]._id,
        language: 'English',
        total_copies: 3,
        available_copies: 3,
        rack_number: 'A1',
        shelf_number: 'S2',
        description: 'A handbook of agile software craftsmanship',
        barcode: 'BK' + (Date.now() + 1)
      },
      {
        title: 'Calculus: Early Transcendentals',
        isbn: '978-1285741550',
        author: 'James Stewart',
        publisher: 'Cengage Learning',
        edition: '8th Edition',
        category: categories[1]._id,
        language: 'English',
        total_copies: 10,
        available_copies: 10,
        rack_number: 'B1',
        shelf_number: 'S1',
        description: 'Comprehensive calculus textbook',
        barcode: 'BK' + (Date.now() + 2)
      },
      {
        title: 'Physics for Scientists and Engineers',
        isbn: '978-1133947271',
        author: 'Raymond A. Serway',
        publisher: 'Cengage Learning',
        edition: '9th Edition',
        category: categories[2]._id,
        language: 'English',
        total_copies: 8,
        available_copies: 8,
        rack_number: 'C1',
        shelf_number: 'S1',
        description: 'Comprehensive physics textbook',
        barcode: 'BK' + (Date.now() + 3)
      },
      {
        title: 'Organic Chemistry',
        isbn: '978-0321803221',
        author: 'Paula Yurkanis Bruice',
        publisher: 'Pearson',
        edition: '7th Edition',
        category: categories[3]._id,
        language: 'English',
        total_copies: 6,
        available_copies: 6,
        rack_number: 'D1',
        shelf_number: 'S1',
        description: 'Comprehensive organic chemistry textbook',
        barcode: 'BK' + (Date.now() + 4)
      }
    ]);
    console.log('Created sample books');

    console.log('✅ Library seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding library:', error);
    process.exit(1);
  }
};

seedLibrary();
