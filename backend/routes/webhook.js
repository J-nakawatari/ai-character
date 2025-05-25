const express = require('express');
const router = express.Router();
const User = require('../models/User');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// Stripe Webhookエンドポイント（本番用・署名検証あり）
router.post('/stripe', express.raw({ type: 'application/json' }), async (req, res) => {
  console.log('📥 Webhook 受信しました！');

  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error('❌ Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'checkout.session.completed' || event.type === 'invoice.paid') {
    const session = event.data.object;
    const customerId = session.customer || session.customer_id;
    const subscriptionId = session.subscription || session.subscription_id;
    const email = session.customer_email || session.customer_details?.email || session.email;

    try {
      let user = await User.findOne({ stripeCustomerId: customerId });
      if (!user && email) {
        user = await User.findOne({ email });
      }
      if (user) {
        user.membershipType = 'subscription';
        user.subscriptionStatus = 'active';
        user.stripeCustomerId = customerId;
        user.stripeSubscriptionId = subscriptionId;
        user.subscriptionStartDate = user.subscriptionStartDate || new Date();
        await user.save();
        console.log('✅ ユーザーをサブスク会員に更新:', user.email);
      } else {
        console.warn('⚠️ ユーザーが見つかりませんでした', { customerId, email });
      }
    } catch (err) {
      console.error('Webhook user update error:', err);
    }
  }

  res.json({ received: true });
});

module.exports = router;
