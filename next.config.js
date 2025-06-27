/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  eslint: {
    // Allow build to complete with ESLint warnings
    ignoreDuringBuilds: true,
  },
}

module.exports = nextConfig