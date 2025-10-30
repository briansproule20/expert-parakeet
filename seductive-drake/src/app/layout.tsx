import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Seductive Drake Generator',
  description: 'Add Drake to any image. Upload your photo and watch the magic happen.',
  icons: {
    icon: [
      { url: '/drake-favicon.png', type: 'image/png' },
    ],
    shortcut: '/drake-favicon.png',
    apple: '/drake-favicon.png',
  },
  openGraph: {
    title: 'Seductive Drake Generator',
    description: 'Add Drake to any image. Upload your photo and watch the magic happen.',
    images: [
      {
        url: '/drake-favicon.png',
        width: 512,
        height: 512,
        alt: 'Seductive Drake Generator',
      },
    ],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Seductive Drake Generator',
    description: 'Add Drake to any image. Upload your photo and watch the magic happen.',
    images: ['/drake-favicon.png'],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased h-full`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
