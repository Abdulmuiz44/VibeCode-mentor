import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

export async function POST(request: NextRequest) {
  try {
    const secretHash = process.env.FLW_SECRET_HASH;
    
    if (!secretHash) {
      console.error('FLW_SECRET_HASH not configured');
      return NextResponse.json({ error: 'Webhook not configured' }, { status: 500 });
    }

    // Verify webhook signature
    const signature = request.headers.get('verif-hash');
    
    if (!signature || signature !== secretHash) {
      console.error('Invalid webhook signature');
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    const rawBody = await request.text();

    // Verify webhook signature using raw body
    if (!verifyWebhookSignature(rawBody, signature, secretHash)) {
      console.error('Invalid webhook signature');
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    const payload = JSON.parse(rawBody);
    
    // Handle successful payment
    if (payload.event === 'charge.completed' && payload.data.status === 'successful') {
      const { customer, tx_ref, amount, currency, meta } = payload.data;
      
      console.log('Payment successful:', {
        email: customer.email,
        txRef: tx_ref,
        amount,
        currency,
      });

      // Update Pro status in Supabase (server-side call via admin client)
      try {
        const { setProStatusInCloud } = await import('@/lib/supabase.server');
        const userId = meta?.userId || customer.email;
        await setProStatusInCloud(userId, customer.email, true);
        console.log('Pro status updated in cloud for:', userId);
      } catch (error) {
        console.error('Error updating Pro status in cloud:', error);
      }
      
      return NextResponse.json({ 
        status: 'success',
        message: 'Webhook processed successfully' 
      });
    }

    // Handle failed payment
    if (payload.event === 'charge.completed' && payload.data.status === 'failed') {
      console.log('Payment failed:', payload.data);
    }

    return NextResponse.json({ status: 'ok' });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}

// Verify Flutterwave webhook signature
function verifyWebhookSignature(rawBody: string, signature: string | null, secret: string): boolean {
  if (!signature) return false;
  const hmac = crypto.createHmac('sha256', secret).update(rawBody).digest('hex');
  return hmac === signature;
}
