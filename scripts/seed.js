const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/food_delivery';

// Models (simplified for seeding)
const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  role: String,
  phone: String,
  isActive: Boolean,
}, { timestamps: true });

const restaurantSchema = new mongoose.Schema({
  name: String,
  description: String,
  ownerId: mongoose.Schema.Types.ObjectId,
  address: String,
  location: {
    type: { type: String, default: 'Point' },
    coordinates: [Number],
  },
  phone: String,
  email: String,
  image: String,
  cuisine: [String],
  rating: Number,
  isActive: Boolean,
}, { timestamps: true });

const menuItemSchema = new mongoose.Schema({
  restaurantId: mongoose.Schema.Types.ObjectId,
  name: String,
  description: String,
  price: Number,
  category: String,
  image: String,
  isAvailable: Boolean,
  preparationTime: Number,
  tags: [String],
}, { timestamps: true });

const promotionSchema = new mongoose.Schema({
  code: String,
  description: String,
  type: String,
  value: Number,
  minOrderAmount: Number,
  maxDiscount: Number,
  startDate: Date,
  endDate: Date,
  usageLimit: Number,
  usageCount: Number,
  isActive: Boolean,
}, { timestamps: true });

async function seed() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    const User = mongoose.model('User', userSchema);
    const Restaurant = mongoose.model('Restaurant', restaurantSchema);
    const MenuItem = mongoose.model('MenuItem', menuItemSchema);
    const Promotion = mongoose.model('Promotion', promotionSchema);

    // Clear existing data
    await User.deleteMany({});
    await Restaurant.deleteMany({});
    await MenuItem.deleteMany({});
    await Promotion.deleteMany({});

    console.log('🗑️  Cleared existing data');

    // Create users
    const hashedPassword = await bcrypt.hash('password123', 10);

    const customer = await User.create({
      name: 'Customer Demo',
      email: 'customer@demo.com',
      password: hashedPassword,
      role: 'customer',
      phone: '0123456789',
      isActive: true,
    });

    const restaurantOwner = await User.create({
      name: 'Restaurant Owner',
      email: 'restaurant@demo.com',
      password: hashedPassword,
      role: 'restaurant',
      phone: '0987654321',
      isActive: true,
    });

    const driver = await User.create({
      name: 'Driver Demo',
      email: 'driver@demo.com',
      password: hashedPassword,
      role: 'driver',
      phone: '0912345678',
      isActive: true,
    });

    const admin = await User.create({
      name: 'Admin',
      email: 'admin@demo.com',
      password: hashedPassword,
      role: 'admin',
      phone: '0998877665',
      isActive: true,
    });

    console.log('👥 Created users');

    // Create restaurants
    const restaurant1 = await Restaurant.create({
      name: 'Phở Hà Nội',
      description: 'Phở bò truyền thống Hà Nội',
      ownerId: restaurantOwner._id,
      address: '123 Nguyễn Huệ, Quận 1, TP.HCM',
      location: {
        type: 'Point',
        coordinates: [106.7009, 10.7756],
      },
      phone: '0281234567',
      email: 'phohanoi@demo.com',
      cuisine: ['Vietnamese', 'Phở'],
      rating: 4.5,
      isActive: true,
    });

    const restaurant2 = await Restaurant.create({
      name: 'Pizza Italia',
      description: 'Pizza Ý chính gốc',
      ownerId: restaurantOwner._id,
      address: '456 Lê Lợi, Quận 1, TP.HCM',
      location: {
        type: 'Point',
        coordinates: [106.6989, 10.7718],
      },
      phone: '0287654321',
      email: 'pizzaitalia@demo.com',
      cuisine: ['Italian', 'Pizza'],
      rating: 4.8,
      isActive: true,
    });

    const restaurant3 = await Restaurant.create({
      name: 'Sushi Tokyo',
      description: 'Sushi và món Nhật cao cấp',
      ownerId: restaurantOwner._id,
      address: '789 Pasteur, Quận 3, TP.HCM',
      location: {
        type: 'Point',
        coordinates: [106.6903, 10.7855],
      },
      phone: '0289876543',
      email: 'sushitokyo@demo.com',
      cuisine: ['Japanese', 'Sushi'],
      rating: 4.7,
      isActive: true,
    });

    console.log('🏪 Created restaurants');

    // Create menu items for restaurant 1
    const phoMenuItems = [
      {
        restaurantId: restaurant1._id,
        name: 'Phở Bò Tái',
        description: 'Phở bò tái nạm',
        price: 50000,
        category: 'Phở',
        isAvailable: true,
        preparationTime: 15,
        tags: ['Popular', 'Beef'],
      },
      {
        restaurantId: restaurant1._id,
        name: 'Phở Gà',
        description: 'Phở gà truyền thống',
        price: 45000,
        category: 'Phở',
        isAvailable: true,
        preparationTime: 15,
        tags: ['Chicken'],
      },
      {
        restaurantId: restaurant1._id,
        name: 'Bún Chả Hà Nội',
        description: 'Bún chả thịt nướng',
        price: 55000,
        category: 'Bún',
        isAvailable: true,
        preparationTime: 20,
        tags: ['Popular', 'Grilled'],
      },
    ];

    // Create menu items for restaurant 2
    const pizzaMenuItems = [
      {
        restaurantId: restaurant2._id,
        name: 'Pizza Margherita',
        description: 'Pizza cổ điển với phô mai mozzarella',
        price: 120000,
        category: 'Pizza',
        isAvailable: true,
        preparationTime: 25,
        tags: ['Popular', 'Vegetarian'],
      },
      {
        restaurantId: restaurant2._id,
        name: 'Pizza Pepperoni',
        description: 'Pizza với pepperoni và phô mai',
        price: 150000,
        category: 'Pizza',
        isAvailable: true,
        preparationTime: 25,
        tags: ['Popular', 'Meat'],
      },
      {
        restaurantId: restaurant2._id,
        name: 'Pasta Carbonara',
        description: 'Pasta kem với bacon',
        price: 100000,
        category: 'Pasta',
        isAvailable: true,
        preparationTime: 20,
        tags: ['Creamy'],
      },
    ];

    // Create menu items for restaurant 3
    const sushiMenuItems = [
      {
        restaurantId: restaurant3._id,
        name: 'Sushi Set A',
        description: 'Gồm 12 miếng sushi tổng hợp',
        price: 250000,
        category: 'Sushi',
        isAvailable: true,
        preparationTime: 30,
        tags: ['Popular', 'Set'],
      },
      {
        restaurantId: restaurant3._id,
        name: 'Sashimi Set',
        description: 'Cá hồi, cá ngừ, bạch tuộc',
        price: 300000,
        category: 'Sashimi',
        isAvailable: true,
        preparationTime: 20,
        tags: ['Premium', 'Raw Fish'],
      },
      {
        restaurantId: restaurant3._id,
        name: 'Ramen Tonkotsu',
        description: 'Mì ramen nước dùng xương heo',
        price: 120000,
        category: 'Ramen',
        isAvailable: true,
        preparationTime: 25,
        tags: ['Hot', 'Soup'],
      },
    ];

    await MenuItem.insertMany([...phoMenuItems, ...pizzaMenuItems, ...sushiMenuItems]);
    console.log('🍽️  Created menu items');

    // Create promotions
    const now = new Date();
    const nextMonth = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    await Promotion.insertMany([
      {
        code: 'WELCOME10',
        description: 'Giảm 10% cho đơn hàng đầu tiên',
        type: 'percentage',
        value: 10,
        minOrderAmount: 50000,
        maxDiscount: 50000,
        startDate: now,
        endDate: nextMonth,
        usageLimit: 1000,
        usageCount: 0,
        isActive: true,
      },
      {
        code: 'FREESHIP',
        description: 'Miễn phí giao hàng',
        type: 'free_delivery',
        value: 15000,
        minOrderAmount: 100000,
        startDate: now,
        endDate: nextMonth,
        usageLimit: 500,
        usageCount: 0,
        isActive: true,
      },
      {
        code: 'SAVE50K',
        description: 'Giảm 50.000đ cho đơn từ 200k',
        type: 'fixed',
        value: 50000,
        minOrderAmount: 200000,
        startDate: now,
        endDate: nextMonth,
        usageLimit: 200,
        usageCount: 0,
        isActive: true,
      },
    ]);
    // Create more sample users
