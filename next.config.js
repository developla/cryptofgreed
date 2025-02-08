/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: { unoptimized: true },
  experimental: {
    // This allows dynamic usage in API routes
    allowedRevalidateHeaderKeys: ['x-wallet-address'],
  },
};

module.exports = nextConfig;
