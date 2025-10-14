const Stripe = require('stripe');
const shippo = require('shippo');

// IMPORTANT: Export config to get raw body
export const config = {
    api: {
        bodyParser: false,
    },
};

// Helper function to get raw body
async function getRawBody(req) {
    return new Promise((resolve, reject) => {
        let buffer = '';
        req.on('data', chunk => {
            buffer += chunk;
        });
        req.on('end', () => {
            resolve(buffer);
        });
        req.on('error', reject);
    });
}

module.exports = async (req, res) => {
    // Only allow POST requests
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const sig = req.headers['stripe-signature'];
    const stripe = Stripe(process.env.STRIPE_SECRET_KEY);
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    let event;

    try {
        // Get raw body as string
        const rawBody = await getRawBody(req);
        
        // Verify webhook signature with raw body
        event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret);
    } catch (err) {
        console.error('⚠️ Webhook signature verification failed:', err.message);
        return res.status(400).json({ 
            error: 'Webhook signature verification failed',
            message: err.message 
        });
    }

    console.log('✅ Webhook verified:', event.type);

    // Handle the checkout.session.completed event
    if (event.type === 'checkout.session.completed') {
        const session = event.data.object;

        console.log('💳 Payment completed for session:', session.id);
        console.log('📧 Customer email:', session.customer_details?.email);

        // Check if we have shipping address
        if (!session.shipping || !session.shipping.address) {
            console.log('⚠️ No shipping address found in session');
            return res.status(200).json({ 
                received: true, 
                message: 'No shipping address to process' 
            });
        }

        // Check if Shippo API key exists
        if (!process.env.SHIPPO_API_KEY) {
            console.error('❌ SHIPPO_API_KEY not found in environment variables');
            return res.status(200).json({ 
                received: true, 
                error: 'Shippo API key not configured' 
            });
        }

        try {
            const shippoClient = shippo(process.env.SHIPPO_API_KEY);

            // Create Shippo shipment
            const shipment = await shippoClient.shipment.create({
                address_from: {
                    name: "Barber World NYC",
                    street1: "YOUR_STORE_ADDRESS",  // ⚠️ CHANGE THIS
                    city: "New York",
                    state: "NY",
                    zip: "YOUR_ZIP",  // ⚠️ CHANGE THIS
                    country: "US",
                    email: "barberworldnyc@gmail.com"
                },
                address_to: {
                    name: session.customer_details.name,
                    street1: session.shipping.address.line1,
                    street2: session.shipping.address.line2 || '',
                    city: session.shipping.address.city,
                    state: session.shipping.address.state,
                    zip: session.shipping.address.postal_code,
                    country: session.shipping.address.country,
                    email: session.customer_details.email
                },
                parcels: [{
                    length: "10",
                    width: "8",
                    height: "4",
                    distance_unit: "in",
                    weight: "2",
                    mass_unit: "lb"
                }],
                async: false
            });

            console.log('📦 Shipment created:', shipment.object_id);

            // Buy the cheapest rate
            if (shipment.rates && shipment.rates.length > 0) {
                const rate = shipment.rates[0];
                const transaction = await shippoClient.transaction.create({
                    rate: rate.object_id,
                    label_file_type: "PDF",
                    async: false
                });

                console.log('✅ Label purchased:', transaction.label_url);
                console.log('📧 Tracking will be emailed to:', session.customer_details.email);
            } else {
                console.log('⚠️ No shipping rates available');
            }

        } catch (shippoError) {
            console.error('❌ Shippo error:', shippoError.message);
            // Don't fail the webhook - just log the error
            return res.status(200).json({ 
                received: true, 
                error: 'Shippo processing failed',
                details: shippoError.message 
            });
        }
    }

    // Return 200 to acknowledge receipt
    res.status(200).json({ received: true });
};
