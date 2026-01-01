import { Resend } from 'resend';
import { render } from '@react-email/components';
import WelcomeEmail from '@/emails/WelcomeEmail';
import PaymentConfirmationEmail from '@/emails/PaymentConfirmationEmail';
import RateLimitWarningEmail from '@/emails/RateLimitWarningEmail';
import WeeklySummaryEmail from '@/emails/WeeklySummaryEmail';

// Lazy initialization to avoid build-time errors when API key is missing
let resend: Resend | null = null;

function getResendClient() {
  if (!resend) {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      throw new Error('RESEND_API_KEY is not configured');
    }
    resend = new Resend(apiKey);
  }
  return resend;
}

export interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail({ to, subject, html }: SendEmailParams) {
  try {
    const client = getResendClient();
    const data = await client.emails.send({
      from: 'VibeCode Mentor <vibecodeguide@gmail.com>',
      to,
      subject,
      html,
    });
    
    return { success: true, data };
  } catch (error) {
    console.error('Email send error:', error);
    return { success: false, error };
  }
}

export async function sendWelcomeEmail(to: string, userName: string) {
  try {
    const html = await render(WelcomeEmail({ userName }));
    
    return sendEmail({
      to,
      subject: 'Welcome to VibeCode Mentor - Start Building Amazing Projects! 🚀',
      html,
    });
  } catch (error) {
    console.error('Error rendering welcome email:', error);
    return { success: false, error };
  }
}

export async function sendPaymentConfirmationEmail(
  to: string,
  userName: string,
  amount: string,
  transactionId: string,
  nextBillingDate: string
) {
  try {
    const html = await render(
      PaymentConfirmationEmail({
        userName,
        amount,
        transactionId,
        nextBillingDate,
      })
    );
    
    return sendEmail({
      to,
      subject: 'Payment Confirmed - Welcome to VibeCode Mentor Pro! 🎉',
      html,
    });
  } catch (error) {
    console.error('Error rendering payment confirmation email:', error);
    return { success: false, error };
  }
}

export async function sendRateLimitWarningEmail(
  to: string,
  userName: string,
  limitType: 'blueprints' | 'chats',
  remaining: number
) {
  try {
    const html = await render(
      RateLimitWarningEmail({
        userName,
        limitType,
        remaining,
      })
    );
    
    const limitText = limitType === 'blueprints' ? 'Blueprint Generations' : 'AI Chats';
    
    return sendEmail({
      to,
      subject: `⚠️ Low on ${limitText} - Upgrade to Pro for Unlimited Access`,
      html,
    });
  } catch (error) {
    console.error('Error rendering rate limit warning email:', error);
    return { success: false, error };
  }
}

export async function sendWeeklySummaryEmail(
  to: string,
  userName: string,
  blueprintsCreated: number,
  chatsUsed: number,
  topVibe: string,
  isPro: boolean
) {
  try {
    const html = await render(
      WeeklySummaryEmail({
        userName,
        blueprintsCreated,
        chatsUsed,
        topVibe,
        isPro,
      })
    );
    
    return sendEmail({
      to,
      subject: 'Your VibeCode Mentor Weekly Summary 📊',
      html,
    });
  } catch (error) {
    console.error('Error rendering weekly summary email:', error);
    return { success: false, error };
  }
}
