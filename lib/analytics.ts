// Google Analytics 4 tracking functions
export const GA_TRACKING_ID = process.env.NEXT_PUBLIC_GA_ID || '';

// Track page views
export const pageview = (url: string) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('config', GA_TRACKING_ID, {
      page_path: url,
    });
  }
};

// Track custom events
interface EventParams {
  action: string;
  category: string;
  label?: string;
  value?: number;
  [key: string]: any;
}

export const event = ({ action, category, label, value, ...params }: EventParams) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', action, {
      event_category: category,
      event_label: label,
      value: value,
      ...params,
    });
  }
};

// Predefined event tracking functions for common actions
export const trackBlueprintGenerated = (vibe: string, isPro: boolean) => {
  event({
    action: 'blueprint_generated',
    category: 'Engagement',
    label: vibe,
    value: isPro ? 1 : 0,
    user_type: isPro ? 'pro' : 'free',
  });
};

export const trackChatMessage = (isPro: boolean) => {
  event({
    action: 'chat_message_sent',
    category: 'Engagement',
    user_type: isPro ? 'pro' : 'free',
  });
};

export const trackTemplateUsed = (templateName: string) => {
  event({
    action: 'template_used',
    category: 'Templates',
    label: templateName,
  });
};

export const trackExport = (exportType: 'pdf' | 'markdown' | 'github') => {
  event({
    action: 'blueprint_exported',
    category: 'Export',
    label: exportType,
  });
};

export const trackProUpgrade = (amount: string) => {
  event({
    action: 'pro_upgrade',
    category: 'Conversion',
    value: parseFloat(amount),
  });
};

export const trackSignIn = (method: string) => {
  event({
    action: 'sign_in',
    category: 'Auth',
    label: method,
  });
};

export const trackSignOut = () => {
  event({
    action: 'sign_out',
    category: 'Auth',
  });
};

export const trackBlueprintSaved = (isPro: boolean, cloudSync: boolean) => {
  event({
    action: 'blueprint_saved',
    category: 'Engagement',
    label: cloudSync ? 'cloud' : 'local',
    user_type: isPro ? 'pro' : 'free',
  });
};

export const trackRateLimitHit = (limitType: 'blueprints' | 'chats') => {
  event({
    action: 'rate_limit_hit',
    category: 'Limits',
    label: limitType,
  });
};

// Extend Window interface for TypeScript
declare global {
  interface Window {
    gtag: (
      command: string,
      targetId: string,
      config?: Record<string, any>
    ) => void;
  }
}
