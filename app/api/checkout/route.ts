import { NextRequest, NextResponse } from 'next/server';
import Flutterwave from 'flutterwave-node-v3';

export async function POST(request: NextRequest) {
  try {
    const { email, name } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    const flw = new Flutterwave(
      process.env.FLW_PUBLIC_KEY!,
      process.env.FLW_SECRET_KEY!
    );

    const payload = {
      tx_ref: `vibecode-pro-${Date.now()}`,
      amount: 5,
      currency: 'USD',
      redirect_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/payment/success`,
      payment_options: 'card,ussd,banktransfer',
      customer: {
        email,
        name: name || email.split('@')[0],
      },
      customizations: {
        title: 'VibeCode Pro Subscription',
        description: 'Unlimited saves + GitHub export - $5/month',
        logo: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/logo.png`,
      },
      meta: {
        plan: 'pro',
        userId: email,
      },
    };

    const response = await flw.Charge.card(payload as any);

    if (response.status === 'success' && response.data?.link) {
      return NextResponse.json({
        success: true,
        checkoutUrl: response.data.link,
      });
    }

    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  } catch (error) {
    console.error('Checkout error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
