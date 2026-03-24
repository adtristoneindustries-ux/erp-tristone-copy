# Cafeteria Module Setup Guide

## ✅ What's Been Fixed

1. **Backend Routes** - Added proper endpoints for orders, menu, and ratings
2. **Frontend Pages** - Created 3 fully responsive pages:
   - Order Management (`/staff/cafeteria/orders`)
   - Menu Management (`/staff/cafeteria/menu`)
   - Ratings & Reviews (`/staff/cafeteria/ratings`)
3. **Database Models** - Updated to match frontend expectations
4. **Authorization** - Fixed middleware to allow staff with `department: 'canteen'` access

## 🚀 Quick Setup

### Step 1: Seed Cafeteria Data
```bash
cd backend
node seedCafeteriaQuick.js
```

This will create:
- ✅ Main Canteen
- ✅ 20 Food Items (Breakfast, Lunch, Snacks, Beverages, Desserts)
- ✅ Sample Orders
- ✅ Sample Ratings
- ✅ Canteen Staff Assignment

### Step 2: Create/Update Canteen Staff User

**Option A: Update existing staff user**
```javascript
// In MongoDB or through admin panel
db.users.updateOne(
  { email: 'staff@school.com' },
  { $set: { department: 'canteen' } }
)
```

**Option B: Create new canteen staff**
```javascript
{
  name: 'Canteen Manager',
  email: 'canteen@school.com',
  password: 'staff123',
  role: 'staff',
  department: 'canteen',
  phone: '9876543210'
}
```

### Step 3: Restart Backend Server
```bash
cd backend
npm run dev
```

### Step 4: Login & Test
1. Login with canteen staff credentials
2. Navigate to `/staff/cafeteria`
3. Test all three modules:
   - Dashboard (stats overview)
   - Orders (manage order status)
   - Menu (add/edit/delete items)
   - Ratings (view customer feedback)

## 📋 API Endpoints

### Orders
- `GET /api/cafeteria/orders` - Get all orders
- `PUT /api/cafeteria/orders/:id` - Update order status
- `POST /api/cafeteria/order` - Place new order (for students)

### Menu
- `GET /api/cafeteria/menu` - Get all menu items
- `POST /api/cafeteria/menu` - Add new item
- `PUT /api/cafeteria/menu/:id` - Update item
- `DELETE /api/cafeteria/menu/:id` - Delete item

### Ratings
- `GET /api/cafeteria/ratings` - Get all ratings
- `POST /api/cafeteria/rate` - Submit rating (for students)

### Dashboard
- `GET /api/dashboard/canteen` - Get canteen statistics

## 🎯 Features

### Order Management
- View all orders in card layout
- Filter by status (Pending, In Preparation, Ready, Completed, Cancelled)
- Search by customer name or order number
- Update order status with action buttons
- Real-time status updates

### Menu Management
- Grid view of all food items
- Add/Edit/Delete items
- Filter by category
- Search functionality
- Toggle availability
- Set pricing and descriptions

### Ratings & Reviews
- Average rating display
- Rating distribution chart
- Filter by star rating
- View customer comments
- Responsive card layout

## 🔧 Troubleshooting

### 404 Errors
- Ensure backend server is running on port 5000
- Check that cafeteria routes are registered in server.js
- Verify user has `department: 'canteen'` field

### 403 Forbidden
- User must have `role: 'staff'` AND `department: 'canteen'`
- Or use the authorization middleware update

### Empty Data
- Run the seed script: `node seedCafeteriaQuick.js`
- Check MongoDB connection
- Verify data was created in database

## 📱 Responsive Design

All pages are fully responsive:
- **Mobile**: 320px - 767px (single column, stacked cards)
- **Tablet**: 768px - 1023px (2 columns)
- **Desktop**: 1024px+ (3-4 columns)

## 🎨 UI Features

- Modern card-based layouts
- Color-coded status badges
- Interactive hover effects
- Modal forms for add/edit
- Search and filter functionality
- Smooth transitions and animations
- Clean typography and spacing

## ✨ Next Steps

1. Add real-time order notifications using Socket.IO
2. Implement order history and analytics
3. Add inventory management
4. Create student ordering interface
5. Add payment gateway integration
6. Generate sales reports
