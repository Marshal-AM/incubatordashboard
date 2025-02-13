/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['cummaimages.s3.eu-north-1.amazonaws.com'],
  },
  typescript: {
    ignoreBuildErrors: true, // Ignore TypeScript errors during build
  },
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },
}

module.exports = nextConfig
