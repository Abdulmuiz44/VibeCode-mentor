import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

// Lazy load email functions to avoid build-time errors
async function getEmailFunctions() {
  const { sendWelcomeEmail, sendPaymentConfirmationEmail, sendRateLimitWarningEmail, sendWeeklySummaryEmail } = await import('@/lib/email');
  return { sendWelcomeEmail, sendPaymentConfirmationEmail, sendRateLimitWarningEmail, sendWeeklySummaryEmail };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, to, ...params } = body;

    if (!to || !type) {
      return NextResponse.json(
        { error: 'Email recipient and type are required' },
        { status: 400 }
      );
    }

    const { sendWelcomeEmail, sendPaymentConfirmationEmail, sendRateLimitWarningEmail, sendWeeklySummaryEmail } = await getEmailFunctions();
    let result;

    switch (type) {
      case 'welcome':
        result = await sendWelcomeEmail(to, params.userName);
        break;

      case 'payment-confirmation':
        result = await sendPaymentConfirmationEmail(
          to,
          params.userName,
          params.amount,
          params.transactionId,
          params.nextBillingDate
        );
        break;

      case 'rate-limit-warning':
        result = await sendRateLimitWarningEmail(
          to,
          params.userName,
          params.limitType,
          params.remaining
        );
        break;

      case 'weekly-summary':
        result = await sendWeeklySummaryEmail(
          to,
          params.userName,
          params.blueprintsCreated,
          params.chatsUsed,
          params.topVibe,
          params.isPro
        );
        break;

      default:
        return NextResponse.json(
          { error: 'Invalid email type' },
          { status: 400 }
        );
    }

    if (result.success) {
      return NextResponse.json(
        { message: 'Email sent successfully', data: result.data },
        { status: 200 }
      );
    } else {
      return NextResponse.json(
        { error: 'Failed to send email', details: result.error },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Send email API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
