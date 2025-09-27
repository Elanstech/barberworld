// api/checkout.js - Production Ready with Error Handling
const Stripe = require('stripe');

module.exports = async (req, res) => {
    // Enable CORS for all origins
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    // Handle preflight requests
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    
    // Only allow POST requests
    if (req.method !== 'POST') {
        return res.status(405).json({ 
            error: 'Method not allowed',
            message: 'This endpoint only accepts POST requests'
        });
    }
    
    try {
        // Get Stripe secret key from environment
        const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
        
        // Validate environment variable exists
        if (!stripeSecretKey) {
            console.error('❌ STRIPE_SECRET_KEY not found in environment');
            return res.status(500).json({ 
                error: 'Server configuration error',
                message: 'Stripe API key is not configured. Please contact support.',
                debug: 'STRIPE_SECRET_KEY environment variable is missing'
            });
        }
        
        // Validate Stripe key format
        if (!stripeSecretKey.startsWith('sk_test_') && !stripeSecretKey.startsWith('sk_live_')) {
            console.error('❌ Invalid Stripe key format');
            return res.status(500).json({ 
                error: 'Server configuration error',
                message: 'Invalid Stripe API key format',
                debug: 'Key must start with sk_test_ or sk_live_'
            });
        }
        
        // Initialize Stripe
        const stripe = Stripe(stripeSecretKey);
        
        // Validate request body
        const { lineItems } = req.body;
        
        if (!lineItems || !Array.isArray(lineItems) || lineItems.length === 0) {
            return res.status(400).json({ 
                error: 'Invalid request',
                message: 'Cart is empty or invalid'
            });
        }
        
        // Determine the base URL (works for both custom domain and Vercel URL)
        const protocol = req.headers['x-forwarded-proto'] || 'https';
        const host = req.headers['x-forwarded-host'] || req.headers.host;
        const baseUrl = `${protocol}://${host}`;
        
        console.log('🌍 Base URL:', baseUrl);
        console.log('🛒 Creating session for', lineItems.length, 'items');
        
        // Create Stripe Checkout Session
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: lineItems,
            mode: 'payment',
            success_url: `${baseUrl}/success.html?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${baseUrl}/index.html`,
            shipping_address_collection: {
                allowed_countries: ['US', 'CA']
            },
            metadata: {
                source: 'barber-world-website',
                timestamp: new Date().toISOString()
            }
        });
        
        console.log('✅ Session created:', session.id);
        
        // Return session ID
        return res.status(200).json({ 
            id: session.id,
            url: session.url
        });
        
    } catch (error) {
        console.error('❌ Stripe Error:', error.message);
        console.error('Error Details:', error);
        
        // Handle specific Stripe errors
        if (error.type === 'StripeInvalidRequestError') {
            return res.status(400).json({ 
                error: 'Invalid request to Stripe',
                message: error.message,
                debug: error.type
            });
        }
        
        if (error.type === 'StripeAuthenticationError') {
            return res.status(401).json({ 
                error: 'Stripe authentication failed',
                message: 'Invalid API credentials',
                debug: error.message
            });
        }
        
        // Generic error response
        return res.status(500).json({ 
            error: 'Checkout failed',
            message: error.message || 'An unexpected error occurred',
            debug: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
};
