const path = require('path');

module.exports = {
  entry: './src/index.jsx',
  output: {
    path: path.resolve(__dirname, 'public/dist'), // <- carpeta dentro de public
    filename: 'bundle.js', // <- nombre del archivo final
    clean: true, // limpia public/dist antes de generar
  },
  resolve: {
    extensions: ['.js', '.jsx'],
  },
  module: {
    rules: [
      { test: /\.(js|jsx)$/, exclude: /node_modules/, use: 'babel-loader' },
      { test: /\.css$/i, use: ['style-loader', 'css-loader'] },
      { test: /\.(png|svg|jpg|jpeg|gif)$/i, type: 'asset/resource' },
    ],
  },
  devServer: {
    static: path.join(__dirname, 'public'),
    port: 3000,
    hot: true,
    open: true,
  },
};
