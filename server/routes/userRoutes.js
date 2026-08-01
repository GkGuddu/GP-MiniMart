const express = require('express');
const router = express.Router();
const User = require('../models/User');
const generateToken = require('../utils/generateToken');
const { protect, admin } = require('../middleware/authMiddleware');
const crypto = require('crypto');
const sendEmail = require('../utils/sendEmail');

// @desc    Auth user & get token
// @route   POST /api/users/login
// @access  Public
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
        if (user.isBlocked) {
            return res.status(401).json({ message: 'Your account has been blocked' });
        }
        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            token: generateToken(user._id),
        });
    } else {
        res.status(401).json({ message: 'Invalid email or password' });
    }
});

// @desc    Register a new user
// @route   POST /api/users
// @access  Public
router.post('/', async (req, res) => {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
        return res.status(400).json({ message: 'Please fill in all fields' });
    }

    if (password.length < 6) {
        return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return res.status(400).json({ message: 'Invalid email format' });
    }

    const userExists = await User.findOne({ email });

    if (userExists) {
        return res.status(400).json({ message: 'User already exists' });
    }

    const user = await User.create({
        name,
        email,
        password,
    });

    if (user) {
        res.status(201).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            token: generateToken(user._id),
        });
    } else {
        res.status(400).json({ message: 'Invalid user data' });
    }
});

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
router.get('/profile', protect, async (req, res) => {
    const user = await User.findById(req.user._id);

    if (user) {
        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
        });
    } else {
        res.status(404).json({ message: 'User not found' });
    }
});

// @desc    Update user password
// @route   PUT /api/users/profile/password
// @access  Private
router.put('/profile/password', protect, async (req, res) => {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
        return res.status(400).json({ message: 'Please enter all fields' });
    }

    if (newPassword.length < 6) {
        return res.status(400).json({ message: 'New password must be at least 6 characters' });
    }

    const user = await User.findById(req.user._id);

    if (user && (await user.matchPassword(currentPassword))) {
        user.password = newPassword;
        await user.save();
        res.json({ message: 'Password updated successfully' });
    } else {
        res.status(401).json({ message: 'Invalid current password' });
    }
});

// @desc    Get all users
// @route   GET /api/users
// @access  Private/Admin
router.get('/', protect, admin, async (req, res) => {
    const users = await User.find({});
    res.json(users);
});

// @desc    Block/Unblock user
// @route   PUT /api/users/:id/block
// @access  Private/Admin
router.put('/:id/block', protect, admin, async (req, res) => {
    const user = await User.findById(req.params.id);

    if (user) {
        user.isBlocked = !user.isBlocked;
        const updatedUser = await user.save();
        res.json(updatedUser);
    } else {
        res.status(404).json({ message: 'User not found' });
    }
});

// @desc    Update user role
// @route   PUT /api/users/:id/role
// @access  Private/Admin
router.put('/:id/role', protect, admin, async (req, res) => {
    const user = await User.findById(req.params.id);

    if (user) {
        user.role = req.body.role; // 'admin' or 'client'
        const updatedUser = await user.save();
        res.json(updatedUser);
    } else {
        res.status(404).json({ message: 'User not found' });
    }
});

// @desc    Direct Forgot Password - Reset password using email directly without OTP
// @route   POST /api/users/forgotpassword
// @access  Public
router.post('/forgotpassword', async (req, res) => {
    console.log('Direct Forgot Password Request:', req.body.email);
    const { email, password } = req.body;

    if (!email) {
        return res.status(400).json({ message: 'Please provide your registered email' });
    }

    const user = await User.findOne({ email });

    if (!user) {
        return res.status(404).json({ message: 'User not found with this email' });
    }

    // If new password is provided, reset password directly
    if (password) {
        if (password.length < 6) {
            return res.status(400).json({ message: 'Password must be at least 6 characters' });
        }
        
        user.password = password;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;
        user.resetPasswordOtp = undefined;
        user.resetPasswordOtpExpire = undefined;

        await user.save();

        // Send confirmation notification email
        sendEmail({
            to: user.email,
            subject: 'GP MiniMart - Password Updated Successfully',
            text: `Hello ${user.name}, your account password has been updated successfully.`,
            html: `<div style="font-family: Arial; padding: 24px; max-width: 500px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 12px;"><h2 style="color: #059669; text-align: center;">✅ Password Updated</h2><p>Hello <strong>${user.name}</strong>,</p><p>Your GP MiniMart account password has been reset successfully.</p></div>`,
        }).catch(err => console.log('Notification email error:', err.message));

        return res.status(200).json({
            success: true,
            message: 'Password reset successfully!',
            token: generateToken(user._id),
        });
    }

    // Default confirmation response
    res.status(200).json({
        success: true,
        message: 'Account verified. Enter your new password below.',
    });
});

// @desc    Reset Password with 4-Digit OTP
// @route   POST /api/users/resetpassword-otp
// @access  Public
router.post('/resetpassword-otp', async (req, res) => {
    const { email, otp, password } = req.body;

    if (!email || !otp || !password) {
        return res.status(400).json({ message: 'Please provide email, 4-digit OTP, and new password' });
    }

    // Hash incoming OTP
    const resetPasswordOtp = crypto
        .createHash('sha256')
        .update(otp.toString().trim())
        .digest('hex');

    const user = await User.findOne({
        email,
        resetPasswordOtp,
        resetPasswordOtpExpire: { $gt: Date.now() },
    });

    if (!user) {
        return res.status(400).json({ message: 'Invalid or expired 4-digit OTP' });
    }

    // Set new password
    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    user.resetPasswordOtp = undefined;
    user.resetPasswordOtpExpire = undefined;

    await user.save();

    // Send Password Changed Email Notification
    const confirmationHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 12px; padding: 24px; background: #ffffff;">
            <h2 style="color: #059669; text-align: center;">✅ Password Reset Successful</h2>
            <p style="color: #374151;">Hello <strong>${user.name}</strong>,</p>
            <p style="color: #4b5563;">Your GP MiniMart account password has been updated successfully.</p>
            <p style="color: #6b7280; font-size: 13px;">If you did not perform this change, please contact support immediately.</p>
        </div>
    `;

    await sendEmail({
        to: user.email,
        subject: 'GP MiniMart - Password Changed Successfully',
        text: `Hello ${user.name}, your password for GP MiniMart has been changed successfully.`,
        html: confirmationHtml,
    });

    res.status(200).json({
        success: true,
        message: 'Password reset successfully',
        token: generateToken(user._id),
    });
});

// @desc    Reset Password via Token
// @route   PUT /api/users/resetpassword/:resetToken
// @access  Public
router.put('/resetpassword/:resetToken', async (req, res) => {
    const resetPasswordToken = crypto
        .createHash('sha256')
        .update(req.params.resetToken)
        .digest('hex');

    const user = await User.findOne({
        resetPasswordToken,
        resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
        return res.status(400).json({ message: 'Invalid or expired token' });
    }

    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    user.resetPasswordOtp = undefined;
    user.resetPasswordOtpExpire = undefined;

    await user.save();

    res.status(200).json({
        success: true,
        message: 'Password updated successfully',
        token: generateToken(user._id),
    });
});

module.exports = router;
