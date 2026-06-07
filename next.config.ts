import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Hide the on-screen Next.js dev indicator (the "N" button in the corner).
  devIndicators: false,
  outputFileTracingExcludes: {
    "/api/**/*": [
      "./app/**/*",
      "./lib/**/*",
      "./worker/**/*",
      "./*.md",
      "./*.mjs",
      "./*.ts",
      "./next-env.d.ts",
      "./package-lock.json",
      "./postcss.config.mjs",
      "./tsconfig.json",
      "./tsconfig.tsbuildinfo",
    ],
  },
};

export default nextConfig;
