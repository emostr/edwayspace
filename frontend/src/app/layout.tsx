import type { Metadata, Viewport } from 'next';
import '@/styles/globals.css';
import { AuthProvider } from '@/context/AuthContext';
import { ToastProvider } from '@/context/ToastContext';
import { ServiceWorkerRegistration } from '@/components/ServiceWorkerRegistration/ServiceWorkerRegistration';

export const metadata: Metadata = {
  title: {
    default: 'edway.space — школьная платформа',
    template: '%s — edway.space',
  },
  description: 'Единое школьное пространство для учеников, учителей и администрации',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'edway.space',
  },
  icons: {
    icon: '/favicon.svg',
    apple: '/icons/icon-192.png',
  },
  openGraph: {
    title: 'edway.space — школьная платформа',
    description: 'Единое школьное пространство для учеников, учителей и администрации',
    url: 'https://app.edway.space',
    siteName: 'edway.space',
    locale: 'ru_RU',
    type: 'website',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#0078d4',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru">
      <body>
        <AuthProvider>
          <ToastProvider>{children}</ToastProvider>
        </AuthProvider>
        <ServiceWorkerRegistration />
      </body>
    </html>
  );
}
