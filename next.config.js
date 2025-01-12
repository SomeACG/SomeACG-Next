/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.cosine.ren',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '*.twimg.com',
        pathname: '/**',
      },
    ],
  },
};

module.exports = nextConfig;
