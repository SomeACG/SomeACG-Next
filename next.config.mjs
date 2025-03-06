import createMDX from '@next/mdx';

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  pageExtensions: ['js', 'jsx', 'md', 'mdx', 'ts', 'tsx'],
  rewrites: async () => [
    {
      source: '/rss',
      destination: '/feed.xml',
    },
    {
      source: '/rss.xml',
      destination: '/feed.xml',
    },
    {
      source: '/feed',
      destination: '/feed.xml',
    },
  ],
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        hostname: '*',
      },
    ],
  },
};

const withMDX = createMDX({
  // Add markdown plugins here, as desired
});

// Merge MDX config with Next.js config
export default withMDX(nextConfig);
