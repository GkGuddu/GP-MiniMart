const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Product = require('../models/Product');
const { protect, admin } = require('../middleware/authMiddleware');

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
router.post('/', protect, async (req, res) => {
    const {
        orderItems,
        shippingAddress,
        paymentMethod,
        totalPrice,
    } = req.body;

    if (orderItems && orderItems.length === 0) {
        res.status(400).json({ message: 'No order items' });
        return;
    } else {
        // 1. Validate Stock
        for (const item of orderItems) {
            const product = await Product.findById(item.product);
            if (!product) {
                res.status(404).json({ message: `Product not found: ${item.name}` });
                return;
            }
            if (product.stock < item.qty) {
                res.status(400).json({ message: `Insufficient stock for ${item.name}. Available: ${product.stock}` });
                return;
            }
        }

        // 2. Deduct Stock
        for (const item of orderItems) {
            const product = await Product.findById(item.product);
            product.stock -= item.qty;
            await product.save();
        }

        const order = new Order({
            orderItems,
            user: req.user._id,
            shippingAddress,
            paymentMethod,
            totalPrice,
            invoiceNumber: `INV-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        });

        const createdOrder = await order.save();
        const io = req.app.get('io');
        if (io) {
            io.emit('newOrderPlaced', {
                orderId: createdOrder._id,
                invoiceNumber: createdOrder.invoiceNumber,
                totalPrice: createdOrder.totalPrice,
                userName: req.user.name,
            });
        }
        res.status(201).json(createdOrder);
    }
});

// @desc    Cancel order
// @route   PUT /api/orders/:id/cancel
// @access  Private
router.put('/:id/cancel', protect, async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);

        if (order) {
            if (order.status !== 'Pending') {
                res.status(400).json({ message: 'Only pending orders can be cancelled' });
                return;
            }

            // Restore Stock
            for (const item of order.orderItems) {
                const product = await Product.findById(item.product);
                if (product) {
                    product.stock += item.qty;
                    await product.save();
                }
            }

            order.status = 'Cancelled';

            // Handle Refund Logic
            if (order.isPaid) {
                order.refundStatus = 'Pending';
                order.refundAmount = order.totalPrice;
            } else {
                order.refundStatus = 'Not Applicable';
            }

            const updatedOrder = await order.save();
            const io = req.app.get('io');
            if (io) {
                io.to(updatedOrder._id.toString()).emit('orderStatusUpdated', updatedOrder);
            }
            res.json(updatedOrder);
        } else {
            res.status(404).json({ message: 'Order not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
});

// @desc    Delete order
// @route   DELETE /api/orders/:id
// @access  Private/Admin
router.delete('/:id', protect, admin, async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);

        if (order) {
            await order.deleteOne();
            res.json({ message: 'Order removed' });
        } else {
            res.status(404).json({ message: 'Order not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
});

// @desc    Get logged in user orders
// @route   GET /api/orders/myorders
// @access  Private
router.get('/myorders', protect, async (req, res) => {
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(orders);
});

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
router.get('/:id', protect, async (req, res) => {
    const order = await Order.findById(req.params.id).populate('user', 'name email');

    if (order) {
        if (order.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized to view this order' });
        }
        res.json(order);
    } else {
        res.status(404).json({ message: 'Order not found' });
    }
});

router.get('/:id/invoice', protect, async (req, res) => {
    try {
        const order = await Order.findById(req.params.id).populate('user', 'name email');

        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        if (order.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized to access this invoice' });
        }

        if (!order.invoiceNumber) {
            const year = new Date(order.createdAt || Date.now()).getFullYear();
            const code = order._id.toString().slice(-6).toUpperCase();
            order.invoiceNumber = `GPM-INV-${year}-${code}`;
            await order.save();
        }

        res.json(order);
    } catch (error) {
        res.status(500).json({ message: 'Server error retrieving invoice' });
    }
});

// @desc    Update order to paid
// @route   PUT /api/orders/:id/pay
// @access  Private
router.put('/:id/pay', protect, async (req, res) => {
    return res.status(400).json({ message: 'Direct payment marking disabled. Use verified payment gateways.' });
});

// @desc    Update order to delivered
// @route   PUT /api/orders/:id/deliver
// @access  Private/Admin
router.put('/:id/deliver', protect, admin, async (req, res) => {
    const order = await Order.findById(req.params.id);

    if (order) {
        order.isDelivered = true;
        order.deliveredAt = Date.now();
        order.status = 'Delivered';

        const updatedOrder = await order.save();
        res.json(updatedOrder);
    } else {
        res.status(404).json({ message: 'Order not found' });
    }
});

// @desc    Update order status
// @route   PUT /api/orders/:id/status
// @access  Private/Admin
router.put('/:id/status', protect, admin, async (req, res) => {
    const { status } = req.body;
    const order = await Order.findById(req.params.id);

    if (order) {
        const oldStatus = order.status;
        order.status = status;

        if (status === 'Delivered') {
            order.isDelivered = true;
            order.deliveredAt = Date.now();
        }

        if (status === 'Cancelled' && oldStatus !== 'Cancelled') {
            // Restore Stock logic
            for (const item of order.orderItems) {
                const product = await Product.findById(item.product);
                if (product) {
                    product.stock += item.qty;
                    await product.save();
                }
            }
            // Handle Refund Logic if Paid
            if (order.isPaid) {
                order.refundStatus = 'Pending';
                order.refundAmount = order.totalPrice;
            } else {
                order.refundStatus = 'Not Applicable';
            }
        }

        const updatedOrder = await order.save();
        const io = req.app.get('io');
        if (io) {
            io.to(updatedOrder._id.toString()).emit('orderStatusUpdated', updatedOrder);
        }
        res.json(updatedOrder);
    } else {
        res.status(404).json({ message: 'Order not found' });
    }
});

// @desc    Update order payment status
// @route   PUT /api/orders/:id/payment-status
// @access  Private/Admin
router.put('/:id/payment-status', protect, admin, async (req, res) => {
    const { isPaid } = req.body;
    const order = await Order.findById(req.params.id);

    if (order) {
        order.isPaid = isPaid;
        if (isPaid) {
            order.paidAt = Date.now();
        } else {
            order.paidAt = undefined;
        }

        const updatedOrder = await order.save();
        res.json(updatedOrder);
    } else {
        res.status(404).json({ message: 'Order not found' });
    }
});

// @desc    Get all orders
// @route   GET /api/orders
// @access  Private/Admin
router.get('/', protect, admin, async (req, res) => {
    const orders = await Order.find({}).populate('user', 'id name').sort({ createdAt: -1 });
    res.json(orders);
});

module.exports = router;
