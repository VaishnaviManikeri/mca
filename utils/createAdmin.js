const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Admin = require('../models/Admin');

dotenv.config();

const createAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD;

    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ email: adminEmail });
    
    if (existingAdmin) {
      console.log('Admin already exists');
      process.exit(0);
    }

    // Create new admin
    const admin = await Admin.create({
      email: adminEmail,
      password: adminPassword
    });

    console.log('Admin created successfully:', admin.email);
    process.exit(0);
  } catch (error) {
    console.error('Error creating admin:', error);
    process.exit(1);
  }
};

createAdmin();