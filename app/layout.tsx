import type { Metadata } from 'next';
import { Geist, Geist_Mono, DM_Mono, Work_Sans } from 'next/font/google';
import './globals.css';
import { Toaster } from '@/components/ui/sonner';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'E commerce',
  description: 'Shop exclusively',
};

export const dmMono = DM_Mono({
  variable: '--font-dm-mono',
  subsets: ['latin'],
  weight: ['300', '400', '500'],
});

export const workSans = Work_Sans({
  variable: '--font-work-sans',
  subsets: ['latin'],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang='en'>
      <body className={` ${workSans.variable} ${geistSans.variable} ${geistMono.variable} ${dmMono.variable} antialiased`}>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
