import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
} from '@react-email/components';

interface PaymentConfirmationEmailProps {
  userName: string;
  amount: string;
  transactionId: string;
  nextBillingDate: string;
}

export default function PaymentConfirmationEmail({
  userName,
  amount,
  transactionId,
  nextBillingDate,
}: PaymentConfirmationEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Payment Confirmed - Welcome to VibeCode Mentor Pro! 🎉</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={box}>
            <Heading style={heading}>Payment Confirmed! 🎉</Heading>
            <Text style={paragraph}>Hi {userName},</Text>
            <Text style={paragraph}>
              Thank you for upgrading to VibeCode Mentor Pro! Your payment has been successfully processed.
            </Text>
            
            <Section style={receiptBox}>
              <Text style={receiptTitle}>Payment Receipt</Text>
              <Text style={receiptItem}>
                <strong>Amount:</strong> {amount}
              </Text>
              <Text style={receiptItem}>
                <strong>Transaction ID:</strong> {transactionId}
              </Text>
              <Text style={receiptItem}>
                <strong>Next Billing Date:</strong> {nextBillingDate}
              </Text>
            </Section>

            <Text style={paragraph}>
              <strong>You now have access to:</strong>
            </Text>
            <Text style={list}>
              ✨ Unlimited blueprint generations<br />
              💬 Unlimited AI chat conversations<br />
              📄 PDF export functionality<br />
              🐙 GitHub repository creation<br />
              ⚡ Priority support<br />
              🎨 Access to premium templates<br />
              ☁️ Enhanced cloud storage
            </Text>
            
            <Button style={button} href="https://vibecode-mentor.vercel.app">
              Start Using Pro Features
            </Button>
            
            <Text style={paragraph}>
              Questions about your subscription? Contact us at support@vibecode-mentor.com
            </Text>
            
            <Text style={footer}>
              Thank you for your support! 💜<br />
              The VibeCode Mentor Team
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

const main = {
  backgroundColor: '#0a0a0a',
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
};

const container = {
  backgroundColor: '#111111',
  margin: '0 auto',
  padding: '20px 0 48px',
  marginBottom: '64px',
};

const box = {
  padding: '0 48px',
};

const heading = {
  fontSize: '32px',
  lineHeight: '1.3',
  fontWeight: '700',
  color: '#ffffff',
  background: 'linear-gradient(to right, #10b981, #8b5cf6)',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
};

const paragraph = {
  fontSize: '16px',
  lineHeight: '26px',
  color: '#d1d5db',
};

const list = {
  fontSize: '16px',
  lineHeight: '28px',
  color: '#d1d5db',
  paddingLeft: '20px',
};

const receiptBox = {
  backgroundColor: '#1f1f1f',
  borderRadius: '8px',
  padding: '24px',
  margin: '24px 0',
  border: '1px solid #374151',
};

const receiptTitle = {
  fontSize: '18px',
  fontWeight: 'bold',
  color: '#ffffff',
  marginBottom: '12px',
};

const receiptItem = {
  fontSize: '14px',
  lineHeight: '24px',
  color: '#d1d5db',
  margin: '8px 0',
};

const button = {
  backgroundColor: '#8b5cf6',
  borderRadius: '8px',
  color: '#fff',
  fontSize: '16px',
  fontWeight: 'bold',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'block',
  padding: '12px 20px',
  margin: '24px 0',
};

const footer = {
  fontSize: '14px',
  lineHeight: '24px',
  color: '#9ca3af',
  marginTop: '32px',
};
