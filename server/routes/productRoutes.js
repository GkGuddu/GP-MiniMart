const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const { protect, admin } = require('../middleware/authMiddleware');

// @desc    Fetch products with pagination, filtering & lean projection
// @route   GET /api/products
// @access  Public
router.get('/', async (req, res) => {
    try {
        const page = Math.max(1, parseInt(req.query.pageNumber || req.query.page || 1));
        const limit = Math.max(1, Math.min(100, parseInt(req.query.limit || 20)));
        const skip = (page - 1) * limit;

        const { category, search, sortBy, priceRange, all } = req.query;

        // If 'all=true' is requested (for legacy admin queries or complete listings)
        if (all === 'true') {
            const products = await Product.find({})
                .select('name price mrp image category subcategory stock unit rating numReviews isFeatured isActive brand createdAt description')
                .lean();
            return res.json(products);
        }

        const query = { isActive: { $ne: false } };

        // Category Filter
        if (category && category !== 'All' && category !== 'all') {
            if (category.match(/^[0-9a-fA-F]{24}$/)) {
                query.category = category;
            } else {
                query.category = category;
            }
        }

        // Search Filter
        if (search && search.trim()) {
            const regex = new RegExp(search.trim(), 'i');
            query.$or = [
                { name: regex },
                { description: regex },
                { brand: regex }
            ];
        }

        // Price Range Filter
        if (priceRange && priceRange !== 'all') {
            if (priceRange === '200+') {
                query.price = { $gte: 200 };
            } else {
                const [min, max] = priceRange.split('-').map(Number);
                if (!isNaN(min) && !isNaN(max)) {
                    query.price = { $gte: min, $lte: max };
                }
            }
        }

        // Sort Options
        let sort = { createdAt: -1 };
        if (sortBy === 'low-high') {
            sort = { price: 1 };
        } else if (sortBy === 'high-low') {
            sort = { price: -1 };
        }

        const [products, total] = await Promise.all([
            Product.find(query)
                .select('name price mrp image category subcategory stock unit rating numReviews isFeatured isActive brand createdAt description')
                .sort(sort)
                .skip(skip)
                .limit(limit)
                .lean(),
            Product.countDocuments(query)
        ]);

        const pages = Math.ceil(total / limit) || 1;

        // Return array for backwards compatibility if no pagination params were provided
        if (!req.query.page && !req.query.pageNumber && !req.query.limit && !req.query.category && !req.query.search && !req.query.priceRange && !req.query.sortBy) {
            return res.json(products);
        }

        res.json({
            products,
            page,
            pages,
            total,
            hasMore: page < pages
        });
    } catch (error) {
        console.error('Error fetching products:', error);
        res.status(500).json({ message: 'Server error fetching products' });
    }
});

// @desc    Fetch single product
// @route   GET /api/products/:id
// @access  Public
router.get('/:id', async (req, res) => {
    try {
        const product = await Product.findById(req.params.id).lean();
        if (product) {
            res.json(product);
        } else {
            res.status(404).json({ message: 'Product not found' });
        }
    } catch (error) {
        res.status(404).json({ message: 'Product not found' });
    }
});

// @desc    Create new review
// @route   POST /api/products/:id/reviews
// @access  Private
router.post('/:id/reviews', protect, async (req, res) => {
    const { rating, comment } = req.body;
    const product = await Product.findById(req.params.id);

    if (product) {
        const alreadyReviewed = product.reviews.find(
            (r) => r.user.toString() === req.user._id.toString()
        );

        if (alreadyReviewed) {
            res.status(400);
            throw new Error('Product already reviewed');
        }

        const review = {
            name: req.user.name,
            rating: Number(rating),
            comment,
            user: req.user._id,
        };

        product.reviews.push(review);
        product.numReviews = product.reviews.length;
        product.rating =
            product.reviews.reduce((acc, item) => item.rating + acc, 0) /
            product.reviews.length;

        await product.save();
        res.status(201).json({ message: 'Review added' });
    } else {
        res.status(404);
        throw new Error('Product not found');
    }
});

// @desc    Create a product
// @route   POST /api/products
// @access  Private/Admin
router.post('/', protect, admin, async (req, res) => {
    try {
        const { name, price, description, image, brand, category, subcategory, stock, unit, mrp, expiryDate, gst, isActive } = req.body;

        const product = new Product({
            name,
            price,
            user: req.user._id,
            image,
            brand,
            category,
            subcategory: subcategory ? subcategory : undefined,
            stock,
            description,
            unit,
            mrp,
            expiryDate: expiryDate ? expiryDate : undefined,
            gst,
            isActive
        });

        const createdProduct = await product.save();
        res.status(201).json(createdProduct);
    } catch (error) {
        res.status(400).json({ message: 'Invalid product data', error: error.message });
    }
});

// @desc    Update product stock (Quick Edit)
// @route   PATCH /api/products/:id/stock
// @access  Private/Admin
router.patch('/:id/stock', protect, admin, async (req, res) => {
    const { stock } = req.body;
    const product = await Product.findById(req.params.id);

    if (product) {
        product.stock = stock;
        const updatedProduct = await product.save();
        res.json(updatedProduct);
    } else {
        res.status(404).json({ message: 'Product not found' });
    }
});

// @desc    Update a product
// @route   PUT /api/products/:id
// @access  Private/Admin
router.put('/:id', protect, admin, async (req, res) => {
    const { name, price, description, image, brand, category, stock, unit } = req.body;

    const product = await Product.findById(req.params.id);

    if (product) {
        product.name = name;
        product.name = name;
        product.price = price;
        product.description = description;
        product.image = image;
        product.brand = brand;
        product.category = category;
        product.subcategory = req.body.subcategory ? req.body.subcategory : undefined;
        product.stock = stock;
        product.unit = unit;
        product.mrp = req.body.mrp;
        product.expiryDate = req.body.expiryDate ? req.body.expiryDate : undefined;
        product.gst = req.body.gst;
        product.isActive = req.body.isActive;

        const updatedProduct = await product.save();
        res.json(updatedProduct);
    } else {
        res.status(404).json({ message: 'Product not found' });
    }
});

// @desc    Delete a product
// @route   DELETE /api/products/:id
// @access  Private/Admin
router.delete('/:id', protect, admin, async (req, res) => {
    const product = await Product.findById(req.params.id);

    if (product) {
        await product.deleteOne();
        res.json({ message: 'Product removed' });
    } else {
        res.status(404).json({ message: 'Product not found' });
    }
});

module.exports = router;
