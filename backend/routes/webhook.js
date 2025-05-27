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
    console.log(`📥 [Stripe Webhook] type: ${event.type}`);
    console.log(`[Stripe Webhook] event.data.object:`, JSON.stringify(event.data.object, null, 2));
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
        user.subscriptionStartDate = new Date();
        // Stripeのサブスクリプション情報を取得
        const subscription = await stripe.subscriptions.retrieve(subscriptionId);
        user.subscriptionEndDate = new Date(subscription.current_period_end * 1000);
        await user.save();
        console.log('✅ ユーザーをサブスク会員に更新:', user.email);
      } else {
        console.warn('⚠️ ユーザーが見つかりませんでした', { customerId, email });
      }
    } catch (err) {
      console.error('Webhook user update error:', err);
    }
  }

  if (event.type === 'invoice.payment_failed') {
    const invoice = event.data.object;
    const customerId = invoice.customer;
    const subscriptionId = invoice.subscription;

    try {
      const user = await User.findOne({ stripeCustomerId: customerId });
      if (user) {
        user.subscriptionStatus = 'inactive';
        await user.save();
        console.log('❌ ユーザーのサブスクリプションを無効化:', user.email);
      }
    } catch (err) {
      console.error('Webhook payment failure error:', err);
    }
  }

  if (event.type === 'customer.subscription.updated') {
    const subscription = event.data.object;
    const customerId = subscription.customer;

    try {
      const user = await User.findOne({ stripeCustomerId: customerId });
      if (user) {
        if (subscription.status === 'active') {
          user.subscriptionStatus = 'active';
          user.subscriptionEndDate = new Date(subscription.current_period_end * 1000);
        } else if (subscription.status === 'canceled') {
          user.subscriptionStatus = 'canceled';
          user.subscriptionEndDate = new Date(subscription.canceled_at * 1000);
        }
        await user.save();
        console.log('✅ ユーザーのサブスクリプション状態を更新:', user.email);
      }
    } catch (err) {
      console.error('Webhook subscription update error:', err);
    }
  }

  if (event.type === 'customer.subscription.deleted') {
    const subscription = event.data.object;
    const customerId = subscription.customer;

    try {
      const user = await User.findOne({ stripeCustomerId: customerId });
      if (user) {
        user.membershipType = 'free';
        user.subscriptionStatus = 'canceled';
        user.stripeSubscriptionId = null;
        await user.save();
        console.log('✅ ユーザーを無料会員にダウングレード:', user.email);
      }
    } catch (err) {
      console.error('Webhook subscription delete error:', err);
    }
  }

  res.json({ received: true });
});

module.exports = router;
