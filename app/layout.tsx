import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Investor.gov | Check Out Your Investment Professional',
  icons: {
    icon: { url: '/logo.png', type: 'image/png' },
    shortcut: '/logo.png',
    apple: '/logo.png',
  },
  description:
    'Check an investment professional’s background, registration, and disciplinary history.',
  openGraph: {
    title: 'Investor.gov | Check Out Your Investment Professional',
    description:
      'Check an investment professional’s background, registration, and disciplinary history.',
    images: [{ url: '/og.png', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Investor.gov | Check Out Your Investment Professional',
    description:
      'Check an investment professional’s background, registration, and disciplinary history.',
    images: ['/og.png'],
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
