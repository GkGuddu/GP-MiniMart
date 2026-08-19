const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    price: {
        type: Number,
        required: true,
        default: 0,
        min: 0,
    },
    mrp: {
        type: Number,
        required: true,
        default: 0,
        min: 0,
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        required: true,
        index: true,
    },
    subcategory: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
    },
    image: {
        type: String,
        required: true,
    },
    brand: {
        type: String,
    },
    stock: {
        type: Number,
        required: true,
        default: 0,
        min: 0,
    },
    unit: {
        type: String, // e.g., '1kg', '500g', '1L', 'Packet'
        required: true,
    },
    gst: {
        type: Number,
        default: 0,
    },
    expiryDate: {
        type: Date,
    },
    isActive: {
        type: Boolean,
        default: true,
    },
    reviews: [
        {
            name: { type: String, required: true },
            rating: { type: Number, required: true },
            comment: { type: String, required: true },
            user: {
                type: mongoose.Schema.Types.ObjectId,
                required: true,
                ref: 'User',
            },
        },
    ],
    rating: {
        type: Number,
        required: true,
        default: 0,
    },
    numReviews: {
        type: Number,
        required: true,
        default: 0,
    },
}, { timestamps: true });

// Add indexes for high performance querying
productSchema.index({ category: 1, createdAt: -1 });
productSchema.index({ isActive: 1, category: 1 });
productSchema.index({ price: 1 });
productSchema.index({ name: 'text', description: 'text', brand: 'text' });

const Product = mongoose.model('Product', productSchema);

module.exports = Product;
