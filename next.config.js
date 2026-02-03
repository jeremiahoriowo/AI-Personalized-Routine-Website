/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    serverComponentsExternalPackages: ['openai'],
  },
  // Disable static page generation for API routes
  generateBuildId: async () => {
    return 'build-' + Date.now()
  },
}

module.exports = nextConfig
