const webpack = require('webpack');
const path = require('path');

module.exports = {
  context: __dirname,
  entry: {
    test: "./test/test.js",
  },
  output: {
    path: path.join(__dirname, "dist"),
    filename: "bundle.js",
    sourceMapFilename: "[file].map",
  },
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
    },
  },
  module: {
    loaders: [
      {test: /\.jsx?$/, exclude: /node_modules/, loader: 'babel-loader?cacheDirectory=true'},
    ]
  },
  resolve: {
    extensions: [".js"]
  },
};
