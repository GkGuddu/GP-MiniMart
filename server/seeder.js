const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Product = require('./models/Product');
const Category = require('./models/Category');
const User = require('./models/User');
const Order = require('./models/Order');
const Coupon = require('./models/Coupon');

dotenv.config();

const connect = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected');
    } catch (error) {
        console.error('Error:', error.message);
        process.exit(1);
    }
};

// Matched exactly with ShopPage.jsx
const categoryData = [
    {
        name: 'Grains & Rice',
        image: 'https://plus.unsplash.com/premium_photo-1671130295823-78f170465794?auto=format&fit=crop&w=800&q=80',
        subcategories: ['Basmati Rice', 'Sona Masuri', 'Brown Rice', 'Kolam Rice']
    },
    {
        name: 'Atta, Flours & Sooji',
        image: 'https://images.unsplash.com/photo-1609647273536-e41c469b8287?auto=format&fit=crop&w=800&q=80',
        subcategories: ['Wheat Atta', 'Maida', 'Besan', 'Sooji', 'Rice Flour']
    },
    {
        name: 'Dals & Pulses',
        image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=800&q=80',
        subcategories: ['Toor Dal', 'Moong Dal', 'Chana Dal', 'Urad Dal', 'Rajma', 'Kabuli Chana']
    },
    {
        name: 'Masala & Spices',
        image: 'https://images.unsplash.com/photo-1532336414038-cf0e671c6315?auto=format&fit=crop&w=800&q=80',
        subcategories: ['Turmeric Powder', 'Chilli Powder', 'Coriander Powder', 'Garam Masala', 'Whole Spices']
    },
    {
        name: 'Salt, Sugar & Jaggery',
        image: 'https://images.unsplash.com/photo-1581600140682-e8e89831f813?auto=format&fit=crop&w=800&q=80',
        subcategories: ['Salt', 'Sugar', 'Jaggery', 'Rock Salt']
    },
    {
        name: 'Oils & Ghee',
        image: 'https://images.unsplash.com/photo-1620706857370-e1b9770e8bb1?auto=format&fit=crop&w=800&q=80',
        subcategories: ['Sunflower Oil', 'Mustard Oil', 'Groundnut Oil', 'Ghee', 'Olive Oil']
    },
    {
        name: 'Dry Fruits & Nuts',
        image: 'https://images.unsplash.com/photo-1623428187969-5da2dcea5ebf?auto=format&fit=crop&w=800&q=80',
        subcategories: ['Almonds', 'Cashews', 'Raisins', 'Pistachios', 'Walnuts']
    },
    {
        name: 'Dairy & Bakery',
        image: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=800&q=80',
        subcategories: ['Milk', 'Curd', 'Paneer', 'Butter', 'Bread', 'Eggs', 'Toast']
    },
    {
        name: 'Snacks & Biscuits',
        image: 'https://images.unsplash.com/photo-1621447504864-d8686e12698c?auto=format&fit=crop&w=800&q=80',
        subcategories: ['Chips', 'Biscuits', 'Namkeen', 'Noodles', 'Chocolates']
    },
    {
        name: 'Beverages',
        image: 'https://images.unsplash.com/photo-1625772452859-1c03d5bf1137?auto=format&fit=crop&w=800&q=80',
        subcategories: ['Tea', 'Coffee', 'Soft Drinks', 'Juices', 'Health Drinks']
    },
    {
        name: 'Cleaning & Household',
        image: 'https://images.unsplash.com/photo-1584622050111-993a426fbf0a?auto=format&fit=crop&w=800&q=80',
        subcategories: ['Detergents', 'Dishwashers', 'Cleaners', 'Repellents', 'Disposables']
    },
    {
        name: 'Personal Care',
        image: 'https://images.unsplash.com/photo-1556228720-1957be83f704?auto=format&fit=crop&w=800&q=80',
        subcategories: ['Soaps', 'Shampoos', 'Toothpaste', 'Skin Care', 'Hair Oil']
    },
    {
        name: 'Pooja Needs',
        image: 'https://images.unsplash.com/photo-1510484501438-21d996452243?auto=format&fit=crop&w=800&q=80',
        subcategories: ['Agarbatti', 'Camphor', 'Pooja Oil', 'Cotton Wicks', 'Kumkum']
    }
];

