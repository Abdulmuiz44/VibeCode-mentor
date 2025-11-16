import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export const alt = 'VibeCode Mentor - AI Project Blueprint Generator';
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = 'image/png';

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: 'linear-gradient(135deg, #000000 0%, #1a1a2e 50%, #16213e 100%)',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
        }}
      >
        {/* Background accents */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'radial-gradient(circle at 30% 50%, rgba(139, 92, 246, 0.3) 0%, transparent 50%)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'radial-gradient(circle at 70% 50%, rgba(96, 165, 250, 0.3) 0%, transparent 50%)',
          }}
        />
        
        {/* Content */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '24px',
            zIndex: 1,
          }}
        >
          {/* Logo/Icon */}
          <div
            style={{
              width: '120px',
              height: '120px',
              background: 'linear-gradient(135deg, #60a5fa 0%, #8b5cf6 50%, #ec4899 100%)',
              borderRadius: '24px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <div
              style={{
                fontSize: '72px',
                color: 'white',
              }}
            >
              ⚡
            </div>
          </div>
          
          {/* Title */}
          <div
            style={{
              fontSize: '72px',
              fontWeight: 'bold',
              background: 'linear-gradient(135deg, #60a5fa 0%, #a78bfa 50%, #ec4899 100%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              color: 'transparent',
              textAlign: 'center',
              lineHeight: 1.2,
            }}
          >
            VibeCode Mentor
          </div>
          
          {/* Subtitle */}
          <div
            style={{
              fontSize: '32px',
              color: '#d1d5db',
              textAlign: 'center',
              maxWidth: '800px',
              lineHeight: 1.4,
            }}
          >
            AI-Powered Project Blueprint Generator
          </div>
          
          {/* Features */}
          <div
            style={{
              display: 'flex',
              gap: '24px',
              marginTop: '32px',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '24px',
                color: '#9ca3af',
              }}
            >
              <span>✨</span>
              <span>AI Blueprints</span>
            </div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '24px',
                color: '#9ca3af',
              }}
            >
              <span>💬</span>
              <span>AI Chat</span>
            </div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '24px',
                color: '#9ca3af',
              }}
            >
              <span>📚</span>
              <span>Templates</span>
            </div>
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
