'use client';

import { PayPalScriptProvider, PayPalButtons } from '@paypal/react-paypal-js';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

interface PayPalButtonProps {
    amount?: string;
    onSuccess?: () => void;
    onError?: (error: string) => void;
}

export default function PayPalButton({ amount = '5.00', onSuccess, onError }: PayPalButtonProps) {
    const { data: session } = useSession();
    const router = useRouter();
    const [error, setError] = useState<string | null>(null);

    const initialOptions = {
        clientId: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || '',
        currency: 'USD',
        intent: 'capture' as const,
    };

    console.log('PayPal Client ID:', initialOptions.clientId);

    if (!initialOptions.clientId) {
        return <div className="text-red-400 text-sm">PayPal Client ID missing</div>;
    }

    return (
        <div className="w-full z-0 relative">
            {error && (
                <div className="mb-4 p-3 bg-red-900/50 border border-red-700 rounded-lg text-red-200 text-sm">
                    {error}
                </div>
            )}

            <PayPalScriptProvider options={initialOptions}>
                <PayPalButtons
                    style={{
                        layout: 'vertical',
                        color: 'gold',
                        shape: 'rect',
                        label: 'paypal',
                        height: 48,
                    }}
                    createOrder={async () => {
                        try {
                            const response = await fetch('/api/paypal/create-order', {
                                method: 'POST',
                            });

                            const orderData = await response.json();

                            if (orderData.id) {
                                return orderData.id;
                            } else {
                                const errorDetail = orderData?.details?.[0];
                                const errorMessage = errorDetail
                                    ? `${errorDetail.issue} ${errorDetail.description} (${orderData.debug_id})`
                                    : JSON.stringify(orderData);

                                throw new Error(errorMessage);
                            }
                        } catch (error) {
                            console.error('PayPal createOrder error:', error);
                            setError(`Could not initiate PayPal Checkout: ${error}`);
                            throw error;
                        }
                    }}
                    onApprove={async (data, actions) => {
                        try {
                            const response = await fetch('/api/paypal/capture-order', {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json',
                                },
                                body: JSON.stringify({
                                    orderID: data.orderID,
                                    userId: session?.user?.id,
                                    email: session?.user?.email,
                                }),
                            });

                            const orderData = await response.json();
                            const errorDetail = orderData?.details?.[0];

                            if (errorDetail?.issue === 'INSTRUMENT_DECLINED') {
                                return actions.restart();
                            } else if (errorDetail) {
                                throw new Error(`${errorDetail.description} (${orderData.debug_id})`);
                            } else if (!orderData.success) {
                                throw new Error('Capture failed');
                            }

                            // Successful capture
                            if (onSuccess) {
                                onSuccess();
                            } else {
                                // Default redirect
                                router.push(`/payment/success?status=successful&tx_ref=${data.orderID}`);
                            }
                        } catch (error) {
                            console.error('PayPal onApprove error:', error);
                            setError(`Payment failed: ${error}`);
                            if (onError) onError(String(error));
                        }
                    }}
                    onError={(err) => {
                        console.error('PayPal onError:', err);
                        setError('An error occurred with PayPal. Please try again.');
                        if (onError) onError(String(err));
                    }}
                />
            </PayPalScriptProvider>
        </div>
    );
}