const productTemplates = [
    // 1. Grains & Rice
    { name: 'India Gate Basmati Rice', unit: '5kg', mrp: 650, category: 'Grains & Rice', subcategory: 'Basmati Rice', image: 'https://m.media-amazon.com/images/I/71N1K7+rVBS._AC_UL320_.jpg' },
    { name: 'Sona Masuri Rice Premium', unit: '10kg', mrp: 550, category: 'Grains & Rice', subcategory: 'Sona Masuri', image: 'https://m.media-amazon.com/images/I/71Y-s9sC9wL._AC_UL320_.jpg' },
    { name: 'Daawat Rozana Gold', unit: '1kg', mrp: 110, category: 'Grains & Rice', subcategory: 'Basmati Rice', image: 'https://m.media-amazon.com/images/I/71N1K7+rVBS._AC_UL320_.jpg' },

    // 2. Atta, Flours & Sooji
    { name: 'Aashirvaad Shudh Chakki Atta', unit: '10kg', mrp: 460, category: 'Atta, Flours & Sooji', subcategory: 'Wheat Atta', image: 'https://m.media-amazon.com/images/I/81+f85e-fBL._AC_UL320_.jpg' },
    { name: 'Fortune Maida', unit: '500g', mrp: 35, category: 'Atta, Flours & Sooji', subcategory: 'Maida', image: 'https://m.media-amazon.com/images/I/61b7b7p+pPL._AC_UL320_.jpg' },
    { name: 'Rajdhani Sooji', unit: '500g', mrp: 32, category: 'Atta, Flours & Sooji', subcategory: 'Sooji', image: 'https://m.media-amazon.com/images/I/71qG+hF-0uL._AC_UL320_.jpg' },

    // 3. Dals & Pulses
    { name: 'Tata Sampann Toor Dal', unit: '1kg', mrp: 185, category: 'Dals & Pulses', subcategory: 'Toor Dal', image: 'https://m.media-amazon.com/images/I/71+7Q9k3hKL._AC_UL320_.jpg' },
    { name: 'Fortune Chana Dal', unit: '1kg', mrp: 110, category: 'Dals & Pulses', subcategory: 'Chana Dal', image: 'https://m.media-amazon.com/images/I/71q+1tD+0DL._AC_UL320_.jpg' },
    { name: 'Organic Moong Dal Yellow', unit: '500g', mrp: 95, category: 'Dals & Pulses', subcategory: 'Moong Dal', image: 'https://m.media-amazon.com/images/I/71Y-s9sC9wL._AC_UL320_.jpg' },

    // 4. Masala & Spices
    { name: 'Everest Turmeric Powder', unit: '200g', mrp: 62, category: 'Masala & Spices', subcategory: 'Turmeric Powder', image: 'https://m.media-amazon.com/images/I/71+7Q9k3hKL._AC_UL320_.jpg' },
    { name: 'MDH Deggi Mirch', unit: '100g', mrp: 98, category: 'Masala & Spices', subcategory: 'Chilli Powder', image: 'https://m.media-amazon.com/images/I/81+f85e-fBL._AC_UL320_.jpg' },
    { name: 'Catch Garam Masala', unit: '100g', mrp: 85, category: 'Masala & Spices', subcategory: 'Garam Masala', image: 'https://m.media-amazon.com/images/I/71qG+hF-0uL._AC_UL320_.jpg' },

    // 5. Salt, Sugar & Jaggery
    { name: 'Tata Salt Vacuum Evaporated', unit: '1kg', mrp: 28, category: 'Salt, Sugar & Jaggery', subcategory: 'Salt', image: 'https://m.media-amazon.com/images/I/61b7b7p+pPL._AC_UL320_.jpg' },
    { name: 'Madhur Pure Sugar', unit: '1kg', mrp: 58, category: 'Salt, Sugar & Jaggery', subcategory: 'Sugar', image: 'https://m.media-amazon.com/images/I/71Y-s9sC9wL._AC_UL320_.jpg' },
    { name: 'Organic Jaggery Powder', unit: '500g', mrp: 65, category: 'Salt, Sugar & Jaggery', subcategory: 'Jaggery', image: 'https://m.media-amazon.com/images/I/81+f85e-fBL._AC_UL320_.jpg' },

    // 6. Oils & Ghee
    { name: 'Fortune Refined Sunflower Oil', unit: '1L', mrp: 145, category: 'Oils & Ghee', subcategory: 'Sunflower Oil', image: 'https://m.media-amazon.com/images/I/71q+1tD+0DL._AC_UL320_.jpg' },
    { name: 'Dhara Mustard Oil', unit: '1L', mrp: 165, category: 'Oils & Ghee', subcategory: 'Mustard Oil', image: 'https://m.media-amazon.com/images/I/71N1K7+rVBS._AC_UL320_.jpg' },
    { name: 'Amul Pure Ghee', unit: '1L', mrp: 620, category: 'Oils & Ghee', subcategory: 'Ghee', image: 'https://m.media-amazon.com/images/I/81+f85e-fBL._AC_UL320_.jpg' },

    // 7. Dry Fruits & Nuts
    { name: 'Happilo Premium Almonds', unit: '200g', mrp: 285, category: 'Dry Fruits & Nuts', subcategory: 'Almonds', image: 'https://m.media-amazon.com/images/I/71Y-s9sC9wL._AC_UL320_.jpg' },
    { name: 'Nutraj Cashew Nuts', unit: '200g', mrp: 340, category: 'Dry Fruits & Nuts', subcategory: 'Cashews', image: 'https://m.media-amazon.com/images/I/71qG+hF-0uL._AC_UL320_.jpg' },
    { name: 'Lion Dates', unit: '500g', mrp: 160, category: 'Dry Fruits & Nuts', subcategory: 'Raisins', image: 'https://m.media-amazon.com/images/I/61b7b7p+pPL._AC_UL320_.jpg' },

    // 8. Dairy & Bakery
    { name: 'Amul Taaza Toned Milk', unit: '1L', mrp: 72, category: 'Dairy & Bakery', subcategory: 'Milk', image: 'https://m.media-amazon.com/images/I/71+7Q9k3hKL._AC_UL320_.jpg' },
    { name: 'Amul Butter Pasteurised', unit: '100g', mrp: 58, category: 'Dairy & Bakery', subcategory: 'Butter', image: 'https://m.media-amazon.com/images/I/81+f85e-fBL._AC_UL320_.jpg' },
    { name: 'Britannia 100% Whole Wheat Bread', unit: '450g', mrp: 50, category: 'Dairy & Bakery', subcategory: 'Bread', image: 'https://m.media-amazon.com/images/I/71q+1tD+0DL._AC_UL320_.jpg' },
    { name: 'Amul Cheese Slices', unit: '200g', mrp: 140, category: 'Dairy & Bakery', subcategory: 'Butter', image: 'https://m.media-amazon.com/images/I/71N1K7+rVBS._AC_UL320_.jpg' },

    // 9. Snacks & Biscuits
    { name: 'Lays India\'s Magic Masala', unit: '50g', mrp: 20, category: 'Snacks & Biscuits', subcategory: 'Chips', image: 'https://m.media-amazon.com/images/I/81+f85e-fBL._AC_UL320_.jpg' },
    { name: 'Parle-G Gold', unit: '1kg', mrp: 120, category: 'Snacks & Biscuits', subcategory: 'Biscuits', image: 'https://m.media-amazon.com/images/I/71qG+hF-0uL._AC_UL320_.jpg' },
    { name: 'Haldiram\'s Aloo Bhujia', unit: '200g', mrp: 55, category: 'Snacks & Biscuits', subcategory: 'Namkeen', image: 'https://m.media-amazon.com/images/I/71Y-s9sC9wL._AC_UL320_.jpg' },

    // 10. Beverages
    { name: 'Red Label Tea', unit: '500g', mrp: 380, category: 'Beverages', subcategory: 'Tea', image: 'https://m.media-amazon.com/images/I/71+7Q9k3hKL._AC_UL320_.jpg' },
    { name: 'Nescafe Classic Coffee', unit: '50g', mrp: 160, category: 'Beverages', subcategory: 'Coffee', image: 'https://m.media-amazon.com/images/I/61b7b7p+pPL._AC_UL320_.jpg' },
    { name: 'Thums Up Soft Drink', unit: '2.25L', mrp: 95, category: 'Beverages', subcategory: 'Soft Drinks', image: 'https://m.media-amazon.com/images/I/71N1K7+rVBS._AC_UL320_.jpg' },

    // 11. Cleaning & Household
    { name: 'Surf Excel Easy Wash', unit: '1kg', mrp: 135, category: 'Cleaning & Household', subcategory: 'Detergents', image: 'https://m.media-amazon.com/images/I/81+f85e-fBL._AC_UL320_.jpg' },
    { name: 'Vim Dishwash Bar', unit: '300g', mrp: 25, category: 'Cleaning & Household', subcategory: 'Dishwashers', image: 'https://m.media-amazon.com/images/I/71qG+hF-0uL._AC_UL320_.jpg' },
    { name: 'Lizol Floor Cleaner Citrus', unit: '500ml', mrp: 115, category: 'Cleaning & Household', subcategory: 'Cleaners', image: 'https://m.media-amazon.com/images/I/71Y-s9sC9wL._AC_UL320_.jpg' },

    // 12. Personal Care
    { name: 'Dettol Original Soap', unit: '125g', mrp: 45, category: 'Personal Care', subcategory: 'Soaps', image: 'https://m.media-amazon.com/images/I/71N1K7+rVBS._AC_UL320_.jpg' },
    { name: 'Dove Hair Fall Rescue Shampoo', unit: '180ml', mrp: 190, category: 'Personal Care', subcategory: 'Shampoos', image: 'https://m.media-amazon.com/images/I/71q+1tD+0DL._AC_UL320_.jpg' },
    { name: 'Colgate Strong Teeth', unit: '200g', mrp: 110, category: 'Personal Care', subcategory: 'Toothpaste', image: 'https://m.media-amazon.com/images/I/61b7b7p+pPL._AC_UL320_.jpg' },

    // 13. Pooja Needs
    { name: 'Cycle Pure Agarbatti', unit: '100 sticks', mrp: 60, category: 'Pooja Needs', subcategory: 'Agarbatti', image: 'https://m.media-amazon.com/images/I/81+f85e-fBL._AC_UL320_.jpg' },
    { name: 'Mangaldeep Camphor', unit: '50g', mrp: 45, category: 'Pooja Needs', subcategory: 'Camphor', image: 'https://m.media-amazon.com/images/I/71Y-s9sC9wL._AC_UL320_.jpg' },
    { name: 'Cotton Wicks (Batti)', unit: '100 pcs', mrp: 30, category: 'Pooja Needs', subcategory: 'Cotton Wicks', image: 'https://m.media-amazon.com/images/I/71qG+hF-0uL._AC_UL320_.jpg' },
    { name: 'Til Oil for Pooja', unit: '500ml', mrp: 120, category: 'Pooja Needs', subcategory: 'Pooja Oil', image: 'https://m.media-amazon.com/images/I/71+7Q9k3hKL._AC_UL320_.jpg' }
];

