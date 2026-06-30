/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'img.youtube.com' },
      { protocol: 'https', hostname: '**.youtube.com' },
      { protocol: 'http',  hostname: 'localhost' },
      { protocol: 'https', hostname: '**.hostinger.com' },
      { protocol: 'https', hostname: '**' },  // allow any https domain for thumbnails
    ],
  },
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
  },
};

module.exports = nextConfig;
