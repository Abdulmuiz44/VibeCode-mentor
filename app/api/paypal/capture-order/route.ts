import { NextRequest, NextResponse } from 'next/server';
import { setProStatusInCloud } from '@/lib/supabase.server';

const PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID;
const PAYPAL_SECRET = process.env.PAYPAL_SECRET;
const PAYPAL_ENV = process.env.PAYPAL_ENV || 'sandbox';
const BASE_URL = PAYPAL_ENV === 'production' || PAYPAL_ENV === 'live'
    ? 'https://api-m.paypal.com'
    : 'https://api-m.sandbox.paypal.com';

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
            // Payment successful, upgrade user
            const upgraded = await setProStatusInCloud(userId, email, true);

            if (upgraded) {
                return NextResponse.json({ success: true, data });
            } else {
                console.error('Failed to upgrade user in Supabase after successful payment');
                // Still return success for payment, but maybe with a warning or handle manually
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
