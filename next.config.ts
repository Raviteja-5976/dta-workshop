import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      // Allow cover-image uploads (multipart) up to ~5MB via server actions.
      bodySizeLimit: '5mb',
    },
  },
};

export default nextConfig;
