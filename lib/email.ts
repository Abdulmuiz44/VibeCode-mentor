import { Resend } from 'resend';
import { render } from '@react-email/components';
import WelcomeEmail from '@/emails/WelcomeEmail';
import PaymentConfirmationEmail from '@/emails/PaymentConfirmationEmail';
import RateLimitWarningEmail from '@/emails/RateLimitWarningEmail';
import WeeklySummaryEmail from '@/emails/WeeklySummaryEmail';

const resend = new Resend(process.env.RESEND_API_KEY || 'dummy_key_for_build');

export interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail({ to, subject, html }: SendEmailParams) {
  try {
    const data = await resend.emails.send({
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
  const html = await render(WelcomeEmail({ userName }));
  
  return sendEmail({
    to,
    subject: 'Welcome to VibeCode Mentor - Start Building Amazing Projects! 🚀',
    html,
  });
}

export async function sendPaymentConfirmationEmail(
  to: string,
  userName: string,
  amount: string,
  transactionId: string,
  nextBillingDate: string
) {
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
}

export async function sendRateLimitWarningEmail(
  to: string,
  userName: string,
  limitType: 'blueprints' | 'chats',
  remaining: number
) {
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
}

export async function sendWeeklySummaryEmail(
  to: string,
  userName: string,
  blueprintsCreated: number,
  chatsUsed: number,
  topVibe: string,
  isPro: boolean
) {
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
}
