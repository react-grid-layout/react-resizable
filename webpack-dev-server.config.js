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
  module: {
    rules: [
      {test: /\.jsx?$/, exclude: /node_modules/, loader: 'babel-loader?cacheDirectory=true'},
    ]
  },
  plugins: [
    new webpack.LoaderOptionsPlugin({
      debug: true
    })
  ],
  devtool: "eval",
  resolve: {
    extensions: [".js"]
  },
  devServer: {
    contentBase: __dirname,
    compress: true,
    port: 4003,
  }
};
