import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'The Class Gazette',
  description: 'NFC-powered yearbook platform — tap any portrait to connect.',
  openGraph: {
    title: 'The Class Gazette',
    description: 'NFC-powered yearbook platform — tap any portrait to connect.',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen">{children}</body>
    </html>
  );
}
