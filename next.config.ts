import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: ["productrename.vercel.app", "localhost", "res.cloudinary.com"], // Allow images from localhost
  },
};

export default nextConfig;
