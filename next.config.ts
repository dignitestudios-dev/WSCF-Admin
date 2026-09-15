import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "wscf-storage-bucket.s3.us-east-1.amazonaws.com",
      },
      {
        protocol: "https",
        hostname: "wscf-storage-bucket.s3.us-east-2.amazonaws.com",
      },
    ],
  },
};

export default nextConfig;
