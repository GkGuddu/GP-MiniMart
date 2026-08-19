const nodemailer = require('nodemailer');

let cachedTransporter = null;

/**
 * Creates or returns a pooled Nodemailer transporter for instant email dispatch.
 */
const getTransporter = async () => {
    if (cachedTransporter) return cachedTransporter;

    if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
        const isGmail = process.env.EMAIL_SERVICE === 'gmail' || process.env.EMAIL_USER.includes('@gmail.com');
        
        if (isGmail) {
            cachedTransporter = nodemailer.createTransport({
                service: 'gmail',
                pool: true, // Reuse TCP connections for speed
                maxConnections: 5,
                maxMessages: 100,
                auth: {
                    user: process.env.EMAIL_USER,
                    pass: process.env.EMAIL_PASS,
                },
            });
        } else {
            cachedTransporter = nodemailer.createTransport({
                host: process.env.EMAIL_HOST || 'smtp.gmail.com',
                port: parseInt(process.env.EMAIL_PORT || '587'),
                secure: process.env.EMAIL_SECURE === 'true',
                pool: true,
                auth: {
                    user: process.env.EMAIL_USER,
                    pass: process.env.EMAIL_PASS,
                },
            });
        }
    } else {
        // Fallback test account for dev mode
        const testAccount = await nodemailer.createTestAccount();
        cachedTransporter = nodemailer.createTransport({
            host: 'smtp.ethereal.email',
            port: 587,
            secure: false,
            auth: {
                user: testAccount.user,
                pass: testAccount.pass,
            },
        });
    }

    return cachedTransporter;
};

/**
 * Send Email utility - Optimized for high speed instant delivery
 */
const sendEmail = async ({ to, subject, html, text }) => {
    try {
        const transporter = await getTransporter();

        const mailOptions = {
            from: `"${process.env.STORE_NAME || 'SwiftCart'}" <${process.env.EMAIL_FROM || process.env.EMAIL_USER || 'noreply@swiftcart.com'}>`,
            to,
            subject,
            text,
            html,
        };

        const info = await transporter.sendMail(mailOptions);
        
        console.log('====================================');
        console.log(`⚡ INSTANT EMAIL DISPATCHED TO: ${to}`);
        console.log(`SUBJECT: ${subject}`);
        console.log('====================================');

        return info;
    } catch (error) {
        console.error('❌ Failed to send email:', error.message);
        // Reset cached transporter on auth failure to force fresh connection next time
        cachedTransporter = null;
        throw error;
    }
};

module.exports = sendEmail;
