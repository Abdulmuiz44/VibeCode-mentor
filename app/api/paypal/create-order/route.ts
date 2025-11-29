import { NextRequest, NextResponse } from 'next/server';

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
        console.error('PayPal Access Token Failed:', {
            status: response.status,
            statusText: response.statusText,
            body: errorText,
            env: process.env.NODE_ENV,
            baseUrl: BASE_URL
        });
        throw new Error(`Failed to generate access token: ${response.status}`);
    }

    const data = await response.json();
    return data.access_token;
}

export async function POST(request: NextRequest) {
    try {
        console.log('PayPal Create Order: Starting...');
        if (!PAYPAL_CLIENT_ID || !PAYPAL_SECRET) {
            console.error('PayPal Create Order: Missing credentials', {
                hasClientId: !!PAYPAL_CLIENT_ID,
                hasSecret: !!PAYPAL_SECRET
            });
        }

        const accessToken = await generateAccessToken();
        console.log('PayPal Create Order: Access token generated');

        const url = `${BASE_URL}/v2/checkout/orders`;

        const payload = {
            intent: 'CAPTURE',
            purchase_units: [
                {
                    amount: {
                        currency_code: 'USD',
                        value: '5.00', // Pro plan price
                    },
                    description: 'VibeCode Mentor Pro Subscription',
                },
            ],
        };

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${accessToken}`,
            },
            body: JSON.stringify(payload),
        });

        const data = await response.json();
        console.log('PayPal Create Order: Response status', response.status);

        if (response.status === 201) {
            return NextResponse.json({ id: data.id });
        }

        console.error('PayPal Create Order: Failed', data);

        return NextResponse.json(
            { error: 'Failed to create order', details: data },
            { status: response.status }
        );
    } catch (error) {
        console.error('PayPal Create Order Error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
