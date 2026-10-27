/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'img.gamebrain.co',
      },
      {
        protocol: 'https',
        hostname: '**.gamebrain.co',
      },
      {
        protocol: 'https',
        hostname: '**.akamai.steamstatic.com',
      },
      {
        protocol: 'https',
        hostname: 'via.placeholder.com',
      },
    ],
  },
};

export default nextConfig;
