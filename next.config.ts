import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {protocol: 'https', hostname: 'cdn.jsdelivr.net', pathname: '/**'},
      {protocol: 'https', hostname: 'unpkg.com', pathname: '/**'},
      {protocol: 'https', hostname: 'selfh.st', pathname: '/**'},
      {
        protocol: 'https',
        hostname: 'raw.githubusercontent.com',
        pathname: '/**',
      },
    ],
  },
  experimental: {
    serverMinification: false,
  },

  serverExternalPackages: ['dockerode'],
};

export default nextConfig;
