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

interface WeeklySummaryEmailProps {
  userName: string;
  blueprintsCreated: number;
  chatsUsed: number;
  topVibe: string;
  isPro: boolean;
}

export default function WeeklySummaryEmail({
  userName,
  blueprintsCreated,
  chatsUsed,
  topVibe,
  isPro,
}: WeeklySummaryEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Your VibeCode Mentor Weekly Summary 📊</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={box}>
            <Heading style={heading}>Your Weekly Summary 📊</Heading>
            <Text style={paragraph}>Hi {userName},</Text>
            <Text style={paragraph}>
              Here's what you accomplished this week with VibeCode Mentor:
            </Text>
            
            <Section style={statsBox}>
              <div style={statRow}>
                <Text style={statLabel}>Blueprints Generated:</Text>
                <Text style={statValue}>{blueprintsCreated}</Text>
              </div>
              <div style={statRow}>
                <Text style={statLabel}>AI Chats:</Text>
                <Text style={statValue}>{chatsUsed}</Text>
              </div>
              <div style={statRow}>
                <Text style={statLabel}>Most Popular Vibe:</Text>
                <Text style={statValue}>{topVibe || 'None yet'}</Text>
              </div>
            </Section>

            {!isPro && blueprintsCreated >= 50 && (
              <Section style={upgradeBox}>
                <Text style={upgradeTitle}>🚀 You're on fire!</Text>
                <Text style={paragraph}>
                  You've created {blueprintsCreated} blueprints this week! Ready to level up?
                </Text>
                <Text style={list}>
                  Upgrade to Pro for:<br />
                  ✨ Unlimited generations & chats<br />
                  📄 PDF & GitHub exports<br />
                  ⚡ Priority support
                </Text>
                <Button style={button} href="https://vibecode-mentor.vercel.app">
                  Upgrade to Pro - $5/month
                </Button>
              </Section>
            )}

            {isPro && (
              <Text style={proMessage}>
                💜 Thank you for being a Pro member! Keep building amazing projects!
              </Text>
            )}
            
            <Text style={paragraph}>
              Keep the momentum going! Check out our <a href="https://vibecode-mentor.vercel.app/templates" style={link}>new templates</a> for inspiration.
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
  background: 'linear-gradient(to right, #60a5fa, #a78bfa, #ec4899)',
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

const statsBox = {
  backgroundColor: '#1f1f1f',
  borderRadius: '8px',
  padding: '24px',
  margin: '24px 0',
  border: '1px solid #374151',
};

const statRow = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: '12px',
};

const statLabel = {
  fontSize: '16px',
  color: '#9ca3af',
  margin: 0,
};

const statValue = {
  fontSize: '20px',
  fontWeight: 'bold',
  color: '#a78bfa',
  margin: 0,
};

const upgradeBox = {
  backgroundColor: '#1f1f1f',
  borderRadius: '8px',
  padding: '24px',
  margin: '24px 0',
  border: '2px solid #8b5cf6',
};

const upgradeTitle = {
  fontSize: '20px',
  fontWeight: 'bold',
  color: '#a78bfa',
  marginBottom: '12px',
};

const proMessage = {
  fontSize: '16px',
  lineHeight: '26px',
  color: '#a78bfa',
  backgroundColor: '#1f1f1f',
  padding: '16px',
  borderRadius: '8px',
  border: '1px solid #8b5cf6',
  margin: '24px 0',
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
