const webpack = require('webpack');
const path = require('path');
const {execFileSync} = require('child_process');
const pkg = require('./package.json');

const isProduction = process.env.NODE_ENV === 'production';

// Get git info for version display
function getGitInfo() {
  try {
    const commitHash = execFileSync('git', ['rev-parse', '--short', 'HEAD']).toString().trim();
    let tag = '';
    try {
      tag = execFileSync('git', ['describe', '--tags', '--abbrev=0']).toString().trim();
    } catch (e) {
      // No tags found
    }
    return {commitHash, tag};
  } catch (e) {
    return {commitHash: 'unknown', tag: ''};
  }
}
const gitInfo = getGitInfo();
const isDevelopment = !isProduction;

module.exports = {
  mode: isProduction ? 'production' : 'development',
  bail: isProduction,
  context: __dirname,
  entry: {
    test: "./examples/example.js",
  },
  output: {
    path: path.join(__dirname, "examples"),
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
    static: path.join(__dirname, 'examples'),
    compress: true,
    port: 4003,
    hot: true,
  },
  plugins: [
    // Scope hoisting
    new webpack.optimize.ModuleConcatenationPlugin(),
    // Inject version info
    new webpack.DefinePlugin({
      __VERSION__: JSON.stringify(pkg.version),
      __GIT_TAG__: JSON.stringify(gitInfo.tag),
      __GIT_COMMIT__: JSON.stringify(gitInfo.commitHash),
    }),
  ]
};
