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
    unoptimized: false, // https://stackoverflow.com/questions/77772240/http-get-image-402-payment-required
  },
};

module.exports = nextConfig;
