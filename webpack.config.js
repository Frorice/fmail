module.exports = {
  entry: __dirname+"/src/app.js",
  output: {
    path: __dirname+"/public/js",
    filename: "bundle.js"
  },
  module: {
    loaders: [
      {
        test: /\.js?$/,
        loader: 'babel-loader',
        exclude: /node_modules/,
        query: {
          presets: ['es2015', 'react']
        }
      }
    ]
  },
  devtool: 'source-map',
  watch: true
}