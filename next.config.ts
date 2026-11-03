import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // The home page is the static Merge Log (public/merge-log.html); the writing pages stay as Next routes.
  async rewrites() {
    return {
      beforeFiles: [{ source: "/", destination: "/merge-log.html" }],
      afterFiles: [],
      fallback: [],
    };
  },
};

export default nextConfig;
