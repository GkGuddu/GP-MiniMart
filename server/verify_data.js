const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Product = require('./models/Product');
const Category = require('./models/Category');

dotenv.config();

const verify = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const catCount = await Category.countDocuments();
        const prodCount = await Product.countDocuments();

        console.log(`Categories: ${catCount}`);
        console.log(`Products: ${prodCount}`);

        if (catCount > 10 && prodCount > 50) {
            console.log('VERIFICATION SUCCESS');
        } else {
            console.log('VERIFICATION FAILED');
        }
        process.exit();
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

verify();
