const withNextIntl = require('next-intl/plugin')(
  './i18n/request.js'
);

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['localhost'],
  },
  experimental: {
    serverComponentsExternalPackages: ['mongoose']
  }
};

module.exports = withNextIntl(nextConfig);
