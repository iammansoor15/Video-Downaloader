import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