const importData = async () => {
    await connect();
    try {
        await Product.deleteMany();
        await Category.deleteMany();
        await User.deleteMany();
        await Order.deleteMany();
        await Coupon.deleteMany();

        console.log('Old Data Destroyed!');

        // 1. Create Users
        const createdUsers = await Promise.all([
            User.create({ name: 'Admin User', email: 'gkgudd860@gmail.com', password: 'Gkgp@0504', role: 'admin' }),
            User.create({ name: 'John Doe', email: 'user@example.com', password: 'password123', role: 'client' }),
        ]);
        const adminUser = createdUsers[0]._id;

        // 1b. Create Coupons
        const futureDate = new Date();
        futureDate.setMonth(futureDate.getMonth() + 6);
        await Coupon.insertMany([
            { code: 'WELCOME10', discount: 10, isActive: true, expiryDate: futureDate },
            { code: 'KIRANA50', discount: 15, isActive: true, expiryDate: futureDate },
            { code: 'SAVE20', discount: 20, isActive: true, expiryDate: futureDate }
        ]);

        // 2. Create Categories & Subcategories
        const categoryMap = {}; // name -> _id
        const subcategoryMap = {}; // name -> _id

        let catIndex = 0;
        for (const cat of categoryData) {
            const parentCat = await Category.create({
                name: cat.name,
                image: cat.image,
                description: `All kinds of ${cat.name}`,
                isFeatured: catIndex < 5,
            });
            categoryMap[cat.name] = parentCat._id;
            catIndex++;

            for (const sub of cat.subcategories) {
                const subCat = await Category.create({
                    name: sub,
                    image: cat.image, // Inherit image for now
                    parent: parentCat._id,
                });
                subcategoryMap[sub] = subCat._id;
            }
        }

        // 3. Create Products
        const products = productTemplates.map(p => {
            const price = Math.round(p.mrp * 0.95); // 5% Discount Logic
            if (!categoryMap[p.category]) console.error(`Category missing for: ${p.name}`);

            return {
                user: adminUser,
                name: p.name,
                image: p.image,
                description: `High quality ${p.name}. Fresh and authentic.`,
                brand: 'Generic',
                category: categoryMap[p.category],
                subcategory: subcategoryMap[p.subcategory],
                price: price,
                mrp: p.mrp,
                stock: 100,
                unit: p.unit,
                gst: 5, // Default 5% GST
                isActive: true,
            };
        });

        const createdProducts = await Product.insertMany(products);

        // 4. Create Dummy Orders (Last 10 Days)
        const orders = [];
        const today = new Date();

        for (let i = 0; i < 20; i++) {
            // Random date within last 10 days
            const date = new Date(today);
            date.setDate(date.getDate() - Math.floor(Math.random() * 10));

            // Random products (1-4 items)
            const orderItems = [];
            const numItems = Math.floor(Math.random() * 4) + 1;
            let totalPrice = 0;

            for (let j = 0; j < numItems; j++) {
                const randomProduct = createdProducts[Math.floor(Math.random() * createdProducts.length)];
                const qty = Math.floor(Math.random() * 3) + 1;
                orderItems.push({
                    name: randomProduct.name,
                    qty: qty,
                    image: randomProduct.image,
                    price: randomProduct.price,
                    product: randomProduct._id,
                });
                totalPrice += randomProduct.price * qty;
            }

            orders.push({
                user: adminUser, // Map all to admin for simplicity or random user
                orderItems,
                shippingAddress: {
                    address: '123 Fake St',
                    city: 'Mumbai',
                    postalCode: '400001',
                    country: 'India',
                },
                paymentMethod: 'UPI',
                paymentResult: {
                    id: `pay_${Math.random()}`,
                    status: 'COMPLETED',
                    update_time: Date.now(),
                    email_address: 'user@example.com',
                },
                itemsPrice: totalPrice,
                taxPrice: 0,
                shippingPrice: 0,
                totalPrice: totalPrice,
                isPaid: true,
                paidAt: date,
                isDelivered: Math.random() > 0.5,
                deliveredAt: Math.random() > 0.5 ? date : null,
                status: Math.random() > 0.5 ? 'Delivered' : 'Processing',
                createdAt: date, // Important for reports!
                invoiceNumber: `INV-${Date.now()}-${i}`
            });
        }

        await Order.insertMany(orders);

        console.log('Data Imported Successfully with Dummy Orders!');
        process.exit();
    } catch (error) {
        console.error('Error with data import:', JSON.stringify(error, null, 2));
        process.exit(1);
    }
};

importData();
