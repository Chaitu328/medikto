import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Medikto — Patient-Centric Health & Medication Management Platform',
  description: 'Effortlessly organize daily medication schedules, track vital health readings, store clinical documents, and connect family caregivers with zero friction.',
  keywords: [
    'medication management',
    'pill reminder',
    'patient health app',
    'senior healthcare',
    'caregiver sync',
    'vitals tracker',
    'blood pressure log',
    'glucose monitoring',
    'medical document locker',
    'Medikto',
  ],
  authors: [{ name: 'Medikto Health Technologies Inc.' }],
  creator: 'Medikto',
  publisher: 'Medikto Health Technologies Inc.',
  metadataBase: new URL('https://medikto.health'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'Medikto — Patient-Centric Health & Medication Management',
    description: 'Empowering patients, seniors, and family caregivers with automated pill scheduling, live vitals tracking, and encrypted document storage.',
    url: 'https://medikto.health',
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
    description: 'Organize daily medications, track vital health readings, and sync with caregivers effortlessly.',
    images: ['/images/medikto_logo.png'],
  },
  icons: {
    icon: '/images/medikto_icon.png',
    shortcut: '/images/medikto_icon.png',
    apple: '/images/medikto_icon.png',
  },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'MedicalWebPage',
  name: 'Medikto Patient-Centric Health Platform',
  url: 'https://medikto.health',
  description: 'Patient-centric medication adherence and vitals tracking application for patients and family caregivers.',
  publisher: {
    '@type': 'Organization',
    name: 'Medikto Health Technologies Inc.',
    logo: 'https://medikto.health/images/medikto_logo.png',
  },
  medicalAudience: ['Patient', 'Caregiver', 'Senior'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <link rel="icon" type="image/png" href="/images/medikto_icon.png" />
        <link rel="shortcut icon" href="/images/medikto_icon.png" />
        <link rel="apple-touch-icon" href="/images/medikto_icon.png" />
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
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="antialiased font-sans text-slate-900 bg-[#f8f9ff] selection:bg-cyan-500 selection:text-white">
        {children}
      </body>
    </html>
  );
}
