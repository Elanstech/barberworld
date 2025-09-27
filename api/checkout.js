// api/checkout.js - Fixed version
const Stripe = require('stripe');

module.exports = async (req, res) => {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    // Handle preflight
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }
    
    try {
        // Get the secret key from environment variable
        const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
        
        if (!stripeSecretKey) {
            throw new Error('STRIPE_SECRET_KEY is not set in environment variables');
        }
        
        // Initialize Stripe with the secret key
        const stripe = Stripe(stripeSecretKey);
        
        const { lineItems } = req.body;
        
        if (!lineItems || lineItems.length === 0) {
            throw new Error('No items in cart');
        }
        
        // Create Stripe checkout session
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: lineItems,
            mode: 'payment',
            success_url: `${req.headers.origin || 'https://barberworld-beryl.vercel.app'}/success.html?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${req.headers.origin || 'https://barberworld-beryl.vercel.app'}/index.html`,
            metadata: {
                source: 'barber-world-website'
            }
        });
        
        res.status(200).json({ id: session.id });
        
    } catch (error) {
        console.error('Stripe Error:', error);
        res.status(500).json({ 
            error: error.message,
            details: 'Check Vercel logs for more information'
        });
    }
};
