const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        match: [
            /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
            'Please add a valid email'
        ]
    },
    password: {
        type: String,
        required: true,
        minlength: 6,
    },
    role: {
        type: String,
        enum: ['client', 'admin'],
        default: 'client',
    },
    isBlocked: {
        type: Boolean,
        default: false,
    },
    resetPasswordToken: String,
    resetPasswordExpire: Date,
    resetPasswordOtp: String,
    resetPasswordOtpExpire: Date,
}, { timestamps: true });

// Match user entered password to hashed password in database
userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

// Encrypt password using bcrypt
userSchema.pre('save', async function () {
    if (!this.isModified('password')) {
        return;
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

// Generate 4-digit OTP for password reset
userSchema.methods.getResetPasswordOtp = function () {
    const otp = Math.floor(1000 + Math.random() * 9000).toString();

    this.resetPasswordOtp = crypto
        .createHash('sha256')
        .update(otp)
        .digest('hex');

    this.resetPasswordOtpExpire = Date.now() + 10 * 60 * 1000; // 10 minutes

    return otp;
};

// Generate and hash password reset token
userSchema.methods.getResetPasswordToken = function () {
    // Generate token
    const resetToken = crypto.randomBytes(20).toString('hex');

    // Hash token and set to resetPasswordToken field
    this.resetPasswordToken = crypto
        .createHash('sha256')
        .update(resetToken)
        .digest('hex');

    // Set expire
    this.resetPasswordExpire = Date.now() + 10 * 60 * 1000;

    return resetToken;
};

const User = mongoose.model('User', userSchema);

module.exports = User;
