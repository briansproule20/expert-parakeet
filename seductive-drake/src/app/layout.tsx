import type { Metadata } from 'next';
import { Playfair_Display, Inter, Bebas_Neue } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';

const playfair = Playfair_Display({
  variable: '--font-playfair',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800', '900'],
  style: ['normal', 'italic'],
});

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
});

const bebas = Bebas_Neue({
  variable: '--font-bebas',
  subsets: ['latin'],
  weight: ['400'],
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
        className={`${playfair.variable} ${inter.variable} ${bebas.variable} antialiased h-full`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
