// Google Analytics 4 (GA4) & Marketing Event Tracking Helper

export const GA_TRACKING_ID = process.env.NEXT_PUBLIC_GA_ID || '';

// Type-safe global gtag declaration
declare global {
  interface Window {
    gtag?: (
      command: 'config' | 'event' | 'js' | 'set',
      targetIdOrAction: string | Date,
      configOrParams?: Record<string, unknown>
    ) => void;
    dataLayer?: unknown[];
  }
}

/**
 * Log a custom event to Google Analytics
 */
export const trackEvent = (
  eventName: string,
  params?: Record<string, string | number | boolean>
) => {
  if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
    window.gtag('event', eventName, params || {});
  }
};

/**
 * Common Conversion Events for Medikto Marketing
 */
export const trackDownloadApp = (source: string = 'hero_button') => {
  trackEvent('click_download_app', {
    event_category: 'Conversion',
    event_label: source,
    app_platform: 'android',
  });
};

export const trackContactSubmit = (subject: string = 'General Inquiry') => {
  trackEvent('submit_contact_form', {
    event_category: 'Lead',
    event_label: subject,
  });
};

export const trackModalOpen = (modalName: string) => {
  trackEvent('view_interactive_modal', {
    event_category: 'Engagement',
    event_label: modalName,
  });
};

export const trackExternalLink = (destination: string, label: string) => {
  trackEvent('click_external_link', {
    event_category: 'Outbound',
    event_label: label,
    destination_url: destination,
  });
};
