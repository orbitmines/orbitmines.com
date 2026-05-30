const path = require('path');
const webpack = require('webpack');

const isProd = process.env.NODE_ENV === 'production';
const BP_LOCAL = path.resolve(__dirname, 'src/lib/blueprintjs');

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
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.plugins.push(new webpack.ProvidePlugin({ Buffer: ['buffer', 'Buffer'] }));
      config.resolve.fallback = {
        ...(config.resolve.fallback || {}),
        buffer: require.resolve('buffer/'),
      };
    }

    config.experiments = {
      ...(config.experiments || {}),
      asyncWebAssembly: false,
      syncWebAssembly: true,
      topLevelAwait: true,
    };
    config.resolve.extensions.push('.wasm');

    // Vendored Blueprint: redirect all @blueprintjs/* imports at the bundler
    // level so node_modules copies are never loaded (tsconfig paths don't
    // cover non-JS assets like the .ttf imports).
    config.resolve.alias = {
      ...(config.resolve.alias || {}),
      '@blueprintjs/core/src/common': path.join(BP_LOCAL, 'common'),
      '@blueprintjs/core/src/hooks/hotkeys/hotkeyConfig': path.join(BP_LOCAL, 'hooks/hotkeys/hotkeyConfig'),
      '@blueprintjs/icons/src/generated/16px/blueprint-icons-16.ttf': path.join(BP_LOCAL, 'css/blueprint-icons-16.ttf'),
      '@blueprintjs/icons/src/generated/20px/blueprint-icons-20.ttf': path.join(BP_LOCAL, 'css/blueprint-icons-20.ttf'),
      '@blueprintjs/core$': BP_LOCAL,
      '@blueprintjs/icons$': BP_LOCAL,
      'react-router-dom$': path.resolve(__dirname, 'src/router'),
    };

    config.module.rules.push({
      test: /\.(png|jpe?g|gif|svg|ico|webp|avif|bmp|tiff?|ttf|eot|woff|woff2|otf)$/i,
      type: 'asset/resource',
      generator: { filename: 'static/media/[name].[hash:8][ext]' },
    });

    return config;
  },
};

module.exports = nextConfig;