const moreCustomers = await User.insertMany([
  {
    name: 'Trần Thị B',
    email: 'customer2@demo.com',
    password: hashedPassword,
    role: 'customer',
    phone: '0901234567',
    isActive: true,
  },
  {
    name: 'Lê Văn C',
    email: 'customer3@demo.com',
    password: hashedPassword,
    role: 'customer',
    phone: '0902345678',
    isActive: true,
  },
]);

const moreDrivers = await User.insertMany([
  {
    name: 'Nguyễn Văn D',
    email: 'driver2@demo.com',
    password: hashedPassword,
    role: 'driver',
    phone: '0903456789',
    isActive: true,
  },
  {
    name: 'Phạm Thị E',
    email: 'driver3@demo.com',
    password: hashedPassword,
    role: 'driver',
    phone: '0904567890',
    isActive: true,
  },
]);


    console.log('🎫 Created promotions');
    console.log('👥 Created additional users');
    console.log('\n✅ Seeding completed successfully!');
    console.log('\n📝 Demo accounts:');
    console.log('Customer: customer@demo.com / password123');
    console.log('Restaurant: restaurant@demo.com / password123');
    console.log('Driver: driver@demo.com / password123');
    console.log('Admin: admin@demo.com / password123');
    console.log('\n🎫 Promo codes: WELCOME10, FREESHIP, SAVE50K');

    await mongoose.disconnect();
    console.log('\n👋 Disconnected from MongoDB');
  } catch (error) {
    console.error('❌ Seeding error:', error);
    process.exit(1);
  }
}

seed();