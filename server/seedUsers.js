require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

const MONGO_URI = process.env.MONGO_URI;

async function seedUsers() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB');

    // Clear existing users
    await User.deleteMany({});
    console.log('Cleared existing users');

    // Create admin user
    const admin = new User({
      name: 'Admin User',
      email: 'admin@gmail.com',
      passwordHash: 'admin123',
      role: 'admin'
    });
    await admin.save();
    console.log('Created admin user');

    // Create regular user
    const user = new User({
      name: 'Regular User',
      email: 'user@gmail.com',
      passwordHash: 'user123',
      role: 'viewer'
    });
    await user.save();
    console.log('Created regular user');

    console.log('\nUsers seeded successfully!');
    console.log('Admin: admin@gmail.com / admin123');
    console.log('User: user@gmail.com / user123');

    process.exit(0);
  } catch (error) {
    console.error('Error seeding users:', error);
    process.exit(1);
  }
}

seedUsers();
