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
    // No `root` override. `@orbitmines/physics` used to be a symlink out of this
    // directory, which Turbopack will not follow, so the root had to be the folder
    // holding both repositories — 322GB across 17 repos, all of which Turbopack then
    // watched, until the dev server died with `RangeError: Map maximum size exceeded`
    // out of async_hooks. Next has no watch-ignore for Turbopack, so instead
    // `scripts/sync-physics.mjs` copies the package into node_modules as real files
    // and the watched tree is this repository alone. See that file.

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
