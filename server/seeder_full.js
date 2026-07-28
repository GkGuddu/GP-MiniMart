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

// 20 Categories with Subcategories (15 + 5 New)
const categoryData = [
    // --- Original 15 ---
    {
        name: 'Atta, Flours & Sooji',
        image: 'https://images.unsplash.com/photo-1609647273536-e41c469b8287?auto=format&fit=crop&w=800&q=80',
        subcategories: ['Wheat Atta', 'Maida', 'Besan', 'Sooji / Rava', 'Multigrain Flour']
    },
    {
        name: 'Rice & Grains',
        image: 'https://plus.unsplash.com/premium_photo-1671130295823-78f170465794?auto=format&fit=crop&w=800&q=80',
        subcategories: ['Basmati Rice', 'Regular Rice', 'Brown Rice', 'Poha', 'Millets']
    },
    {
        name: 'Dals & Pulses',
        image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=800&q=80',
        subcategories: ['Toor Dal', 'Moong Dal', 'Masoor Dal', 'Chana Dal', 'Rajma & Chole']
    },
    {
        name: 'Oil & Ghee',
        image: 'https://images.unsplash.com/photo-1620706857370-e1b9770e8bb1?auto=format&fit=crop&w=800&q=80',
        subcategories: ['Mustard Oil', 'Sunflower Oil', 'Soybean Oil', 'Desi Ghee', 'Coconut Oil']
    },
    {
        name: 'Masala & Spices',
        image: 'https://images.unsplash.com/photo-1532336414038-cf0e671c6315?auto=format&fit=crop&w=800&q=80',
        subcategories: ['Powdered Spices', 'Whole Spices', 'Blended Masala', 'Dry Herbs', 'Ginger-Garlic']
    },
    {
        name: 'Salt, Sugar & Jaggery',
        image: 'https://images.unsplash.com/photo-1581600140682-e8e89831f813?auto=format&fit=crop&w=800&q=80',
        subcategories: ['Salt', 'Sugar', 'Jaggery', 'Sweeteners', 'Flavored Sugar']
    },
    {
        name: 'Dry Fruits & Nuts',
        image: 'https://images.unsplash.com/photo-1623428187969-5da2dcea5ebf?auto=format&fit=crop&w=800&q=80',
        subcategories: ['Almonds', 'Cashews', 'Raisins', 'Pistachios', 'Mixed Nuts']
    },
    {
        name: 'Snacks & Biscuits',
        image: 'https://images.unsplash.com/photo-1621447504864-d8686e12698c?auto=format&fit=crop&w=800&q=80',
        subcategories: ['Chips', 'Namkeen', 'Cream Biscuits', 'Glucose Biscuits', 'Khakhra & Snacks']
    },
    {
        name: 'Beverages',
        image: 'https://images.unsplash.com/photo-1625772452859-1c03d5bf1137?auto=format&fit=crop&w=800&q=80',
        subcategories: ['Tea', 'Coffee', 'Soft Drinks', 'Juices', 'Health Drinks']
    },
    {
        name: 'Dairy & Bakery',
        image: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=800&q=80',
        subcategories: ['Milk', 'Curd & Paneer', 'Butter & Cheese', 'Bread', 'Cakes']
    },
    {
        name: 'Instant & Ready-to-Eat',
        image: 'https://images.unsplash.com/photo-1612929633738-8fe44f7ec841?auto=format&fit=crop&w=800&q=80',
        subcategories: ['Instant Noodles', 'Pasta', 'Breakfast Mix', 'Soups', 'Ready Meals']
    },
    {
        name: 'Frozen Foods',
        image: 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?auto=format&fit=crop&w=800&q=80',
        subcategories: ['Frozen Veg', 'Frozen Snacks', 'Ice Cream', 'Frozen Non-Veg', 'Frozen Paratha']
    },
    {
        name: 'Personal Care',
        image: 'https://images.unsplash.com/photo-1556228720-1957be83f704?auto=format&fit=crop&w=800&q=80',
        subcategories: ['Soaps', 'Shampoos', 'Oral Care', 'Hair Oil', 'Deodorants']
    },
    {
        name: 'Cleaning & Household',
        image: 'https://images.unsplash.com/photo-1584622050111-993a426fbf0a?auto=format&fit=crop&w=800&q=80',
        subcategories: ['Detergents', 'Dishwash', 'Floor Cleaner', 'Toilet Cleaner', 'Cleaning Tools']
    },
    {
        name: 'Baby Care',
        image: 'https://images.unsplash.com/photo-1519689680058-324335c77eba?auto=format&fit=crop&w=800&q=80',
        subcategories: ['Diapers', 'Baby Food', 'Baby Bath', 'Baby Skin Care', 'Feeding']
    },

    // --- New 5 Categories ---
    {
        name: 'Pet Care',
        image: 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?auto=format&fit=crop&w=800&q=80',
        subcategories: ['Dog Food', 'Cat Food', 'Pet Accessories', 'Pet Grooming', 'Pet Toys']
    },
    {
        name: 'Stationery & Office',
        image: 'https://images.unsplash.com/photo-1503945438517-f65904a52ce6?auto=format&fit=crop&w=800&q=80',
        subcategories: ['Pens & Pencils', 'Notebooks', 'Art Supplies', 'Office Essentials', 'Files & Folders']
    },
    {
        name: 'Electronics & Electricals',
        image: 'https://images.unsplash.com/photo-1550009158-9ebf69173e03?auto=format&fit=crop&w=800&q=80',
        subcategories: ['Batteries', 'Bulbs & Lights', 'Mobile Accessories', 'Cables & Chargers', 'Extension Cords']
    },
    {
        name: 'Kitchenware & Dining',
        image: 'https://images.unsplash.com/photo-1556910103-1c02745a30bf?auto=format&fit=crop&w=800&q=80',
        subcategories: ['Cookware', 'Storage Containers', 'Disposables', 'Kitchen Tools', 'Water Bottles']
    },
    {
        name: 'Party & Festive Needs',
        image: 'https://images.unsplash.com/photo-1530103862676-de3c9a59af57?auto=format&fit=crop&w=800&q=80',
        subcategories: ['Decorations', 'Balloons', 'Candles', 'Party Caps', 'Gift Wraps']
    }
];

