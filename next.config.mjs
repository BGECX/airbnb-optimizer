import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./lib/i18n.ts');

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'standalone',
  images: {
    domains: [],
  },
  env: {
    API_BASE_URL: process.env.API_BASE_URL || 'http://localhost:8000',
  },
};

export default withNextIntl(nextConfig);
