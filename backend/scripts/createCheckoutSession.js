const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const YOUR_DOMAIN = 'http://localhost:3000';

const createCheckoutSession = async (req, res) => {
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    mode: 'subscription',
    line_items: [
      {
        price: 'price_1RShuq1qmMqgQ3qQZypaUZkD', // Stripeの価格ID
        quantity: 1,
      },
    ],
    success_url: `${YOUR_DOMAIN}/success`,
    cancel_url: `${YOUR_DOMAIN}/cancel`,
  });

  res.json({ id: session.id });
};

module.exports = createCheckoutSession;
