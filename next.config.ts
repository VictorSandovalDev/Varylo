import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      allowedOrigins: ['unvocable-kandi-thermophosphorescent.ngrok-free.dev', 'localhost:3000']
    }
  }
};

export default nextConfig;
