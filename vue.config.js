const { WebpackManifestPlugin } = require('webpack-manifest-plugin')
const nodeExternals = require('webpack-node-externals')
const webpack = require('webpack')

module.exports = {
  chainWebpack: webpackConfig => {
    webpackConfig.module.rule('vue').uses.delete('cache-loader')
    webpackConfig.module.rule('js').uses.delete('cache-loader')
    webpackConfig.module.rule('ts').uses.delete('cache-loader')
    webpackConfig.module.rule('tsx').uses.delete('cache-loader')

    //console.log('process.env.SSR=',process.env.SSR)
    if (!process.env.SSR) {
      //console.log('ssr=', process.env.SSR)
      //console.log('1 webpackConfig=',webpackConfig)
      webpackConfig
        .entry('app')
        .clear()
        .add('./src/entry-client.js');
      webpackConfig
        .devServer
        .host("127.0.0.1")
        .port(3000)
        .open(true)
        .proxy({
            "/api": {
              target: "http://127.0.0.1:8000",
              changeOrigin: true,
              pathRewrite: {
                "/api": "/api"
              }
            },
            "/apidata": {
              target: "http://127.0.0.1:80",
              changeOrigin: true,
            },
            "/upload": {
              target: "http://127.0.0.1:8000",
              changeOrigin: true,
            },
        });     
      return
    }

    webpackConfig
      .entry('app')
      .clear()
      .add('./src/entry-server.js')

    webpackConfig.target('node')
    webpackConfig.output.libraryTarget('commonjs2')

    webpackConfig
      .plugin('manifest')
      .use(new WebpackManifestPlugin({ fileName: 'ssr-manifest.json' }))

    webpackConfig.externals(nodeExternals({ allowlist: /\.(css|vue|less)$/ }))

    webpackConfig.optimization.splitChunks(false).minimize(false)

    webpackConfig.plugins.delete('preload')
    webpackConfig.plugins.delete('prefetch')
    webpackConfig.plugins.delete('progress')
    webpackConfig.plugins.delete('friendly-errors')

    webpackConfig.plugin('limit').use(
      new webpack.optimize.LimitChunkCountPlugin({
        maxChunks: 1
      })
    )
  }
}
