import type { Metadata, Viewport } from 'next';
import '../src/lib/blueprintjs/css/blueprint.css';
import '../src/lib/blueprintjs/css/blueprint-icons.css';
import '../src/lib/index.scss';
import Providers from './Providers';

export const metadata: Metadata = {
  title: 'OrbitMines Research',
  description:
    'Once a Minecraft server, now the building of a world where engineering, science, education are all an exploratory videogame.',
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
