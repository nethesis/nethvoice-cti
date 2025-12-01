/** @type {import('next').NextConfig} */

const nextConfig = {
  reactStrictMode: false,
  output: 'standalone',
  devIndicators: false,
  // Enable source maps in production for debugging
  productionBrowserSourceMaps: true,

  // Configure webpack to follow source maps from node_modules
  webpack: (config, { dev, isServer }) => {
    if (!isServer) {
      // Use source-map devtool to generate complete source maps
      config.devtool = 'source-map'

      // Add source-map-loader to process existing source maps from dependencies
      config.module.rules.push({
        test: /\.(js|mjs|jsx|ts|tsx)$/,
        enforce: 'pre',
        use: ['source-map-loader'],
        // Include phone-island to process its source maps
        include: [/node_modules\/@nethesis\/phone-island/],
      })
    }
    return config
  },
}

module.exports = nextConfig
