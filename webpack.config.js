const webpack = require('webpack');
const path = require('path');

const isProduction = process.env.NODE_ENV === 'production';
const isDevelopment = !isProduction;

module.exports = {
  mode: isProduction ? 'production' : 'development',
  bail: isProduction,
  context: __dirname,
  entry: {
    test: "./examples/example.js",
  },
  output: {
    path: path.join(__dirname, "dist"),
    filename: "bundle.js",
    sourceMapFilename: "[file].map",
    library: 'ReactResizable',
    libraryTarget: 'umd'
  },
  target: 'web', // Work around https://github.com/webpack/webpack-dev-server/issues/2758
  externals: {
    'react': {
      'commonjs': 'react',
      'commonjs2': 'react',
      'amd': 'react',
      // React dep should be available as window.React, not window.react
      'root': 'React'
    },
    'react-dom': {
      'commonjs': 'react-dom',
      'commonjs2': 'react-dom',
      'amd': 'react-dom',
      'root': 'ReactDOM'
    }
  },
  module: {
    rules: [
      {test: /\.jsx?$/, exclude: /node_modules/, loader: 'babel-loader', options: {cacheDirectory: true}},
    ]
  },
  resolve: {
    extensions: [".js"]
  },
  devServer: {
    contentBase: path.join(__dirname, 'examples'),
    compress: true,
    port: 4003,
    hot: true,
  },
  plugins: [
    // Scope hoisting
    new webpack.optimize.ModuleConcatenationPlugin(),
  ]
};
