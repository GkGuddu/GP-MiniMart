const express = require('express');
const router = express.Router();
const Settings = require('../models/Settings');
const { protect, admin } = require('../middleware/authMiddleware');

// @desc    Get global settings
// @route   GET /api/settings
// @access  Public
router.get('/', async (req, res) => {
    try {
        let settings = await Settings.findOne();
        if (!settings) {
            settings = await Settings.create({});
        }
        res.json(settings);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
});

// @desc    Update global settings
// @route   PUT /api/settings
// @access  Private/Admin
router.put('/', protect, admin, async (req, res) => {
    try {
        const {
            storeName,
            email,
            contactNumber,
            address,
            currency,
            taxRate,
            shippingCharge,
            freeShippingThreshold,
            siteDescription,
            aboutUsSnippet
        } = req.body;

        let settings = await Settings.findOne();

        if (settings) {
            settings.storeName = storeName || settings.storeName;
            settings.email = email || settings.email;
            settings.contactNumber = contactNumber || settings.contactNumber;
            settings.address = address || settings.address;
            settings.currency = currency || settings.currency;
            settings.taxRate = taxRate !== undefined ? taxRate : settings.taxRate;
            settings.shippingCharge = shippingCharge !== undefined ? shippingCharge : settings.shippingCharge;
            settings.freeShippingThreshold = freeShippingThreshold !== undefined ? freeShippingThreshold : settings.freeShippingThreshold;
            settings.siteDescription = siteDescription || settings.siteDescription;
            settings.aboutUsSnippet = aboutUsSnippet || settings.aboutUsSnippet;

            const updatedSettings = await settings.save();
            res.json(updatedSettings);
        } else {
            // Should not happen if GET auto-creates, but good fallback
            const newSettings = await Settings.create(req.body);
            res.json(newSettings);
        }
    } catch (error) {
        res.status(400).json({ message: 'Invalid settings data' });
    }
});

module.exports = router;
