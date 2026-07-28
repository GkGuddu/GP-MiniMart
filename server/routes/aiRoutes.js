const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const Category = require('../models/Category');
const Settings = require('../models/Settings');
const axios = require('axios');

// @desc    Chat with AI Assistant
// @route   POST /api/ai/chat
// @access  Public
router.post('/chat', async (req, res) => {
    const { message } = req.body;

    if (!message || message.trim() === '') {
        return res.status(400).json({ message: 'Message is required' });
    }

    try {
        // Fetch store settings & catalog from database
        const settings = await Settings.findOne() || {
            storeName: 'GP MiniMart',
            email: 'support@gpminimart.com',
            contactNumber: '+91 98765 43210',
            address: 'Local Market, India',
            currency: '₹',
            freeShippingThreshold: 500,
            shippingCharge: 10
        };

        const categories = await Category.find({ parent: null });
        const products = await Product.find({ isActive: true }).populate('category subcategory');

        const geminiKey = process.env.GEMINI_API_KEY;

        if (geminiKey) {
            // Generative AI Integration (Gemini Pro/Flash via standard REST endpoint)
            const categoriesText = categories.map(c => c.name).join(', ');
            const productsText = products.map(p => 
                `- ${p.name} (${p.unit}): Price ${settings.currency}${p.price} (MRP: ${settings.currency}${p.mrp}), Stock: ${p.stock} units`
            ).join('\n');

            const systemInstruction = `You are the GP MiniMart virtual shopping assistant.
Here is the store context and products catalog from the database:
Store Name: ${settings.storeName}
Email: ${settings.email}
Phone: ${settings.contactNumber}
Address: ${settings.address}
Currency: ${settings.currency}
Free Shipping Threshold: ${settings.currency}${settings.freeShippingThreshold}
Shipping Charge: ${settings.currency}${settings.shippingCharge}

Categories: ${categoriesText}

Products Catalog:
${productsText}

Guidelines:
1. Be concise, polite, and helpful.
2. Answer questions accurately based on the catalog above.
3. If asked for a product that is not in the catalog, state that we don't have it in stock but suggest closest alternatives if applicable.
4. Format responses using Markdown (bold text, lists).`;

            const prompt = `${systemInstruction}\n\nUser Question: "${message}"\nAssistant Answer:`;

            try {
                const response = await axios.post(
                    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiKey}`,
                    {
                        contents: [
                            {
                                parts: [
                                    { text: prompt }
                                ]
                            }
                        ]
                    }
                );

                const botText = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;
                if (botText) {
                    return res.json({ text: botText.trim() });
                }
            } catch (geminiError) {
                console.error('Gemini API Error, falling back to Local Search:', geminiError.message);
                // Fail-safe: fall through to local mode
            }
        }

        // --- LOCAL FALLBACK MODE (Fuzzy Keyword Database Query Engine) ---
        const lowerMsg = message.toLowerCase();

        // 1. Greeting
        if (lowerMsg.includes('hi') || lowerMsg.includes('hello') || lowerMsg.includes('hey') || lowerMsg.includes('greetings') || lowerMsg.includes('welcome')) {
            return res.json({
                text: `👋 **Welcome to ${settings.storeName}!**\nHello there! I'm your virtual shopping assistant. How can I help you today? You can ask me about **delivery**, **returns**, **payments**, **offers**, or how to **track orders**!`
            });
        }

        // 2. Delivery info
        if (lowerMsg.includes('delivery') || lowerMsg.includes('shipping') || lowerMsg.includes('speed') || lowerMsg.includes('charge')) {
            return res.json({
                text: `🚀 **Ultra-Fast 10-Minute Delivery:**\nWe deliver fresh groceries to your doorstep in under 10 minutes!\n\n💸 **Shipping Fees:**\n• **FREE** delivery on orders above **${settings.currency}${settings.freeShippingThreshold}**!\n• For orders under that, a minor delivery fee of **${settings.currency}${settings.shippingCharge}** applies.`
            });
        }

        // 3. Contact & Support
        if (lowerMsg.includes('contact') || lowerMsg.includes('support') || lowerMsg.includes('help') || lowerMsg.includes('phone') || lowerMsg.includes('email') || lowerMsg.includes('whatsapp') || lowerMsg.includes('call')) {
            return res.json({
                text: `📞 **Instant Support:**\nWe are here to assist you!\n\n• **WhatsApp Support:** Click the green floating icon in the bottom-right corner for a direct chat.\n• **Phone:** ${settings.contactNumber}\n• **Email:** ${settings.email}\n• **Address:** ${settings.address}`
            });
        }

        // 4. Returns & Refunds
        if (lowerMsg.includes('return') || lowerMsg.includes('refund') || lowerMsg.includes('exchange') || lowerMsg.includes('cancel') || lowerMsg.includes('replace')) {
            return res.json({
                text: `🔄 **Hassle-Free Returns & Refunds:**\nNot satisfied with your purchase? No worries!\n\n• We offer a **no-questions-asked** refund policy within **24 hours** of delivery.\n• Contact us via **WhatsApp** or call us at **${settings.contactNumber}**, and we will process your replacement or refund instantly.`
            });
        }

        // 5. Payment details
        if (lowerMsg.includes('pay') || lowerMsg.includes('payment') || lowerMsg.includes('upi') || lowerMsg.includes('cash') || lowerMsg.includes('cod') || lowerMsg.includes('gpay') || lowerMsg.includes('card')) {
            return res.json({
                text: `💳 **Safe & Secure Payments:**\nWe support multiple payment methods at checkout:\n\n• **UPI:** GPay, PhonePe, Paytm, BHIM\n• **Net Banking / Cards**\n• **Cash on Delivery (COD):** Pay easily when your groceries arrive.`
            });
        }

        // 6. Hours & Timings
        if (lowerMsg.includes('time') || lowerMsg.includes('hours') || lowerMsg.includes('open') || lowerMsg.includes('schedule') || lowerMsg.includes('closed')) {
            return res.json({
                text: `🏪 **Always Open (24/7):**\n${settings.storeName} is open **24 hours a day, 7 days a week**! You can order your grocery essentials whenever you need them, day or night.`
            });
        }

        // 7. Product Catalog / DB Search
        // Extract words (3+ chars) to query
        const words = lowerMsg.split(/\s+/).map(w => w.replace(/[^a-zA-Z0-9]/g, '')).filter(w => w.length > 2);
        
        if (words.length > 0) {
            // Find products matching any of the words
            const matchedProducts = products.filter(p => {
                const nameLower = p.name.toLowerCase();
                return words.some(w => nameLower.includes(w));
            });

            if (matchedProducts.length > 0) {
                const itemsList = matchedProducts.slice(0, 5).map(p => 
                    `• **${p.name}** (${p.unit}): Price: **${settings.currency}${p.price}** (MRP: ${settings.currency}${p.mrp}) | ${p.stock > 0 ? `🟢 In Stock (${p.stock} units)` : '🔴 Out of Stock'}`
                ).join('\n');
                
                return res.json({
                    text: `🥦 **Matched Products in Our Catalog:**\nHere is what I found matching your query:\n\n${itemsList}\n\nFeel free to search for them at the top of the store to add them to your cart!`
                });
            }

            // Find categories matching any of the words
            const matchedCategories = categories.filter(c => {
                const catLower = c.name.toLowerCase();
                return words.some(w => catLower.includes(w));
            });

            if (matchedCategories.length > 0) {
                const catsList = matchedCategories.map(c => `• **${c.name}**`).join('\n');
                return res.json({
                    text: `🏪 **Categories found:**\nWe have categories matching your search:\n\n${catsList}\n\nGo to the **Shop** page and select these categories to explore products!`
                });
            }
        }

        // 8. Default fallback
        return res.json({
            text: `🤖 **How can I help you?**\nI'm the ${settings.storeName} AI Assistant. Ask me about:\n• 🚀 **delivery** speed & cost\n• 🔄 **returns** & refund policy\n• 🏪 store **hours**\n• 📞 **contact** details\n• 💳 accepted **payments**\n• 🥦 specific products (like Basmati Rice, Butter, etc.)`
        });

    } catch (err) {
        console.error('AI chat error:', err);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
});

module.exports = router;
