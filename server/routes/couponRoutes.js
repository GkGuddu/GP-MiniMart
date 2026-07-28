const express = require('express');
const router = express.Router();
const Coupon = require('../models/Coupon');
const { protect, admin } = require('../middleware/authMiddleware');

// @desc    Verify coupon code
// @route   POST /api/coupons/verify
// @access  Public
router.post('/verify', async (req, res) => {
    const { code } = req.body;

    try {
        const coupon = await Coupon.findOne({ code: code.toUpperCase() });

        if (coupon && coupon.isActive) {
            if (new Date() > new Date(coupon.expiryDate)) {
                res.status(400).json({ message: 'Coupon expired' });
            } else {
                res.json({
                    code: coupon.code,
                    discount: coupon.discount,
                    message: 'Coupon applied successfully'
                });
            }
        } else {
            res.status(404).json({ message: 'Invalid or inactive coupon' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server error check coupon' });
    }
});

module.exports = router;
