import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ['@formatjs/intl-localematcher'],
  experimental: {
    serverActions: {
      allowedOrigins: ['unvocable-kandi-thermophosphorescent.ngrok-free.dev', 'localhost:3000']
    }
  }
};

export default nextConfig;
