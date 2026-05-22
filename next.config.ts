import path from "node:path";
import type { NextConfig } from "next";

const projectRoot = path.resolve(import.meta.dirname);

const nextConfig: NextConfig = {
  output: "standalone",
  devIndicators: false,
  turbopack: {
    root: projectRoot,
  },
};

export default nextConfig;
