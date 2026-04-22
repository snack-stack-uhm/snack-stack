/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ['.prisma/client', '@prisma/adapter-pg', '@prisma/client', 'pg', 'prisma'],
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'plus.unsplash.com' },
    ],
  },
};

export default nextConfig;
