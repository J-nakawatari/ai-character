import { NextResponse } from 'next/server';

export async function POST(req) {
  const { default: Stripe } = await import('stripe');
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

  const { email, returnTo } = await req.json();

  try {
    // 必要に応じてユーザー情報を取得
    // const user = ...
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      line_items: [
        {
          price: process.env.STRIPE_PRICE_ID, // .envに設定
          quantity: 1,
        },
      ],
      customer_email: email,
      success_url: (returnTo || `${process.env.NEXT_PUBLIC_BASE_URL}/ja/mypage`) + '?subscribed=true',
      cancel_url: returnTo || `${process.env.NEXT_PUBLIC_BASE_URL}/ja/mypage`,
    });
    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error('Stripe error:', err);
    return NextResponse.json({ error: 'Stripe session creation failed' }, { status: 500 });
  }
} 