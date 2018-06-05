const HtmlWebpackPlugin = require('html-webpack-plugin')
const webpack = require('webpack')
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin
const CleanWebpackPlugin = require('clean-webpack-plugin')
const CopyWebpackPlugin = require('copy-webpack-plugin')

const process = require('process')

module.exports = function (env, argv) {
  const mode = argv.mode
  return {
    entry: './src/index.jsx',
    output: {
      publicPath: '/',
      filename: mode === 'production' ? '[name].[chunkhash].js' : '[name].js',
      path: __dirname + '/client'
    },
    resolve: {
        extensions: ['.jsx', '.js'],
    },
    plugins: [
      new CleanWebpackPlugin(['client']),
      new HtmlWebpackPlugin({
        template: __dirname + '/src/index.html',
        filename: 'index.html'
      }),
      new CopyWebpackPlugin([{from: 'src/assets/', to:'assets'}])
      // new BundleAnalyzerPlugin() // 分析包大小
    ],
    optimization: {
      splitChunks: {
        cacheGroups: {
          commons: {
            test: /[\\/]node_modules[\\/]/,
            name: "vendors",
            chunks: "all"
          }
        }
      }
    },
    module: {
      rules: [{
        test: /\.jsx$/,
        exclude: /node_modules/,
        use: [
          'babel-loader'
        ]
      }, {
        test: /\.less$/,
        use: [
          'style-loader',
          'css-loader',
          'less-loader' // compiles Less to CSS
        ]
      }, {
        test: /\.css$/,
        use: [
          'style-loader',
          'css-loader',
        ]
      }]
    }
  }
}