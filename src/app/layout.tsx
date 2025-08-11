import type {Metadata} from 'next';
import './globals.css';
import EditModeToggle from '@/components/EditModeToggle';
import {Inter} from 'next/font/google';

const inter = Inter({subsets: ['latin']});

export const metadata: Metadata = {
  title: 'oneDashboard',
  description: 'Self-hosted home dashboard',
};

export default function RootLayout({
  children,
}: Readonly<{children: React.ReactNode}>) {
  return (
    <html lang='en'>
      <body
        className={`min-h-screen bg-background text-foreground antialiased ${inter.className}`}
      >
        <EditModeToggle />
        {children}
      </body>
    </html>
  );
}
