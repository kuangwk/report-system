const HtmlWebpackPlugin = require('html-webpack-plugin')

module.exports = {
  mode: 'development', // development | production
  entry: './src/index.jsx',
  output: {
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
    })
  ],
  module: {
    rules: [{
      test: /\.jsx$/,
      exclude: /node_modules/,
      use: [
        'babel-loader'
      ]
    }, {
      test: /\.css$/,
      use: [
        'style-loader',
        'css-loader'
      ]
    }]
  }
}