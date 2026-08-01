import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    // 讓 Vercel 在 Build 時忽略 ESLint 錯誤
    ignoreDuringBuilds: true,
  },
  typescript: {
    // 忽略 TypeScript 型別檢查錯誤
    ignoreBuildErrors: true,
  },
};

export default nextConfig;