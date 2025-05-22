const withNextIntl = require('next-intl/plugin')();

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['localhost'],
  },
  serverExternalPackages: ['mongoose']
};

module.exports = withNextIntl(nextConfig);
