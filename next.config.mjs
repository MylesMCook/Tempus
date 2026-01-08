/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable strict ESLint checking during builds
  eslint: {
    ignoreDuringBuilds: false,
    dirs: ["app", "components", "hooks", "lib"],
  },

  // Enable TypeScript type checking during builds
  typescript: {
    ignoreBuildErrors: false,
  },

  // Image optimization settings
  images: {
    unoptimized: true,
  },

  // Performance optimizations
  reactStrictMode: true,
  poweredByHeader: false,

  // Experimental features
  experimental: {
    typedRoutes: true,
  },
};

export default nextConfig;