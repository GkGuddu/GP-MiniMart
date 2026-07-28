const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const User = require('./models/User');

dotenv.config();

const resetAdmin = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected');

        // Delete existing admin
        await User.deleteOne({ email: 'admin@example.com' });
        console.log('Old Admin Removed');

        // Create new admin
        // Note: We pass plain text because User model has a pre-save hook that hashes the password!
        await User.create({
            name: 'Admin User',
            email: 'admin@example.com',
            password: '123456',
            role: 'admin'
        });

        console.log('New Admin Created: admin@example.com / 123456');
        process.exit();
    } catch (error) {
        console.error('Error:', error.message);
        process.exit(1);
    }
};

resetAdmin();