// Product Templates (Category > Subcategory > Products)
const rawProducts = [
    // 1. Atta, Flours & Sooji
    { cat: 'Atta, Flours & Sooji', sub: 'Wheat Atta', items: ['Aashirvaad Atta', 'Fortune Chakki Atta', 'Pillsbury Atta', 'Patanjali Atta', 'Annapurna Atta'] },
    { cat: 'Atta, Flours & Sooji', sub: 'Maida', items: ['Fortune Maida', 'Rajdhani Maida', 'Aashirvaad Maida', 'Patanjali Maida', 'Local Brand Maida'] },
    { cat: 'Atta, Flours & Sooji', sub: 'Besan', items: ['Rajdhani Besan', 'Fortune Besan', 'Patanjali Besan', 'Aashirvaad Besan', 'Gram Flour Loose'] },
    { cat: 'Atta, Flours & Sooji', sub: 'Sooji / Rava', items: ['Roasted Sooji', 'Bombay Rava', 'Fine Sooji', 'Coarse Sooji', 'Upma Rava'] },
    { cat: 'Atta, Flours & Sooji', sub: 'Multigrain Flour', items: ['Aashirvaad Multigrain', 'Patanjali Multigrain', 'Pillsbury Multigrain', 'Diabetic Atta', 'Organic Multigrain'] },

    // 2. Rice & Grains
    { cat: 'Rice & Grains', sub: 'Basmati Rice', items: ['India Gate Classic', 'Daawat Basmati', 'Lal Qilla Basmati', 'Fortune Basmati', 'Kohinoor Basmati'] },
    { cat: 'Rice & Grains', sub: 'Regular Rice', items: ['Kolam Rice', 'Sona Masoori', 'HMT Rice', 'IR64 Rice', 'Steam Rice'] },
    { cat: 'Rice & Grains', sub: 'Brown Rice', items: ['Organic Brown Rice', 'Daawat Brown Rice', 'India Gate Brown', 'Fortune Brown', 'Loose Brown Rice'] },
    { cat: 'Rice & Grains', sub: 'Poha', items: ['Thick Poha', 'Thin Poha', 'Nylon Poha', 'Organic Poha', 'Indori Poha'] },
    { cat: 'Rice & Grains', sub: 'Millets', items: ['Jowar', 'Bajra', 'Ragi', 'Barley', 'Foxtail Millet'] },

    // 3. Dals & Pulses
    { cat: 'Dals & Pulses', sub: 'Toor Dal', items: ['Premium Toor', 'Organic Toor', 'Loose Toor', 'Tata Sampann Toor', 'Fortune Toor'] },
    { cat: 'Dals & Pulses', sub: 'Moong Dal', items: ['Yellow Moong', 'Green Moong', 'Split Moong', 'Organic Moong', 'Loose Moong'] },
    { cat: 'Dals & Pulses', sub: 'Masoor Dal', items: ['Red Masoor', 'Split Masoor', 'Organic Masoor', 'Premium Masoor', 'Loose Masoor'] },
    { cat: 'Dals & Pulses', sub: 'Chana Dal', items: ['Premium Chana', 'Split Chana', 'Organic Chana', 'Loose Chana', 'Tata Sampann Chana'] },
    { cat: 'Dals & Pulses', sub: 'Rajma & Chole', items: ['Red Rajma', 'Jammu Rajma', 'Kabuli Chana', 'Black Chana', 'White Peas'] },

    // 4. Oil & Ghee
    { cat: 'Oil & Ghee', sub: 'Mustard Oil', items: ['Dhara Mustard', 'Fortune Mustard', 'Patanjali Mustard', 'Engine Mustard', 'Organic Mustard'] },
    { cat: 'Oil & Ghee', sub: 'Sunflower Oil', items: ['Fortune Sunlite', 'Saffola Sunflower', 'Dhara Sunflower', 'Gemini Oil', 'Local Brand'] },
    { cat: 'Oil & Ghee', sub: 'Soybean Oil', items: ['Fortune Soya', 'Nutrela Soya', 'Dhara Soya', 'Patanjali Soya', 'Loose Soya Oil'] },
    { cat: 'Oil & Ghee', sub: 'Desi Ghee', items: ['Amul Ghee', 'Mother Dairy Ghee', 'Patanjali Ghee', 'Gowardhan Ghee', 'Local Ghee'] },
    { cat: 'Oil & Ghee', sub: 'Coconut Oil', items: ['Parachute Oil', 'Patanjali Coconut', 'Dabur Coconut', 'Organic Coconut', 'Loose Coconut Oil'] },

    // 5. Masala & Spices
    { cat: 'Masala & Spices', sub: 'Powdered Spices', items: ['Turmeric', 'Chilli Powder', 'Coriander Powder', 'Cumin Powder', 'Garam Masala'] },
    { cat: 'Masala & Spices', sub: 'Whole Spices', items: ['Jeera', 'Rai', 'Cloves', 'Cardamom', 'Black Pepper'] },
    { cat: 'Masala & Spices', sub: 'Blended Masala', items: ['Kitchen King', 'Sabzi Masala', 'Meat Masala', 'Pav Bhaji Masala', 'Chole Masala'] },
    { cat: 'Masala & Spices', sub: 'Dry Herbs', items: ['Oregano', 'Chilli Flakes', 'Basil', 'Thyme', 'Rosemary'] },
    { cat: 'Masala & Spices', sub: 'Ginger-Garlic', items: ['Ginger Paste', 'Garlic Paste', 'Ginger Garlic Mix', 'Organic Paste', 'Loose Paste'] },

    // 6. Salt, Sugar & Jaggery
    { cat: 'Salt, Sugar & Jaggery', sub: 'Salt', items: ['Tata Salt', 'Aashirvaad Salt', 'Rock Salt', 'Black Salt', 'Sendha Namak'] },
    { cat: 'Salt, Sugar & Jaggery', sub: 'Sugar', items: ['White Sugar', 'Brown Sugar', 'Organic Sugar', 'Powdered Sugar', 'Mishri'] },
    { cat: 'Salt, Sugar & Jaggery', sub: 'Jaggery', items: ['Gud Block', 'Powder Gud', 'Organic Gud', 'Liquid Gud', 'Jaggery Cubes'] },
    { cat: 'Salt, Sugar & Jaggery', sub: 'Sweeteners', items: ['Stevia', 'Sugar Free Gold', 'Honey', 'Date Syrup', 'Palm Sugar'] },
    { cat: 'Salt, Sugar & Jaggery', sub: 'Flavored Sugar', items: ['Vanilla Sugar', 'Cinnamon Sugar', 'Demerara', 'Raw Sugar', 'Coconut Sugar'] },

    // 7. Dry Fruits & Nuts
    { cat: 'Dry Fruits & Nuts', sub: 'Almonds', items: ['California Almonds', 'Mamra Badam', 'Roasted Almonds', 'Salted Almonds', 'Organic Almonds'] },
    { cat: 'Dry Fruits & Nuts', sub: 'Cashews', items: ['W180', 'W240', 'Roasted Kaju', 'Salted Kaju', 'Masala Kaju'] },
    { cat: 'Dry Fruits & Nuts', sub: 'Raisins', items: ['Golden Raisins', 'Black Raisins', 'Seedless Raisins', 'Organic Raisins', 'Premium Raisins'] },
    { cat: 'Dry Fruits & Nuts', sub: 'Pistachios', items: ['Salted Pista', 'Roasted Pista', 'Iranian Pista', 'Premium Pista', 'Flavored Pista'] },
    { cat: 'Dry Fruits & Nuts', sub: 'Mixed Nuts', items: ['Dry Fruit Mix', 'Trail Mix', 'Nut Gift Pack', 'Roasted Mix', 'Premium Mix'] },

    // 8. Snacks & Biscuits
    { cat: 'Snacks & Biscuits', sub: 'Chips', items: ['Lay’s', 'Bingo', 'Uncle Chips', 'Pringles', 'Haldiram Chips'] },
    { cat: 'Snacks & Biscuits', sub: 'Namkeen', items: ['Aloo Bhujia', 'Mixture', 'Sev', 'Moong Dal', 'Chivda'] },
    { cat: 'Snacks & Biscuits', sub: 'Cream Biscuits', items: ['Oreo', 'Bourbon', 'Jim Jam', 'Little Hearts', 'Treat Croissant'] },
    { cat: 'Snacks & Biscuits', sub: 'Glucose Biscuits', items: ['Parle-G', 'Tiger', 'Marie', 'Milk Bikis', 'Good Day'] },
    { cat: 'Snacks & Biscuits', sub: 'Khakhra & Snacks', items: ['Plain Khakhra', 'Masala Khakhra', 'Nachos', 'Popcorn', 'Corn Rings'] },

    // 9. Beverages
    { cat: 'Beverages', sub: 'Tea', items: ['Tata Tea', 'Red Label', 'Society Tea', 'Wagh Bakri', 'Organic Tea'] },
    { cat: 'Beverages', sub: 'Coffee', items: ['Nescafe', 'Bru', 'Continental', 'Instant Coffee', 'Filter Coffee'] },
    { cat: 'Beverages', sub: 'Soft Drinks', items: ['Coca-Cola', 'Pepsi', 'Sprite', 'Thums Up', 'Fanta'] },
    { cat: 'Beverages', sub: 'Juices', items: ['Real', 'Tropicana', 'Frooti', 'Maaza', 'Paper Boat'] },
    { cat: 'Beverages', sub: 'Health Drinks', items: ['Bournvita', 'Horlicks', 'Complan', 'Boost', 'Pediasure'] },

    // 10. Dairy & Bakery
    { cat: 'Dairy & Bakery', sub: 'Milk', items: ['Amul', 'Mother Dairy', 'Sanchi', 'Namaste India', 'Local Milk'] },
    { cat: 'Dairy & Bakery', sub: 'Curd & Paneer', items: ['Amul Curd', 'Mother Dairy Curd', 'Paneer Blocks', 'Loose Paneer', 'Greek Yogurt'] },
    { cat: 'Dairy & Bakery', sub: 'Butter & Cheese', items: ['Amul Butter', 'Salted Butter', 'Cheese Slices', 'Cheese Cubes', 'Mozzarella'] },
    { cat: 'Dairy & Bakery', sub: 'Bread', items: ['White Bread', 'Brown Bread', 'Multigrain Bread', 'Sandwich Bread', 'Buns'] },
    { cat: 'Dairy & Bakery', sub: 'Cakes', items: ['Cup Cakes', 'Pastry', 'Cream Cakes', 'Tea Cakes', 'Birthday Cakes'] },

    // 11. Instant & Ready-to-Eat
    { cat: 'Instant & Ready-to-Eat', sub: 'Instant Noodles', items: ['Maggi', 'Yippee', 'Top Ramen', 'Cup Noodles', 'Oats Noodles'] },
    { cat: 'Instant & Ready-to-Eat', sub: 'Pasta', items: ['Penne', 'Fusilli', 'Macaroni', 'Cheese Pasta', 'Instant Pasta Kits'] },
    { cat: 'Instant & Ready-to-Eat', sub: 'Breakfast Mix', items: ['Instant Poha', 'Upma Mix', 'Oats', 'Dalia', 'Idli Mix'] },
    { cat: 'Instant & Ready-to-Eat', sub: 'Soups', items: ['Tomato Soup', 'Corn Soup', 'Knorr Soup', 'Cup Soup', 'Hot & Sour'] },
    { cat: 'Instant & Ready-to-Eat', sub: 'Ready Meals', items: ['MTR Meals', 'Rajma Chawal', 'Dal Makhani', 'Biryani', 'Pulao'] },

    // 12. Frozen Foods
    { cat: 'Frozen Foods', sub: 'Frozen Veg', items: ['Peas', 'Corn', 'Mix Veg', 'Broccoli', 'Spinach'] },
    { cat: 'Frozen Foods', sub: 'Frozen Snacks', items: ['Nuggets', 'Fries', 'Aloo Tikki', 'Cheese Balls', 'Smileys'] },
    { cat: 'Frozen Foods', sub: 'Ice Cream', items: ['Vanilla', 'Chocolate', 'Butterscotch', 'Kulfi', 'Cassata'] },
    { cat: 'Frozen Foods', sub: 'Frozen Non-Veg', items: ['Chicken Wings', 'Sausages', 'Salami', 'Kebabs', 'Fish Fillet'] },
    { cat: 'Frozen Foods', sub: 'Frozen Paratha', items: ['Aloo Paratha', 'Plain Paratha', 'Laccha', 'Paneer Paratha', 'Methi Paratha'] },

    // 13. Personal Care
    { cat: 'Personal Care', sub: 'Soaps', items: ['Lux', 'Lifebuoy', 'Dove', 'Pears', 'Santoor'] },
    { cat: 'Personal Care', sub: 'Shampoos', items: ['Clinic Plus', 'Sunsilk', 'Dove', 'Pantene', 'Head & Shoulders'] },
    { cat: 'Personal Care', sub: 'Oral Care', items: ['Colgate', 'Closeup', 'Oral-B', 'Sensodyne', 'Pepsodent'] },
    { cat: 'Personal Care', sub: 'Hair Oil', items: ['Parachute', 'Dabur Amla', 'Bajaj Almond', 'Navratna', 'Indulekha'] },
    { cat: 'Personal Care', sub: 'Deodorants', items: ['Fogg', 'Axe', 'Nivea', 'Park Avenue', 'Wild Stone'] },

    // 14. Cleaning & Household
    { cat: 'Cleaning & Household', sub: 'Detergents', items: ['Surf Excel', 'Ariel', 'Rin', 'Tide', 'Ghadi'] },
    { cat: 'Cleaning & Household', sub: 'Dishwash', items: ['Vim Bar', 'Vim Liquid', 'Pril', 'Exo', 'Scrub Pads'] },
    { cat: 'Cleaning & Household', sub: 'Floor Cleaner', items: ['Lizol', 'Domex', 'Phenyl', 'Herbal Cleaner', 'Dettol Floor'] },
    { cat: 'Cleaning & Household', sub: 'Toilet Cleaner', items: ['Harpic', 'Domex Toilet', 'Lizol Toilet', 'Dabur Cleaner', 'Acid Cleaner'] },
    { cat: 'Cleaning & Household', sub: 'Cleaning Tools', items: ['Brooms', 'Mops', 'Wipers', 'Gloves', 'Dustbins'] },

    // 15. Baby Care
    { cat: 'Baby Care', sub: 'Diapers', items: ['Pampers', 'Huggies', 'MamyPoko', 'Diaper Pants', 'Newborn Diapers'] },
    { cat: 'Baby Care', sub: 'Baby Food', items: ['Cerelac', 'Nestum', 'Baby Cereal', 'Formula Milk', 'Baby Snacks'] },
    { cat: 'Baby Care', sub: 'Baby Bath', items: ['Baby Soap', 'Shampoo', 'Body Wash', 'Baby Oil', 'Baby Powder'] },
    { cat: 'Baby Care', sub: 'Baby Skin Care', items: ['Lotion', 'Cream', 'Rash Cream', 'Wipes', 'Sunscreen'] },
    { cat: 'Baby Care', sub: 'Feeding', items: ['Feeding Bottles', 'Sippers', 'Bowls', 'Bottle Cleaners', 'Nipples'] },

    // 16. Pet Care
    { cat: 'Pet Care', sub: 'Dog Food', items: ['Pedigree Chicken', 'Royal Canin', 'Drools Dog Food', 'Gravy Pouch', 'Dog Biscuits'] },
    { cat: 'Pet Care', sub: 'Cat Food', items: ['Whiskas Tuna', 'Me-O Cat Food', 'Sheba Premium', 'Dry Cat Food', 'Cat Treats'] },
    { cat: 'Pet Care', sub: 'Pet Accessories', items: ['Dog Collar', 'Cat Litter Tray', 'Pet Bed', 'Leash', 'Food Bowl'] },
    { cat: 'Pet Care', sub: 'Pet Grooming', items: ['Dog Shampoo', 'Pet Brush', 'Tick Powder', 'Nail Clipper', 'Pet Wipes'] },
    { cat: 'Pet Care', sub: 'Pet Toys', items: ['Chew Bone', 'Squeaky Toy', 'Cat Laser', 'Rope Toy', 'Rubber Ball'] },

    // 17. Stationery & Office
    { cat: 'Stationery & Office', sub: 'Pens & Pencils', items: ['Parker Pen', 'Cello Gripper', 'Apsara Pencils', 'Whiteboard Marker', 'Highlighter Set'] },
    { cat: 'Stationery & Office', sub: 'Notebooks', items: ['Classmate Register', 'Spiral Diary', 'Rough Pad', 'A4 Paper Bundle', 'Pocket Diary'] },
    { cat: 'Stationery & Office', sub: 'Art Supplies', items: ['Camel Watercolors', 'Crayons Set', 'Sketch Pens', 'Drawing Book', 'Canvas Board'] },
    { cat: 'Stationery & Office', sub: 'Office Essentials', items: ['Stapler', 'Paper Clips', 'Punching Machine', 'Sticky Notes', 'Scissors'] },
    { cat: 'Stationery & Office', sub: 'Files & Folders', items: ['Clear File', 'Ring Binder', 'Plastic Folder', 'Card Holder', 'Document Organizer'] },

    // 18. Electronics & Electricals
    { cat: 'Electronics & Electricals', sub: 'Batteries', items: ['Duracell AA', 'Eveready AAA', '9V Battery', 'Rechargeable Cells', 'Coin Battery'] },
    { cat: 'Electronics & Electricals', sub: 'Bulbs & Lights', items: ['LED Bulb 9W', 'Tube Light', 'Decorative Fairy Lights', 'Night Lamp', 'Smart Bulb'] },
    { cat: 'Electronics & Electricals', sub: 'Mobile Accessories', items: ['USB Cable', 'Mobile Stand', 'Earphones', 'Charger Adapter', 'Screen Guard'] },
    { cat: 'Electronics & Electricals', sub: 'Cables & Chargers', items: ['HDMI Cable', 'AUX Cable', 'Power Strip', 'Extension Board', 'Fast Charger'] },
    { cat: 'Electronics & Electricals', sub: 'Extension Cords', items: ['3 Socket Extension', 'Heavy Duty Cord', 'Spike Guard', 'Multi-Plug', 'Travel Adapter'] },

    // 19. Kitchenware & Dining
    { cat: 'Kitchenware & Dining', sub: 'Cookware', items: ['Non-Stick Tawa', 'Pressure Cooker 3L', 'Frying Pan', 'Kadhai', 'Sauce Pan'] },
    { cat: 'Kitchenware & Dining', sub: 'Storage Containers', items: ['Plastic Container Set', 'Glass Jar', 'Steel Dabba', 'Lunch Box', 'Masala Box'] },
    { cat: 'Kitchenware & Dining', sub: 'Disposables', items: ['Paper Cups', 'Disposable Plates', 'Tissue Paper', 'Aluminum Foil', 'Garbage Bags'] },
    { cat: 'Kitchenware & Dining', sub: 'Kitchen Tools', items: ['Knife Set', 'Chopping Board', 'Peeler', 'Grater', 'Strainer'] },
    { cat: 'Kitchenware & Dining', sub: 'Water Bottles', items: ['Copper Bottle', 'Steel Water Bottle', 'Plastic Fridge Bottle', 'Thermos', 'Sipper'] },

    // 20. Party & Festive Needs
    { cat: 'Party & Festive Needs', sub: 'Decorations', items: ['Bunting Banner', 'Wall Hanging', 'Paper Streamers', 'Decorative Lights', 'Toran'] },
    { cat: 'Party & Festive Needs', sub: 'Balloons', items: ['Metallic Balloons', 'Happy Birthday Foil', 'Heart Balloons', 'Balloon Pump', 'Helium Balloons'] },
    { cat: 'Party & Festive Needs', sub: 'Candles', items: ['Birthday Candles', 'Scented Candles', 'Tea Lights', 'Sparklers', 'Number Candles'] },
    { cat: 'Party & Festive Needs', sub: 'Party Caps', items: ['Cone Caps', 'Party Masks', 'Eye Mask', 'Crowns', 'Sashes'] },
    { cat: 'Party & Festive Needs', sub: 'Gift Wraps', items: ['Gift Paper', 'Ribbons', 'Gift Bags', 'Greeting Cards', 'Gift Box'] }
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

        // 2. Create Categories & Subcategories
        const categoryMap = {}; // name -> _id
        const subcategoryMap = {}; // name -> _id

        let catIndex = 0;
        for (const cat of categoryData) {
            const parentCat = await Category.create({
                name: cat.name,
                image: cat.image,
                description: `All kinds of ${cat.name}`,
                isFeatured: catIndex < 5
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
        console.log('Categories Created!');

        // 3. Create Products
        const products = [];

        for (const group of rawProducts) {
            const catId = categoryMap[group.cat];
            const subId = subcategoryMap[group.sub];

            if (!catId || !subId) {
                console.error(`Missing Category/Subcategory for ${group.cat} -> ${group.sub}`);
                continue;
            }

            for (const itemName of group.items) {
                // Generate random price between 30 and 1000 for variety
                const mrp = Math.floor(Math.random() * (1000 - 30 + 1)) + 30;
                const price = Math.round(mrp * 0.90); // 10% discount

                products.push({
                    user: adminUser,
                    name: itemName,
                    image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=800&q=80', // Generic grocery image
                    description: `Premium quality ${itemName}. Freshly sourced and packed with care.`,
                    brand: 'Generic',
                    category: catId,
                    subcategory: subId,
                    price: price,
                    mrp: mrp,
                    stock: Math.floor(Math.random() * 100) + 10,
                    unit: '1 Pack', // Default unit
                    gst: 5,
                    isActive: true,
                    rating: (Math.random() * 2 + 3).toFixed(1), // 3.0 to 5.0
                    numReviews: Math.floor(Math.random() * 50)
                });
            }
        }

        await Product.insertMany(products);
        console.log(`Imported ${products.length} Products!`);

        // 4. Create Dummy Orders (Last 5 Days)
        const orders = [];
        const today = new Date();
        const dbProducts = await Product.find({});

        for (let i = 0; i < 25; i++) { // Increased orders slightly
            const date = new Date(today);
            date.setDate(date.getDate() - Math.floor(Math.random() * 5));

            const orderItems = [];
            const numItems = Math.floor(Math.random() * 6) + 1;
            let totalPrice = 0;

            for (let j = 0; j < numItems; j++) {
                const randomProduct = dbProducts[Math.floor(Math.random() * dbProducts.length)];
                const qty = Math.floor(Math.random() * 2) + 1;
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
                user: adminUser,
                orderItems,
                shippingAddress: {
                    address: 'Block A, Market Road',
                    city: 'New Delhi',
                    postalCode: '110001',
                    country: 'India',
                },
                paymentMethod: 'UPI',
                paymentResult: {
                    id: `pay_${Math.random()}`,
                    status: 'COMPLETED',
                    update_time: Date.now(),
                    email_address: 'admin@store.com',
                },
                itemsPrice: totalPrice,
                taxPrice: 0,
                shippingPrice: 0,
                totalPrice: totalPrice,
                isPaid: true,
                paidAt: date,
                isDelivered: Math.random() > 0.6,
                deliveredAt: Math.random() > 0.6 ? date : null,
                status: Math.random() > 0.6 ? 'Delivered' : 'Processing',
                createdAt: date,
                invoiceNumber: `INV-${Date.now()}-${i}`
            });
        }

        await Order.insertMany(orders);
        console.log('Dummy Orders Imported!');

        console.log('Full Catalog (20 Categories) Import Complete!');
        process.exit();
    } catch (error) {
        console.error('Error with data import:', error);
        process.exit(1);
    }
};

importData();
