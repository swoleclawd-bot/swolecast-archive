import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // better-sqlite3 is a native module — exclude it from webpack bundling
  serverExternalPackages: ['better-sqlite3'],
  output: 'standalone',
};

export default nextConfig;
