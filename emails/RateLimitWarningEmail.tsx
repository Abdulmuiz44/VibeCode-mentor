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

interface RateLimitWarningEmailProps {
  userName: string;
  limitType: 'blueprints' | 'chats';
  remaining: number;
}

export default function RateLimitWarningEmail({
  userName,
  limitType,
  remaining,
}: RateLimitWarningEmailProps) {
  const limitText = limitType === 'blueprints' ? 'blueprint generations' : 'AI chat conversations';
  
  return (
    <Html>
      <Head />
      <Preview>You're running low on {limitText} - Upgrade to Pro for unlimited access!</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={box}>
            <Heading style={heading}>⚠️ Usage Limit Warning</Heading>
            <Text style={paragraph}>Hi {userName},</Text>
            <Text style={paragraph}>
              You have <strong>{remaining} {limitText}</strong> remaining in your free daily limit.
            </Text>
            <Text style={paragraph}>
              Your limits will reset at midnight UTC, but why wait? Upgrade to Pro for unlimited access!
            </Text>
            
            <Section style={proBox}>
              <Text style={proTitle}>VibeCode Mentor Pro - $5/month</Text>
              <Text style={list}>
                ✨ Unlimited blueprint generations<br />
                💬 Unlimited AI chat conversations<br />
                📄 PDF export functionality<br />
                🐙 GitHub repository creation<br />
                ⚡ Priority support<br />
                🎨 Premium templates
              </Text>
            </Section>
            
            <Button style={button} href="https://vibecode-mentor.vercel.app">
              Upgrade to Pro Now
            </Button>
            
            <Text style={paragraph}>
              Continue building amazing projects without limits!
            </Text>
            
            <Text style={footer}>
              Happy coding! 💜<br />
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
  background: 'linear-gradient(to right, #f59e0b, #ef4444)',
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

const proBox = {
  backgroundColor: '#1f1f1f',
  borderRadius: '8px',
  padding: '24px',
  margin: '24px 0',
  border: '2px solid #8b5cf6',
};

const proTitle = {
  fontSize: '20px',
  fontWeight: 'bold',
  color: '#a78bfa',
  marginBottom: '12px',
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
