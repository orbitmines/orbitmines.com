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
  // `@orbitmines/physics` ships its TypeScript source rather than a build — the package
  // has no dependencies and no build step, which is the point of it — so Next has to
  // compile it the way it compiles this repository's own files.
  transpilePackages: ['@orbitmines/physics'],

  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },

  // Vendored Blueprint + react-router-dom shim. Turbopack handles asset
  // imports (png/jpg/ttf/woff/...) natively and auto-polyfills Node built-ins
  // for browser bundles, so the old webpack rules for those are no longer
  // needed.
  turbopack: {
    // `@orbitmines/physics` is a `file:` dependency during development, so
    // node_modules/@orbitmines/physics is a symlink pointing at ../../physics —
    // out of this directory. Turbopack refuses to follow a symlink outside its
    // filesystem root, so the root is the folder holding BOTH repositories.
    // Without this the package does not resolve at all, in dev or in build.
    root: '../..',

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
