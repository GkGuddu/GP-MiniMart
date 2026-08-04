const express = require('express');
const router = express.Router();
const Category = require('../models/Category');
const { protect, admin } = require('../middleware/authMiddleware');

// @desc    Get all categories (hierarchical or flat)
// @route   GET /api/categories
// @access  Public
router.get('/', async (req, res) => {
    try {
        // Fetch all categories using fast lean objects
        const allCategories = await Category.find({}).lean();
        const parentCategories = allCategories.filter(c => !c.parent);

        const hierarchicalData = parentCategories.map(parent => {
            const children = allCategories.filter(c => c.parent && c.parent.toString() === parent._id.toString());
            return {
                ...parent,
                subcategories: children
            };
        });

        res.json(hierarchicalData);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
});

// @desc    Create a category
// @route   POST /api/categories
// @access  Private/Admin
router.post('/', protect, admin, async (req, res) => {
    const { name, image, description, parent, isFeatured, isActive } = req.body;
    try {
        const category = new Category({
            name,
            image,
            description,
            parent: parent || null,
            isFeatured: isFeatured || false,
            isActive: isActive !== undefined ? isActive : true,
        });
        const createdCategory = await category.save();
        res.status(201).json(createdCategory);
    } catch (error) {
        res.status(400).json({ message: 'Invalid category data' });
    }
});

// @desc    Update a category
// @route   PUT /api/categories/:id
// @access  Private/Admin
router.put('/:id', protect, admin, async (req, res) => {
    try {
        const { name, image, description, parent, isFeatured, isActive } = req.body;
        const category = await Category.findById(req.params.id);

        if (category) {
            category.name = name || category.name;
            category.image = image || category.image;
            category.description = description || category.description;
            if (isFeatured !== undefined) category.isFeatured = isFeatured;
            if (isActive !== undefined) category.isActive = isActive;

            // Handle parent update (can be set to null if intended)
            if (parent !== undefined) {
                category.parent = parent || null;
            }

            const updatedCategory = await category.save();
            res.json(updatedCategory);
        } else {
            res.status(404).json({ message: 'Category not found' });
        }
    } catch (error) {
        res.status(400).json({ message: 'Invalid category data' });
    }
});

// @desc    Delete a category
// @route   DELETE /api/categories/:id
// @access  Private/Admin
router.delete('/:id', protect, admin, async (req, res) => {
    try {
        const category = await Category.findById(req.params.id);
        if (category) {
            // Cascade delete: Delete all subcategories first
            await Category.deleteMany({ parent: category._id });

            await category.deleteOne();
            res.json({ message: 'Category and its subcategories removed' });
        } else {
            res.status(404).json({ message: 'Category not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
