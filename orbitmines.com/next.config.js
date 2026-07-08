const isProd = process.env.NODE_ENV === 'production';
const BP_LOCAL = './src/lib/blueprintjs';

/** @type {import('next').NextConfig} */
const nextConfig = {
  ...(isProd ? { output: 'export', distDir: 'build' } : {}),
  allowedDevOrigins: ['127.0.0.1', 'localhost'],
  reactStrictMode: false,
  images: { unoptimized: true, disableStaticImages: true },
  trailingSlash: false,
  productionBrowserSourceMaps: true,
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },

  // Vendored Blueprint + react-router-dom shim. Turbopack handles asset
  // imports (png/jpg/ttf/woff/...) natively and auto-polyfills Node built-ins
  // for browser bundles, so the old webpack rules for those are no longer
  // needed.
  turbopack: {
    resolveAlias: {
      '@blueprintjs/core': BP_LOCAL,
      '@blueprintjs/core/src/common': `${BP_LOCAL}/common`,
      '@blueprintjs/core/src/hooks/hotkeys/hotkeyConfig': `${BP_LOCAL}/hooks/hotkeys/hotkeyConfig`,
      '@blueprintjs/icons': BP_LOCAL,
      'react-router-dom': './src/router',
    },
  },
};

module.exports = nextConfig;
