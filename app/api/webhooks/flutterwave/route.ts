import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import {
    recordPayment,
    getPaymentByTransactionId,
    setProStatusInCloud,
} from '@/lib/supabase.server';

const FLW_SECRET_HASH = process.env.FLW_SECRET_HASH || '';
const FLW_SECRET_KEY = process.env.FLW_SECRET_KEY || '';

// Verify Flutterwave webhook signature
function verifyFlutterwaveSignature(signature: string | null, body: string): boolean {
    if (!signature || !FLW_SECRET_HASH) {
        console.error('Flutterwave webhook: Missing signature or secret hash');
        return false;
    }

    const hash = crypto
        .createHmac('sha256', FLW_SECRET_HASH)
        .update(body)
        .digest('hex');

    return hash === signature;
}

// Verify transaction with Flutterwave API
async function verifyTransaction(transactionId: string) {
    try {
        const response = await fetch(
            `https://api.flutterwave.com/v3/transactions/${transactionId}/verify`,
            {
                headers: {
                    Authorization: `Bearer ${FLW_SECRET_KEY}`,
                },
            }
        );

        const data = await response.json();

        if (data.status === 'success' && data.data.status === 'successful') {
            return {
                verified: true,
                amount: data.data.amount,
                currency: data.data.currency,
                customerEmail: data.data.customer.email,
                txRef: data.data.tx_ref,
                metadata: data.data.meta,
            };
        }

        return { verified: false };
    } catch (error) {
        console.error('Error verifying Flutterwave transaction:', error);
        return { verified: false };
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.text();
        const signature = request.headers.get('verif-hash');

        // Verify webhook signature
        if (!verifyFlutterwaveSignature(signature, body)) {
            console.error('Flutterwave webhook: Invalid signature');
            return NextResponse.json(
                { error: 'Invalid signature' },
                { status: 401 }
            );
        }

        const event = JSON.parse(body);
        console.log('Flutterwave webhook event:', event.event);

        // Handle successful charge
        if (event.event === 'charge.completed') {
            const transactionId = event.data.id.toString();
            const txRef = event.data.tx_ref;

            // Check if payment already processed
            const existingPayment = await getPaymentByTransactionId(transactionId);
            if (existingPayment) {
                console.log('Flutterwave webhook: Payment already processed:', transactionId);
                return NextResponse.json({ message: 'Already processed' });
            }

            // Verify transaction with Flutterwave API (critical!)
            const verification = await verifyTransaction(transactionId);
            if (!verification.verified) {
                console.error('Flutterwave webhook: Transaction verification failed');
                return NextResponse.json(
                    { error: 'Transaction verification failed' },
                    { status: 400 }
                );
            }

            // Extract user info from metadata
            const userId = verification.metadata?.userId || event.data.customer.email;
            const email = verification.customerEmail;

            if (!userId || !email) {
                console.error('Flutterwave webhook: Missing user information');
                return NextResponse.json(
                    { error: 'Missing user information' },
                    { status: 400 }
                );
            }

            // Record payment in database
            const recorded = await recordPayment({
                userId,
                email,
                amount: verification.amount,
                currency: verification.currency,
                paymentMethod: 'flutterwave',
                transactionId,
                status: 'completed',
                metadata: {
                    txRef: verification.txRef,
                    paymentType: event.data.payment_type,
                    webhookEvent: event.event,
                },
            });

            if (!recorded) {
                console.error('Flutterwave webhook: Failed to record payment');
                return NextResponse.json(
                    { error: 'Failed to record payment' },
                    { status: 500 }
                );
            }

            // Activate Pro status
            const upgraded = await setProStatusInCloud(userId, email, true);
            if (!upgraded) {
                console.error('Flutterwave webhook: Failed to upgrade user');
                // Payment recorded but upgrade failed - needs manual intervention
                return NextResponse.json(
                    { warning: 'Payment recorded but upgrade failed' },
                    { status: 200 }
                );
            }

            console.log('Flutterwave webhook: Payment processed successfully:', transactionId);
            return NextResponse.json({ success: true });
        }

        // Handle failed charges
        if (event.event === 'charge.failed') {
            console.log('Flutterwave webhook: Charge failed:', event.data.id);
            // Optionally record failed payment
            return NextResponse.json({ success: true });
        }

        // Unknown event type
        console.log('Flutterwave webhook: Unhandled event type:', event.event);
        return NextResponse.json({ message: 'Event type not handled' });

    } catch (error) {
        console.error('Flutterwave webhook error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
