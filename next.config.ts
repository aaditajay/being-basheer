import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ['192.168.1.8', 'localhost:3000'],
  experimental: {
    viewTransition: true,
  },
};

export default nextConfig;
