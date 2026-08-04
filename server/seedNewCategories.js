const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Category = require('./models/Category');

dotenv.config();

const newCategoriesData = [
    {
        name: 'Vegetables',
        image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=600&auto=format&fit=crop&q=80',
        description: 'Fresh & organic farm vegetables',
        isFeatured: true,
        subcategories: [
            { name: 'Leafy Vegetables', image: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=600&auto=format&fit=crop&q=80', description: 'Spinach, Lettuce, Coriander & Mint' },
            { name: 'Root Vegetables', image: 'https://images.unsplash.com/photo-1590779033100-9f60a05a013d?w=600&auto=format&fit=crop&q=80', description: 'Potatoes, Onions, Carrots & Radish' },
            { name: 'Fruiting Vegetables', image: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=600&auto=format&fit=crop&q=80', description: 'Tomatoes, Capsicum & Chillies' },
            { name: 'Gourds', image: 'https://images.unsplash.com/photo-1598170845058-128a2b6e5108?w=600&auto=format&fit=crop&q=80', description: 'Bottle Gourd, Bitter Gourd & Ridge Gourd' },
            { name: 'Beans & Peas', image: 'https://images.unsplash.com/photo-1567306301408-9b74779a11af?w=600&auto=format&fit=crop&q=80', description: 'Green Peas, French Beans & Cluster Beans' },
            { name: 'Herbs & Seasonings', image: 'https://images.unsplash.com/photo-1608686207856-001b95cf60ca?w=600&auto=format&fit=crop&q=80', description: 'Ginger, Garlic, Curry Leaves & Lemongrass' }
        ]
    },
    {
        name: 'Fruits',
        image: 'https://images.unsplash.com/photo-1619566636858-adf3ef46400b?w=600&auto=format&fit=crop&q=80',
        description: 'Fresh, juicy and seasonal fruits',
        isFeatured: true,
        subcategories: [
            { name: 'Citrus Fruits', image: 'https://images.unsplash.com/photo-1582979512210-99b6a53386f9?w=600&auto=format&fit=crop&q=80', description: 'Oranges, Sweet Lime & Lemons' },
            { name: 'Tropical Fruits', image: 'https://images.unsplash.com/photo-1550258987-190a2d41a8ba?w=600&auto=format&fit=crop&q=80', description: 'Mangoes, Bananas, Papayas & Pineapples' },
            { name: 'Berries', image: 'https://images.unsplash.com/photo-1464965911861-746a04b4bca6?w=600&auto=format&fit=crop&q=80', description: 'Strawberries, Blueberries & Blackberries' },
            { name: 'Apples & Pears', image: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=600&auto=format&fit=crop&q=80', description: 'Red Delicious Apples, Green Apples & Pears' },
            { name: 'Stone Fruits', image: 'https://images.unsplash.com/photo-1522858547551-789d380c55db?w=600&auto=format&fit=crop&q=80', description: 'Peaches, Plums & Cherries' },
            { name: 'Melons', image: 'https://images.unsplash.com/photo-1587049352847-4a222e784d38?w=600&auto=format&fit=crop&q=80', description: 'Watermelons, Muskmelons & Cantaloupes' }
        ]
    },
    {
        name: 'Electronics Accessories',
        image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=80',
        description: 'Essential gadgets, chargers, cables & tech gear',
        isFeatured: true,
        subcategories: [
            { name: 'Mobile Accessories', image: 'https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?w=600&auto=format&fit=crop&q=80', description: 'Phone Cases, Screen Protectors & Covers' },
            { name: 'Audio Accessories', image: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=600&auto=format&fit=crop&q=80', description: 'Headphones, TWS Earbuds & Bluetooth Speakers' },
            { name: 'Computer Accessories', image: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=600&auto=format&fit=crop&q=80', description: 'Mice, Keyboards, USB Hubs & Mousepads' },
            { name: 'Power Accessories', image: 'https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=600&auto=format&fit=crop&q=80', description: 'Power Banks, Fast Wall Chargers & Surge Protectors' },
            { name: 'Cables & Adapters', image: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop&q=80', description: 'Type-C Cables, HDMI Adapters & Lightning Cables' },
            { name: 'Gaming Accessories', image: 'https://images.unsplash.com/photo-1612287230202-1ff1d85d1bdf?w=600&auto=format&fit=crop&q=80', description: 'Controllers, Gaming Headsets & RGB Pads' }
        ]
    },
    {
        name: 'Stationery',
        image: 'https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?w=600&auto=format&fit=crop&q=80',
        description: 'School, college and office stationery essentials',
        isFeatured: true,
        subcategories: [
            { name: 'Writing Supplies', image: 'https://images.unsplash.com/photo-1585336261026-8f5786372966?w=600&auto=format&fit=crop&q=80', description: 'Gel Pens, Ballpoint Pens, Pencils & Highlighters' },
            { name: 'Notebooks & Paper', image: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop&q=80', description: 'Single Line Notebooks, Diaries & Sticky Notes' },
            { name: 'Office & School Supplies', image: 'https://images.unsplash.com/photo-1584679109597-c656b19974c9?w=600&auto=format&fit=crop&q=80', description: 'Staplers, Scissors, Glue Sticks & Tapes' },
            { name: 'Art & Craft Supplies', image: 'https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?w=600&auto=format&fit=crop&q=80', description: 'Crayons, Watercolors, Sketch Pens & Brushes' },
            { name: 'Filing & Organization', image: 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=600&auto=format&fit=crop&q=80', description: 'Document Folders, Files, Binders & Clips' },
            { name: 'School Essentials', image: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=600&auto=format&fit=crop&q=80', description: 'Geometry Sets, Calculators, Erasers & Sharpeners' }
        ]
    }
];

const seedCategories = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB Atlas...');

        for (const catData of newCategoriesData) {
            // Upsert Top-Level Category
            let parentCat = await Category.findOne({ name: catData.name });
            if (!parentCat) {
                parentCat = await Category.create({
                    name: catData.name,
                    image: catData.image,
                    description: catData.description,
                    isFeatured: catData.isFeatured,
                    parent: null,
                    isActive: true
                });
                console.log(`Created Main Category: ${parentCat.name}`);
            } else {
                parentCat.image = catData.image;
                parentCat.description = catData.description;
                parentCat.isFeatured = catData.isFeatured;
                await parentCat.save();
                console.log(`Updated Main Category: ${parentCat.name}`);
            }

            // Create Subcategories linked to Parent Category ID
            for (const subData of catData.subcategories) {
                let subCat = await Category.findOne({ name: subData.name, parent: parentCat._id });
                if (!subCat) {
                    subCat = await Category.create({
                        name: subData.name,
                        image: subData.image,
                        description: subData.description,
                        parent: parentCat._id,
                        isFeatured: false,
                        isActive: true
                    });
                    console.log(`  └─ Created Subcategory: ${subCat.name}`);
                } else {
                    subCat.image = subData.image;
                    subCat.description = subData.description;
                    await subCat.save();
                    console.log(`  └─ Updated Subcategory: ${subCat.name}`);
                }
            }
        }

        console.log('ALL CATEGORIES AND SUBCATEGORIES SEEDED SUCCESSFULLY!');
        process.exit(0);
    } catch (error) {
        console.error('Error seeding categories:', error);
        process.exit(1);
    }
};

seedCategories();
