import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Static export for Cloudflare Pages (no Next server runtime).
  output: "export",
};

export default nextConfig;
