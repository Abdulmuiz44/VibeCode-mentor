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

    const payload = await request.json();
    
    // Handle successful payment
    if (payload.event === 'charge.completed' && payload.data.status === 'successful') {
      const { customer, tx_ref, amount, currency } = payload.data;
      
      console.log('Payment successful:', {
        email: customer.email,
        txRef: tx_ref,
        amount,
        currency,
      });

      // In a real app, you would:
      // 1. Store subscription in database
      // 2. Send confirmation email
      // 3. Activate user's Pro status
      
      // For now, we'll rely on client-side storage after redirect
      // The success page will activate Pro status
      
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
function verifyWebhookSignature(payload: any, signature: string, secret: string): boolean {
  const hash = crypto
    .createHmac('sha256', secret)
    .update(JSON.stringify(payload))
    .digest('hex');
  
  return hash === signature;
}
