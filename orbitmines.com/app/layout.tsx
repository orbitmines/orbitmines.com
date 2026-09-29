import type { Metadata, Viewport } from 'next';
import '../src/lib/blueprintjs/css/blueprint.css';
import '../src/lib/blueprintjs/css/blueprint-icons.css';
import '../src/lib/index.scss';
import Providers from './Providers';

export const metadata: Metadata = {
  // Per-page <meta name="description"> is rendered by each page's content
  // (Post/Minimap/profile) so it can be section/paper-specific; no global
  // default here, which would otherwise duplicate or override those.
  title: 'OrbitMines Research',
  manifest: '/manifest.json',
  icons: {
    icon: [{ url: '/favicon.png', type: 'image/png', sizes: '64x64' }],
    apple: '/logo192.png',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#000000',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <noscript>You need to enable JavaScript to run this app.</noscript>
        <div id="root">
          <Providers>{children}</Providers>
        </div>
      </body>
    </html>
  );
}
