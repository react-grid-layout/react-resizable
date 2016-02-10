module.exports = {
    context: __dirname,
    entry: [
      "webpack-dev-server/client?http://localhost:4002",
      "webpack/hot/dev-server",
      "./test/test.js",
    ],
    output: {
        path: __dirname + "/dist",
        filename: "bundle.js",
        sourceMapFilename: "[file].map",
    },
    module: {
      loaders: [
        {test: /\.jsx?$/, exclude: /node_modules/, loader: 'babel-loader?cacheDirectory=true'}
      ]
    },
    debug: true,
    devtool: "eval",
    resolve: {
      extensions: ["", ".webpack.js", ".web.js", ".js", ".jsx"]
    }
};
