import { NextRequest, NextResponse } from 'next/server';
import { getPaymentByTransactionId, getProStatusFromCloud } from '@/lib/supabase.server';

export async function POST(request: NextRequest) {
    try {
        const { transactionId, userId } = await request.json();

        if (!transactionId || !userId) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        // Check if payment exists in our database
        const payment = await getPaymentByTransactionId(transactionId);

        if (!payment) {
            return NextResponse.json(
                { verified: false, error: 'Payment not found' },
                { status: 404 }
            );
        }

        // Verify payment belongs to the user
        if (payment.user_id !== userId) {
            return NextResponse.json(
                { verified: false, error: 'Payment does not belong to user' },
                { status: 403 }
            );
        }

        // Check payment status
        if (payment.status !== 'completed') {
            return NextResponse.json(
                { verified: false, error: 'Payment not completed', status: payment.status },
                { status: 400 }
            );
        }

        // Verify user has Pro status
        const isPro = await getProStatusFromCloud(userId);

        return NextResponse.json({
            verified: true,
            payment: {
                transactionId: payment.transaction_id,
                amount: payment.amount,
                currency: payment.currency,
                paymentMethod: payment.payment_method,
                status: payment.status,
                createdAt: payment.created_at,
            },
            isPro,
        });

    } catch (error) {
        console.error('Payment verification error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
