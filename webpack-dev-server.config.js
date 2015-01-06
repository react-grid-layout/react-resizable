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
        {test: /\.jsx?$/, exclude: /node_modules/, loader: '6to5-loader?experimental=true'},
        {test: /\.jsx$/, exclude: /node_modules/, loader: 'react-hot-loader'}
      ]
    },
    debug: true,
    devtool: "#inline-source-map",
    resolve: {
      extensions: ["", ".webpack.js", ".web.js", ".js", ".jsx"]
    }
};
