const stripe = require('stripe')(process.env.sk_test_51SBkTK0Q7Np77C4ouxsDRBhQHP8uJDn1aJxkRCis00xl7pr0zsD4UJEiHCCYeXgF6LR6FpA2hL229VkMWH207moG00Df5qJXLJ);

module.exports = async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }
    
    try {
        const { lineItems } = req.body;
        
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: lineItems,
            mode: 'payment',
            success_url: `${req.headers.origin || 'https://yourdomain.com'}/success.html`,
            cancel_url: `${req.headers.origin || 'https://yourdomain.com'}/index.html`,
        });
        
        res.status(200).json({ id: session.id });
        
    } catch (error) {
        console.error('Stripe Error:', error);
        res.status(500).json({ error: error.message });
    }
};
