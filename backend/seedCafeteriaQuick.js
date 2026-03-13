require('dotenv').config();
const mongoose = require('mongoose');
const { Canteen, CanteenStaff, FoodItem, Order, Rating } = require('./models/Cafeteria');
const User = require('./models/User');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB Connected');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

const seedCafeteriaData = async () => {
  try {
    await connectDB();

    // Clear existing data
    await Canteen.deleteMany({});
    await CanteenStaff.deleteMany({});
    await FoodItem.deleteMany({});
    await Order.deleteMany({});
    await Rating.deleteMany({});

    console.log('🗑️  Cleared existing cafeteria data');

    // Create Canteen
    const canteen = await Canteen.create({
      name: 'Main Canteen',
      location: 'Ground Floor, Building A',
      openingTime: '08:00 AM',
      closingTime: '06:00 PM',
      contactNumber: '9876543210',
      isActive: true
    });

    console.log('✅ Created canteen');

    // Find staff user with canteen department
    let canteenStaffUser = await User.findOne({ role: 'staff', department: 'canteen' });
    
    if (!canteenStaffUser) {
      // Create a canteen staff user if doesn't exist
      canteenStaffUser = await User.create({
        name: 'Canteen Manager',
        email: 'canteen@school.com',
        password: '$2a$10$YourHashedPasswordHere', // staff123 hashed
        role: 'staff',
        department: 'canteen',
        phone: '9876543210'
      });
      console.log('✅ Created canteen staff user');
    }

    // Assign staff to canteen
    await CanteenStaff.create({
      user: canteenStaffUser._id,
      staffId: `CS${Date.now()}`,
      canteen: canteen._id,
      role: 'Manager',
      isActive: true
    });

    console.log('✅ Assigned staff to canteen');

    // Create Food Items
    const foodItems = [
      // Breakfast
      { name: 'Idli Sambar', category: 'Breakfast', price: 30, description: 'Soft idlis with sambar and chutney', available: true, isAvailable: true, canteen: canteen._id },
      { name: 'Dosa', category: 'Breakfast', price: 35, description: 'Crispy dosa with sambar and chutney', available: true, isAvailable: true, canteen: canteen._id },
      { name: 'Poha', category: 'Breakfast', price: 25, description: 'Flattened rice with vegetables', available: true, isAvailable: true, canteen: canteen._id },
      { name: 'Upma', category: 'Breakfast', price: 25, description: 'Semolina with vegetables', available: true, isAvailable: true, canteen: canteen._id },
      
      // Lunch
      { name: 'Veg Thali', category: 'Lunch', price: 60, description: 'Complete meal with rice, roti, dal, sabzi', available: true, isAvailable: true, canteen: canteen._id },
      { name: 'Chole Bhature', category: 'Lunch', price: 50, description: 'Spicy chickpeas with fried bread', available: true, isAvailable: true, canteen: canteen._id },
      { name: 'Biryani', category: 'Lunch', price: 70, description: 'Aromatic rice with vegetables', available: true, isAvailable: true, canteen: canteen._id },
      { name: 'Fried Rice', category: 'Lunch', price: 55, description: 'Chinese style fried rice', available: true, isAvailable: true, canteen: canteen._id },
      
      // Snacks
      { name: 'Samosa', category: 'Snacks', price: 15, description: 'Crispy fried pastry with potato filling', available: true, isAvailable: true, canteen: canteen._id },
      { name: 'Vada Pav', category: 'Snacks', price: 20, description: 'Potato fritter in a bun', available: true, isAvailable: true, canteen: canteen._id },
      { name: 'Sandwich', category: 'Snacks', price: 30, description: 'Grilled vegetable sandwich', available: true, isAvailable: true, canteen: canteen._id },
      { name: 'Pakora', category: 'Snacks', price: 25, description: 'Mixed vegetable fritters', available: true, isAvailable: true, canteen: canteen._id },
      
      // Beverages
      { name: 'Tea', category: 'Beverages', price: 10, description: 'Hot masala tea', available: true, isAvailable: true, canteen: canteen._id },
      { name: 'Coffee', category: 'Beverages', price: 15, description: 'Hot filter coffee', available: true, isAvailable: true, canteen: canteen._id },
      { name: 'Cold Coffee', category: 'Beverages', price: 30, description: 'Chilled coffee with ice cream', available: true, isAvailable: true, canteen: canteen._id },
      { name: 'Lassi', category: 'Beverages', price: 25, description: 'Sweet yogurt drink', available: true, isAvailable: true, canteen: canteen._id },
      { name: 'Fresh Juice', category: 'Beverages', price: 35, description: 'Seasonal fruit juice', available: true, isAvailable: true, canteen: canteen._id },
      
      // Desserts
      { name: 'Gulab Jamun', category: 'Desserts', price: 20, description: 'Sweet milk balls in sugar syrup', available: true, isAvailable: true, canteen: canteen._id },
      { name: 'Ice Cream', category: 'Desserts', price: 25, description: 'Vanilla ice cream', available: true, isAvailable: true, canteen: canteen._id },
      { name: 'Kheer', category: 'Desserts', price: 30, description: 'Rice pudding', available: true, isAvailable: true, canteen: canteen._id }
    ];

    await FoodItem.insertMany(foodItems);
    console.log('✅ Created food items');

    // Create sample orders
    const students = await User.find({ role: 'student' }).limit(3);
    if (students.length > 0) {
      const createdItems = await FoodItem.find().limit(5);
      
      const sampleOrders = [
        {
          customer: students[0]._id,
          items: [
            { foodItem: createdItems[0]._id, quantity: 2, price: createdItems[0].price },
            { foodItem: createdItems[1]._id, quantity: 1, price: createdItems[1].price }
          ],
          totalAmount: (createdItems[0].price * 2) + createdItems[1].price,
          paymentMethod: 'Cash',
          status: 'Completed',
          canteen: canteen._id,
          orderNumber: `ORD${Date.now()}1`
        },
        {
          customer: students[1]._id,
          items: [
            { foodItem: createdItems[2]._id, quantity: 1, price: createdItems[2].price }
          ],
          totalAmount: createdItems[2].price,
          paymentMethod: 'UPI',
          status: 'Pending',
          canteen: canteen._id,
          orderNumber: `ORD${Date.now()}2`
        },
        {
          customer: students[2]._id,
          items: [
            { foodItem: createdItems[3]._id, quantity: 3, price: createdItems[3].price }
          ],
          totalAmount: createdItems[3].price * 3,
          paymentMethod: 'Card',
          status: 'In Preparation',
          canteen: canteen._id,
          orderNumber: `ORD${Date.now()}3`
        }
      ];

      await Order.insertMany(sampleOrders);
      console.log('✅ Created sample orders');

      // Create sample ratings
      const sampleRatings = [
        {
          customer: students[0]._id,
          foodItem: createdItems[0]._id,
          rating: 5,
          comment: 'Excellent taste! Very fresh and delicious.',
          review: 'Excellent taste! Very fresh and delicious.'
        },
        {
          customer: students[1]._id,
          foodItem: createdItems[1]._id,
          rating: 4,
          comment: 'Good quality food. Could be a bit more spicy.',
          review: 'Good quality food. Could be a bit more spicy.'
        },
        {
          customer: students[2]._id,
          foodItem: createdItems[2]._id,
          rating: 5,
          comment: 'Best poha I have ever had!',
          review: 'Best poha I have ever had!'
        }
      ];

      await Rating.insertMany(sampleRatings);
      console.log('✅ Created sample ratings');
    }

    console.log('🎉 Cafeteria data seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding data:', error);
    process.exit(1);
  }
};

seedCafeteriaData();
