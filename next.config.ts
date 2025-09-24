import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  trailingSlash: true,
  skipTrailingSlashRedirect: true,
  distDir: 'dist',
  images: {
    unoptimized: true,
  },
  assetPrefix: process.env.NODE_ENV === 'production' ? './' : '',
  // Configure webpack to change _next to next-static
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.output.publicPath = './next-static/';
    }
    return config;
  },
};

export default nextConfig;
