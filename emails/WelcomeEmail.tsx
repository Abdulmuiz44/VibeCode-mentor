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

interface WelcomeEmailProps {
  userName: string;
}

export default function WelcomeEmail({ userName }: WelcomeEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Welcome to VibeCode Mentor - Start Building Amazing Projects!</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={box}>
            <Heading style={heading}>Welcome to VibeCode Mentor! 🚀</Heading>
            <Text style={paragraph}>Hi {userName},</Text>
            <Text style={paragraph}>
              Thank you for joining VibeCode Mentor! We're excited to help you turn your project ideas into detailed blueprints powered by AI.
            </Text>
            <Text style={paragraph}>
              Here's what you can do with VibeCode Mentor:
            </Text>
            <Text style={list}>
              ✨ Generate comprehensive project blueprints instantly<br />
              💬 Chat with AI for guidance and refinements<br />
              📚 Browse professional templates across multiple categories<br />
              📥 Export as PDF, Markdown, or push to GitHub<br />
              📊 Track your progress with detailed analytics
            </Text>
            <Text style={paragraph}>
              <strong>Free Plan:</strong> 10 blueprint generations and 3 AI chats per day<br />
              <strong>Pro Plan ($5/month):</strong> Unlimited generations, advanced exports, priority support
            </Text>
            <Button style={button} href="https://vibecode-mentor.vercel.app">
              Start Creating Now
            </Button>
            <Text style={paragraph}>
              Need help? Check out our <a href="https://vibecode-mentor.vercel.app/templates" style={link}>templates</a> to get started!
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
  background: 'linear-gradient(to right, #60a5fa, #a78bfa)',
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

const link = {
  color: '#60a5fa',
  textDecoration: 'underline',
};

const footer = {
  fontSize: '14px',
  lineHeight: '24px',
  color: '#9ca3af',
  marginTop: '32px',
};
