const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
    storeName: {
        type: String,
        required: true,
        default: 'SwiftCart'
    },
    email: {
        type: String,
        required: true,
        default: 'admin@example.com'
    },
    contactNumber: {
        type: String,
        required: true,
        default: '+91 98765 43210'
    },
    address: {
        type: String,
        default: 'Local Market, City, India'
    },
    currency: {
        type: String,
        default: '₹'
    },
    taxRate: {
        type: Number,
        default: 5, // Default GST logic can use this
        min: 0
    },
    shippingCharge: {
        type: Number,
        default: 0
    },
    freeShippingThreshold: {
        type: Number,
        default: 500
    },
    siteDescription: {
        type: String,
        default: 'Your daily essentials, delivered in minutes. Quality you can trust, right at your doorstep.'
    },
    aboutUsSnippet: {
        type: String,
        default: 'Bringing the traditional warmth of your local Kirana store to the digital age. We are on a mission to deliver freshness to every doorstep.'
    }
}, { timestamps: true });

const Settings = mongoose.model('Settings', settingsSchema);

module.exports = Settings;
