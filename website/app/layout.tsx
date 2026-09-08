import type { Metadata, Viewport } from 'next';
import Script from 'next/script';
import './globals.css';

const GA_ID = process.env.NEXT_PUBLIC_GA_ID;
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://medikto.com';

export const viewport: Viewport = {
  themeColor: '#006591',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  title: 'Medikto — Patient-Centric Health & Medication Management Platform',
  description:
    'Effortlessly organize daily medication schedules, verify doses with selfie proof, log vital health readings, store clinical documents, and connect family caregivers.',
  keywords: [
    'medication management',
    'pill reminder app',
    'dose verification',
    'patient health app',
    'senior healthcare',
    'caregiver alerts',
    'vitals tracker',
    'blood pressure log',
    'blood sugar monitoring',
    'medical document locker',
    'hospital prescription sync',
    'Medikto',
    'Medikto health',
  ],
  authors: [{ name: 'Medikto Health Technologies Inc.' }],
  creator: 'Medikto',
  publisher: 'Medikto Health Technologies Inc.',
  metadataBase: new URL(SITE_URL),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'Medikto — Patient-Centric Health & Medication Platform',
    description:
      'Empowering patients, seniors, and family caregivers with automated pill alarms, selfie dose verification, live vitals tracking, and doctor summary reports.',
    url: SITE_URL,
    siteName: 'Medikto',
    images: [
      {
        url: '/images/medikto_logo.png',
        width: 1200,
        height: 630,
        alt: 'Medikto Health Platform Logo',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Medikto — Patient-Centric Health & Medication Platform',
    description:
      'Organize daily medications, verify dose intake, track vital health readings, and sync with family caregivers effortlessly.',
    images: ['/images/medikto_logo.png'],
  },
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/images/medikto_icon.png', sizes: '192x192', type: 'image/png' },
      { url: '/images/medikto_icon_trimmed.png', sizes: '512x512', type: 'image/png' },
    ],
    shortcut: '/favicon.ico',
    apple: [
      { url: '/images/medikto_icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION || undefined,
  },
};

// Rich Structured Data (JSON-LD) for Google Search Engine Optimization
const structuredData = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebSite',
      '@id': `${SITE_URL}/#website`,
      url: SITE_URL,
      name: 'Medikto',
      description: 'Patient-Centric Health & Medication Management Platform',
      publisher: {
        '@id': `${SITE_URL}/#organization`,
      },
    },
    {
      '@type': 'Organization',
      '@id': `${SITE_URL}/#organization`,
      name: 'Medikto Health Technologies Inc.',
      url: SITE_URL,
      logo: `${SITE_URL}/images/medikto_logo.png`,
      contactPoint: {
        '@type': 'ContactPoint',
        telephone: '+91-800-MEDIKTO',
        contactType: 'customer support',
        email: 'info@medikto.com',
      },
    },
    {
      '@type': 'MobileApplication',
      '@id': `${SITE_URL}/#app`,
      name: 'Medikto',
      operatingSystem: 'Android, iOS',
      applicationCategory: 'HealthApplication',
      description:
        'Medication reminder, selfie dose confirmation, health vitals monitoring, and caregiver alerts.',
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'INR',
      },
      publisher: {
        '@id': `${SITE_URL}/#organization`,
      },
    },
    {
      '@type': 'MedicalWebPage',
      '@id': `${SITE_URL}/#webpage`,
      url: SITE_URL,
      name: 'Medikto — Patient-Centric Health & Medication Platform',
      description:
        'Patient-centric medication adherence and vitals tracking application for patients, seniors, and family caregivers.',
      medicalAudience: ['Patient', 'Caregiver', 'Senior', 'Clinician'],
    },
    {
      '@type': 'FAQPage',
      '@id': 'https://medikto.health/#faq',
      mainEntity: [
        {
          '@type': 'Question',
          name: 'What is Medikto?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Medikto is a patient-centric mobile health application that helps patients and seniors manage daily medication schedules, verify dose intake, track blood pressure and sugar vitals, and keep family caregivers automatically updated.',
          },
        },
        {
          '@type': 'Question',
          name: 'How does dose verification work?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'When medication is due, Medikto sounds an alarm. Patients take their medicine and tap Confirm (with optional selfie proof) to verify their dose and keep their health streak intact.',
          },
        },
        {
          '@type': 'Question',
          name: 'How do family caregivers receive alerts?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'When a patient confirms or misses a scheduled dose, connected family caregivers receive real-time notifications and status updates.',
          },
        },
        {
          '@type': 'Question',
          name: 'How do I connect to a partnered hospital or doctor?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Patients can connect to partner hospitals using a secure 5-minute verified OTP to automatically sync digital prescriptions and medication plans.',
          },
        },
        {
          '@type': 'Question',
          name: 'Is the Medikto app free for patients?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Yes, the Medikto mobile app is free to download for patients and family caregivers.',
          },
        },
      ],
    },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap"
        />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=Inter:wght@400;500;600;700;800;900&display=swap"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      </head>
      <body className="antialiased font-sans text-slate-900 bg-[#f8f9ff] selection:bg-cyan-500 selection:text-white">
        {/* Google Analytics 4 (GA4) Tag */}
        {GA_ID && (
          <>
            <Script
              strategy="afterInteractive"
              src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
            />
            <Script
              id="google-analytics"
              strategy="afterInteractive"
              dangerouslySetInnerHTML={{
                __html: `
                  window.dataLayer = window.dataLayer || [];
                  function gtag(){dataLayer.push(arguments);}
                  gtag('js', new Date());
                  gtag('config', '${GA_ID}', {
                    page_path: window.location.pathname,
                  });
                `,
              }}
            />
          </>
        )}
        {children}
      </body>
    </html>
  );
}
