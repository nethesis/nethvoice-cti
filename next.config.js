/** @type {import('next').NextConfig} */

const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  output: 'standalone',
  webpack: (config, { webpack }) => {
    // Check the janus configuration for modules here: https://janus.conf.meetecho.com/docs/js-modules.html
    config.plugins.push(new webpack.ProvidePlugin({ adapter: ['webrtc-adapter', 'default'] }))
    config.module.rules.push({
      test: require.resolve('janus-gateway'),
      loader: 'exports-loader',
      options: {
        exports: 'Janus',
      },
    })
    // Return config
    return config
  }
}

module.exports = nextConfig
