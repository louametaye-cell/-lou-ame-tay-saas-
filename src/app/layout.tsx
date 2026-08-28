import type { Metadata, Viewport } from 'next';
import './globals.css';
import { Toaster } from 'sonner';

export const metadata: Metadata = {
  title: 'Lou Ame Tay ? 🍽️ - Menu Digital & Commande à Table Sénégal',
  description:
    'Scannez le QR Code de votre table, découvrez le menu du jour "Lou Ame Tay ?" et commandez directement en cuisine sans attendre.',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Lou Ame Tay',
  },
  openGraph: {
    title: 'Lou Ame Tay ? 🍽️ - Menu Digital & Commande à Table',
    description: 'Le menu digital QR code ultra-rapide conçu pour les restaurants du Sénégal.',
    url: 'https://louametay.sn',
    siteName: 'Lou Ame Tay',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=1200&q=80',
        width: 1200,
        height: 630,
        alt: 'Lou Ame Tay Menu Digital Sénégal',
      },
    ],
    locale: 'fr_SN',
    type: 'website',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#F59E0B',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className="light scroll-smooth">
      <body className="antialiased selection:bg-amber-500 selection:text-white min-h-screen bg-[#F8FAFC] text-slate-900">
        {children}
        <Toaster position="top-center" richColors closeButton />
      </body>
    </html>
  );
}