const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const User = require('./models/User');

dotenv.config();

const debugLogin = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected');

        const email = 'gkgudd860@gmail.com';
        const password = 'Gkgp@0504';

        // 1. Find User
        const user = await User.findOne({ email });

        if (!user) {
            console.log('❌ User NOT FOUND in database');
            process.exit(1);
        }

        console.log('✅ User FOUND:', user.email);
        console.log('   Role:', user.role);
        console.log('   Stored Hash:', user.password);

        // 2. Check Password
        const isMatch = await bcrypt.compare(password, user.password);

        if (isMatch) {
            console.log('✅ Password MATCHES! Login should work.');
        } else {
            console.log('❌ Password DOES NOT MATCH hash.');

            // Debug: Try re-hashing
            const salt = await bcrypt.genSalt(10);
            const newHash = await bcrypt.hash(password, salt);
            console.log('   Test Hash of "123456":', newHash);
        }

        process.exit();
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

debugLogin();
