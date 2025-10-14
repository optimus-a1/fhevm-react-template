/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: false, // ✅ 强制关闭 App Router，启用 pages 模式
  },
};

module.exports = nextConfig;
