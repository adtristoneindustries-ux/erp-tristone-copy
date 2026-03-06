const mongoose = require('mongoose');
const { Canteen, CanteenStaff, FoodItem, Order, Rating } = require('./models/Cafeteria');
const User = require('./models/User');
require('dotenv').config();

const seedCafeteria = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    await Canteen.deleteMany({});
    await CanteenStaff.deleteMany({});
    await FoodItem.deleteMany({});
    await Order.deleteMany({});
    await Rating.deleteMany({});

    const canteens = await Canteen.create([
      { name: 'Main Canteen', location: 'Ground Floor, Block A', openingTime: '08:00', closingTime: '18:00', contactNumber: '9876543210' },
      { name: 'Food Court', location: 'First Floor, Block B', openingTime: '09:00', closingTime: '20:00', contactNumber: '9876543211' }
    ]);
    console.log('Canteens created');

    const staffUsers = await User.create([
      { name: 'Rajesh Kumar', email: 'rajesh@canteen.com', password: 'staff123', role: 'staff', phone: '9876543220' },
      { name: 'Priya Sharma', email: 'priya@canteen.com', password: 'staff123', role: 'staff', phone: '9876543221' },
      { name: 'Amit Singh', email: 'amit@canteen.com', password: 'staff123', role: 'staff', phone: '9876543222' }
    ]);

    await CanteenStaff.create([
      { user: staffUsers[0]._id, staffId: 'CS001', canteen: canteens[0]._id, role: 'Manager' },
      { user: staffUsers[1]._id, staffId: 'CS002', canteen: canteens[0]._id, role: 'Cashier' },
      { user: staffUsers[2]._id, staffId: 'CS003', canteen: canteens[1]._id, role: 'Cook' }
    ]);
    console.log('Canteen staff created');

    const foodItems = await FoodItem.create([
      { name: 'Samosa', category: 'Snacks', price: 15, description: 'Crispy fried samosa', preparationTime: 5, quantityAvailable: 50, isAvailable: true, canteen: canteens[0]._id, isTodaySpecial: true },
      { name: 'Vada Pav', category: 'Snacks', price: 20, description: 'Mumbai style vada pav', preparationTime: 5, quantityAvailable: 40, isAvailable: true, canteen: canteens[0]._id },
      { name: 'Sandwich', category: 'Snacks', price: 30, description: 'Grilled veg sandwich', preparationTime: 10, quantityAvailable: 30, isAvailable: true, canteen: canteens[0]._id },
      { name: 'Pakora', category: 'Snacks', price: 25, description: 'Mixed veg pakora', preparationTime: 8, quantityAvailable: 35, isAvailable: true, canteen: canteens[1]._id },
      { name: 'Thali', category: 'Meals', price: 80, description: 'Complete meal with rice, roti, dal, sabzi', preparationTime: 15, quantityAvailable: 25, isAvailable: true, canteen: canteens[0]._id },
      { name: 'Biryani', category: 'Meals', price: 100, description: 'Veg biryani with raita', preparationTime: 20, quantityAvailable: 20, isAvailable: true, canteen: canteens[1]._id },
      { name: 'Fried Rice', category: 'Meals', price: 70, description: 'Veg fried rice', preparationTime: 15, quantityAvailable: 30, isAvailable: true, canteen: canteens[1]._id },
      { name: 'Paratha Combo', category: 'Meals', price: 60, description: 'Paratha with curd and pickle', preparationTime: 12, quantityAvailable: 20, isAvailable: true, canteen: canteens[0]._id },
      { name: 'Orange Juice', category: 'Juice', price: 30, description: 'Fresh orange juice', preparationTime: 3, quantityAvailable: 50, isAvailable: true, canteen: canteens[0]._id },
      { name: 'Mango Juice', category: 'Juice', price: 35, description: 'Fresh mango juice', preparationTime: 3, quantityAvailable: 40, isAvailable: true, canteen: canteens[1]._id },
      { name: 'Watermelon Juice', category: 'Juice', price: 25, description: 'Fresh watermelon juice', preparationTime: 3, quantityAvailable: 45, isAvailable: true, canteen: canteens[0]._id },
      { name: 'Tea', category: 'Beverages', price: 10, description: 'Hot tea', preparationTime: 2, quantityAvailable: 100, isAvailable: true, canteen: canteens[0]._id },
      { name: 'Coffee', category: 'Beverages', price: 15, description: 'Hot coffee', preparationTime: 3, quantityAvailable: 80, isAvailable: true, canteen: canteens[0]._id },
      { name: 'Cold Coffee', category: 'Beverages', price: 40, description: 'Chilled cold coffee', preparationTime: 5, quantityAvailable: 30, isAvailable: true, canteen: canteens[1]._id },
      { name: 'Lassi', category: 'Beverages', price: 30, description: 'Sweet lassi', preparationTime: 3, quantityAvailable: 35, isAvailable: true, canteen: canteens[1]._id }
    ]);
    console.log('Food items created');

    const students = await User.find({ role: 'student' }).limit(3);

    if (students.length > 0) {
      await Order.create([
        {
          customer: students[0]._id,
          items: [{ foodItem: foodItems[0]._id, quantity: 2, price: foodItems[0].price }],
          totalAmount: foodItems[0].price * 2,
          paymentMethod: 'UPI',
          status: 'Completed',
          canteen: canteens[0]._id
        },
        {
          customer: students[1]._id,
          items: [
            { foodItem: foodItems[4]._id, quantity: 1, price: foodItems[4].price },
            { foodItem: foodItems[11]._id, quantity: 1, price: foodItems[11].price }
          ],
          totalAmount: foodItems[4].price + foodItems[11].price,
          paymentMethod: 'Cash',
          status: 'Pending',
          canteen: canteens[0]._id
        },
        {
          customer: students[2]._id,
          items: [{ foodItem: foodItems[5]._id, quantity: 1, price: foodItems[5].price }],
          totalAmount: foodItems[5].price,
          paymentMethod: 'Card',
          status: 'In Preparation',
          canteen: canteens[1]._id
        }
      ]);
      console.log('Sample orders created');

      await Rating.create([
        { customer: students[0]._id, foodItem: foodItems[0]._id, rating: 5, review: 'Excellent samosas!' },
        { customer: students[1]._id, foodItem: foodItems[4]._id, rating: 4, review: 'Good thali, value for money' },
        { customer: students[2]._id, foodItem: foodItems[5]._id, rating: 5, review: 'Best biryani in campus!' }
      ]);
      console.log('Sample ratings created');

      for (const item of foodItems) {
        const itemRatings = await Rating.find({ foodItem: item._id });
        if (itemRatings.length > 0) {
          const avg = itemRatings.reduce((sum, r) => sum + r.rating, 0) / itemRatings.length;
          await FoodItem.findByIdAndUpdate(item._id, { averageRating: avg });
        }
      }
    }

    console.log('✅ Cafeteria module seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding cafeteria:', error);
    process.exit(1);
  }
};

seedCafeteria();
