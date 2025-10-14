const Stripe = require('stripe');
const shippo = require('shippo');

module.exports = async (req, res) => {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const sig = req.headers['stripe-signature'];
    const stripe = Stripe(process.env.STRIPE_SECRET_KEY);
    const shippoClient = shippo(process.env.SHIPPO_API_KEY);

    let event;

    try {
        event = stripe.webhooks.constructEvent(
            req.body, 
            sig, 
            process.env.STRIPE_WEBHOOK_SECRET
        );
    } catch (err) {
        console.error('Webhook error:', err.message);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    if (event.type === 'checkout.session.completed') {
        const session = event.data.object;

        console.log('Payment successful for:', session.id);

        try {
            // Create Shippo shipment
            const shipment = await shippoClient.shipment.create({
                address_from: {
                    name: "Barber World NYC",
                    street1: "YOUR_STORE_ADDRESS",
                    city: "New York",
                    state: "NY",
                    zip: "YOUR_ZIP",
                    country: "US"
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

            // Buy cheapest rate
            const rate = shipment.rates[0];
            const transaction = await shippoClient.transaction.create({
                rate: rate.object_id,
                label_file_type: "PDF",
                async: false
            });

            console.log('Label created:', transaction.label_url);

        } catch (error) {
            console.error('Shippo error:', error);
        }
    }

    res.json({ received: true });
};
