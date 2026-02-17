/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    serverComponentsExternalPackages: ['@google/generative-ai'],
  },
  // Disable static page generation for API routes
  generateBuildId: async () => {
    return 'build-' + Date.now()
  },
}

module.exports = nextConfig
