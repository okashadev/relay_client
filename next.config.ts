import type { NextConfig } from "next";

const backendUrl = process.env.SERVER_URL;

if (!backendUrl) {
  throw new Error("SERVER_URL is not defined");
}

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${backendUrl}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
