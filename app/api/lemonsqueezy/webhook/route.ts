import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { setProStatusInCloud, recordPayment, getPaymentByTransactionId } from '@/lib/supabase.server';

const LEMON_SQUEEZY_WEBHOOK_SECRET = process.env.LEMONSQUEEZY_WEBHOOK_SECRET;

function verifyWebhookSignature(req: NextRequest, body: string): boolean {
  const signature = req.headers.get('x-signature');
  if (!signature || !LEMON_SQUEEZY_WEBHOOK_SECRET) {
    return false;
  }

  const hash = crypto
    .createHmac('sha256', LEMON_SQUEEZY_WEBHOOK_SECRET)
    .update(body)
    .digest('hex');

  return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(hash));
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    
    // Verify webhook signature
    if (!verifyWebhookSignature(request, body)) {
      console.warn('Invalid webhook signature');
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 401 }
      );
    }

    const data = JSON.parse(body);
    const eventType = data.meta?.event_name;
    
    console.log('Lemonsqueezy webhook received:', eventType);

    // Handle subscription payment success
    if (eventType === 'subscription_payment_success') {
      const subscription = data.data;
      const customData = subscription.custom_data || {};
      const userId = customData.userId;
      const customerEmail = subscription.customer_email;
      const subscriptionId = subscription.id;
      const amount = parseFloat(subscription.total / 100) || 5.00; // Lemonsqueezy returns amount in cents

      if (!userId || !customerEmail) {
        console.warn('Missing userId or email in webhook data');
        return NextResponse.json(
          { success: false, message: 'Missing required fields' }
        );
      }

      // Check if payment already processed
      const existingPayment = await getPaymentByTransactionId(subscriptionId);
      if (existingPayment) {
        console.log('Lemonsqueezy: Payment already processed:', subscriptionId);
        return NextResponse.json({ success: true, alreadyProcessed: true });
      }

      // Record payment
      const recorded = await recordPayment({
        userId,
        email: customerEmail,
        amount,
        currency: 'USD',
        paymentMethod: 'lemonsqueezy',
        transactionId: subscriptionId,
        status: 'completed',
        metadata: {
          subscriptionId,
          pricingTier: customData.pricingTier,
          webhookData: subscription,
        },
      });

      if (!recorded) {
        console.error('Lemonsqueezy: Failed to record payment');
        return NextResponse.json(
          { success: false, message: 'Failed to record payment' },
          { status: 500 }
        );
      }

      // Upgrade user to Pro
      const upgraded = await setProStatusInCloud(userId, customerEmail, true);

      if (!upgraded) {
        console.error('Lemonsqueezy: Failed to upgrade user to Pro');
        return NextResponse.json(
          { success: true, warning: 'Payment recorded but upgrade pending' }
        );
      }

      console.log('Lemonsqueezy: Payment processed successfully for user:', userId);
      return NextResponse.json({ success: true, upgraded: true });
    }

    // Handle order creation (initial subscription)
    if (eventType === 'order_created') {
      const order = data.data;
      const customData = order.custom_data || {};
      const userId = customData.userId;
      const customerEmail = order.customer_email;
      
      console.log('Lemonsqueezy: Order created for user:', userId);
      
      // Just log and acknowledge - actual upgrade happens on payment_success
      return NextResponse.json({ success: true, orderCreated: true });
    }

    // Handle subscription updates (changes to existing subscription)
    if (eventType === 'subscription_updated') {
      const subscription = data.data;
      const customData = subscription.custom_data || {};
      const userId = customData.userId;
      const status = subscription.status; // active, paused, cancelled, etc.
      
      console.log('Lemonsqueezy: Subscription updated for user:', userId, 'Status:', status);
      
      // Handle cancellations
      if (status === 'cancelled') {
        // Optional: downgrade user or mark Pro as expired
        console.log('Lemonsqueezy: Subscription cancelled for user:', userId);
      }
      
      // Just log for now - Pro status remains until manual change needed
      return NextResponse.json({ success: true, subscriptionUpdated: true });
    }

    // Log other events for monitoring
    console.log('Lemonsqueezy webhook event not processed:', eventType);
    return NextResponse.json({ success: true, ignored: true });

  } catch (error) {
    console.error('Lemonsqueezy webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}
