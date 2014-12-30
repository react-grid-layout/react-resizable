module.exports = {
    context: __dirname,
    entry: [
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
      ]
    },
    resolve: {
      extensions: ["", ".webpack.js", ".web.js", ".js", ".jsx"]
    }
};
