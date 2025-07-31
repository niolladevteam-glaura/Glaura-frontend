import nextPWA from 'next-pwa';

/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // Add any other Next.js config here if needed
};

export default nextPWA({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development', // Enable PWA only in production
})(nextConfig);