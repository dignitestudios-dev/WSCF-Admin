import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  images:
  {
    domains: ["images.unsplash.com", "wscf-storage-bucket.s3.us-east-1.amazonaws.com","wscf-storage-bucket.s3.us-east-2.amazonaws.com"],
  }
};

export default nextConfig;
