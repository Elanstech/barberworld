const Stripe = require('stripe');

module.exports = async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    try {
        const sessionId = req.query.session_id;
        
        if (!sessionId) {
            return res.status(400).json({ error: 'Missing session_id' });
        }

        const stripe = Stripe(process.env.STRIPE_SECRET_KEY);
        
        const session = await stripe.checkout.sessions.retrieve(sessionId, {
            expand: ['customer']
        });

        res.status(200).json({
            orderNumber: `#${sessionId.slice(-8).toUpperCase()}`,
            email: session.customer_details?.email || session.customer?.email,
            amount: (session.amount_total / 100).toFixed(2),
            currency: session.currency.toUpperCase(),
            status: session.payment_status,
            customerName: session.customer_details?.name
        });

    } catch (error) {
        console.error('Error fetching order details:', error);
        res.status(500).json({ error: 'Failed to fetch order details' });
    }
};
