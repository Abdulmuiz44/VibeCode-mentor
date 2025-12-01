import { NextRequest, NextResponse } from 'next/server';
import {
    setProStatusInCloud,
    recordPayment,
    getPaymentByTransactionId
} from '@/lib/supabase.server';

const PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID;
const PAYPAL_SECRET = process.env.PAYPAL_SECRET;
const PAYPAL_ENV = process.env.PAYPAL_ENV || 'live';
const BASE_URL = PAYPAL_ENV === 'sandbox'
    ? 'https://api-m.sandbox.paypal.com'
    : 'https://api-m.paypal.com';

async function generateAccessToken() {
    if (!PAYPAL_CLIENT_ID || !PAYPAL_SECRET) {
        throw new Error('MISSING_API_CREDENTIALS');
    }
    const auth = Buffer.from(
        PAYPAL_CLIENT_ID + ':' + PAYPAL_SECRET
    ).toString('base64');

    const response = await fetch(`${BASE_URL}/v1/oauth2/token`, {
        method: 'POST',
        body: 'grant_type=client_credentials',
        headers: {
            Authorization: `Basic ${auth}`,
        },
    });

    if (!response.ok) {
        const errorText = await response.text();
        console.error('PayPal Access Token Failed (Capture):', {
            status: response.status,
            body: errorText
        });
        throw new Error(`Failed to generate access token: ${response.status}`);
    }

    const data = await response.json();
    return data.access_token;
}

export async function POST(request: NextRequest) {
    try {
        const { orderID, userId, email } = await request.json();

        if (!orderID || !userId || !email) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        const accessToken = await generateAccessToken();
        const url = `${BASE_URL}/v2/checkout/orders/${orderID}/capture`;

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${accessToken}`,
            },
        });

        const data = await response.json();

        if (response.status === 201 || response.status === 200) {
            // Extract capture ID from response
            const captureId = data.purchase_units?.[0]?.payments?.captures?.[0]?.id || orderID;

            // Check if payment already processed (prevent duplicates)
            const existingPayment = await getPaymentByTransactionId(captureId);
            if (existingPayment) {
                console.log('PayPal: Payment already processed:', captureId);
                return NextResponse.json({ success: true, data, alreadyProcessed: true });
            }

            // Record payment in database
            const recorded = await recordPayment({
                userId,
                email,
                amount: 5.00, // Pro plan price
                currency: 'USD',
                paymentMethod: 'paypal',
                transactionId: captureId,
                status: 'completed',
                metadata: {
                    orderId: orderID,
                    captureData: data,
                },
            });

            if (!recorded) {
                console.error('PayPal: Failed to record payment');
            }

            // Payment successful, upgrade user
            const upgraded = await setProStatusInCloud(userId, email, true);

            if (upgraded) {
                return NextResponse.json({ success: true, data });
            } else {
                console.error('Failed to upgrade user in Supabase after successful payment');
                return NextResponse.json({ success: true, warning: 'Upgrade failed', data });
            }
        }

        return NextResponse.json(
            { error: 'Failed to capture order', details: data },
            { status: response.status }
        );
    } catch (error) {
        console.error('PayPal Capture Order Error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
