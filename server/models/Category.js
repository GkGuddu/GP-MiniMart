const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
    },
    image: {
        type: String,
        required: true,
    },
    description: {
        type: String,
    },
    parent: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        default: null, // If null, it's a parent category
    },
    isActive: {
        type: Boolean,
        default: true,
    },
    isFeatured: {
        type: Boolean,
        default: false,
}, { timestamps: true });

// Add indexes for ultra-fast category tree queries
categorySchema.index({ parent: 1, isActive: 1 });
categorySchema.index({ isFeatured: 1 });

const Category = mongoose.model('Category', categorySchema);

module.exports = Category;
