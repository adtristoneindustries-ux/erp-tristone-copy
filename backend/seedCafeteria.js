require('dotenv').config();
const mongoose = require('mongoose');
const { MenuItem, Special } = require('./models/Cafeteria');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB Connected');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

const seedCafeteria = async () => {
  try {
    await connectDB();

    // Clear existing data
    await MenuItem.deleteMany({});
    await Special.deleteMany({});

    // Create menu items
    const menuItems = [
      {
        name: 'Breakfast',
        items: ['Oatmeal', 'Toast', 'Fruits', 'Juice'],
        calories: 350,
        price: 50,
        rating: 5,
        available: true
      },
      {
        name: 'Lunch',
        items: ['Rice', 'Dal', 'Vegetables', 'Roti'],
        calories: 650,
        price: 120,
        rating: 5,
        available: true
      },
      {
        name: 'Snacks',
        items: ['Sandwich', 'Tea/Coffee', 'Cookies'],
        calories: 200,
        price: 40,
        rating: 5,
        available: true
      },
      {
        name: 'Dinner',
        items: ['Rice', 'Curry', 'Salad', 'Dessert'],
        calories: 550,
        price: 100,
        rating: 5,
        available: true
      }
    ];

    await MenuItem.insertMany(menuItems);
    console.log('✅ Menu items created');

    // Create today's specials
    const specials = [
      {
        name: 'Biryani Special',
        description: 'Delicious chicken biryani with raita',
        price: 150,
        image: '/images/biryani.jpg',
        rating: 5,
        available: true
      },
      {
        name: 'Pizza Combo',
        description: 'Large pizza with soft drink',
        price: 180,
        image: '/images/pizza.jpg',
        rating: 5,
        available: true
      }
    ];

    await Special.insertMany(specials);
    console.log('✅ Specials created');

    console.log('✅ Cafeteria seeding completed!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding cafeteria:', error);
    process.exit(1);
  }
};

seedCafeteria();
