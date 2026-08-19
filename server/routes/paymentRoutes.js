const express = require('express');
const router = express.Router();
const Razorpay = require('razorpay');
const crypto = require('crypto');
const Order = require('../models/Order');
const { protect } = require('../middleware/authMiddleware');

const getRazorpayInstance = () => {
    return new Razorpay({
        key_id: process.env.RAZORPAY_KEY_ID,
        key_secret: process.env.RAZORPAY_KEY_SECRET,
    });
};

router.post('/razorpay/create-order', protect, async (req, res) => {
    try {
        const { amount, orderId } = req.body;

        if (!amount || amount <= 0) {
            return res.status(400).json({ message: 'Invalid order amount' });
        }

        const razorpay = getRazorpayInstance();
        const options = {
            amount: Math.round(amount * 100),
            currency: 'INR',
            receipt: `receipt_${orderId || Date.now()}`,
        };

        const razorpayOrder = await razorpay.orders.create(options);

        if (orderId) {
            await Order.findByIdAndUpdate(orderId, {
                razorpayOrderId: razorpayOrder.id,
            });
        }

        res.json({
            id: razorpayOrder.id,
            currency: razorpayOrder.currency,
            amount: razorpayOrder.amount,
            key: process.env.RAZORPAY_KEY_ID,
        });
    } catch (error) {
        res.status(500).json({ message: 'Razorpay order creation failed', error: error.message });
    }
});

router.post('/razorpay/verify', protect, async (req, res) => {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderId } = req.body;

        if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !orderId) {
            return res.status(400).json({ message: 'Missing required payment verification parameters' });
        }

        const body = razorpay_order_id + '|' + razorpay_payment_id;
        const expectedSignature = crypto
            .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
            .update(body.toString())
            .digest('hex');

        if (expectedSignature === razorpay_signature) {
            const order = await Order.findById(orderId);
            if (!order) {
                return res.status(404).json({ message: 'Order not found' });
            }

            if (order.isPaid) {
                return res.json({ success: true, message: 'Order is already marked as paid', order });
            }

            order.isPaid = true;
            order.paidAt = Date.now();
            order.razorpayOrderId = razorpay_order_id;
            order.razorpayPaymentId = razorpay_payment_id;
            order.paymentResult = {
                id: razorpay_payment_id,
                status: 'completed',
                update_time: Date.now().toString(),
                email_address: req.user.email,
            };

            const updatedOrder = await order.save();
            return res.json({ success: true, message: 'Payment verified successfully', order: updatedOrder });
        } else {
            return res.status(400).json({ message: 'Invalid payment signature. Verification failed.' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Payment verification failed', error: error.message });
    }
});

module.exports = router;
