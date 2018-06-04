const HtmlWebpackPlugin = require('html-webpack-plugin')
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin

module.exports = {
  entry: './src/index.jsx',
  output: {
    publicPath: '/',
    filename: 'bundle.js',
    path: __dirname + '/client'
  },
  resolve: {
      extensions: ['.jsx', '.js'],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: __dirname + '/src/index.html',
      filename: 'index.html'
    }),
    // new BundleAnalyzerPlugin() // 分析包大小
  ],
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