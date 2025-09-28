// webpack.embed.config.js
const path = require('path');
const TerserPlugin = require('terser-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const webpack = require('webpack');

const isProd = process.env.NODE_ENV === 'production';

module.exports = {
  mode: isProd ? 'production' : 'development',

  // Entrada: el archivo que registra tu webcomponent
  entry: {
    'mplayer.embed': path.resolve(
      __dirname,
      'src/components/mplayer-normal.ts'
    ),
  },

  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].js', // -> dist/mplayer.embed.js
    // Envuelve el bundle en un IIFE (auto-ejecutable) utilizable como script embed
    iife: true,
    // No queremos que webpack defina exports complicados; leave global := undefined
    // Opcional: exponer algo en window si tu código exporta; por defecto no hace falta
    // library: { name: 'MPlayerEmbed', type: 'window' },
    globalObject: 'this',
    clean: false, // usamos CleanWebpackPlugin en plugins
  },

  devtool: isProd ? 'source-map' : 'eval-source-map',

  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.json'],
    // si tenés alias: agrega aquí
    alias: {
      // example: '@': path.resolve(__dirname, 'src'),
    },
  },

  module: {
    rules: [
      // Typescript
      {
        test: /\.tsx?$/,
        loader: 'ts-loader',
        options: {
          transpileOnly: false, // true para acelerar (pero perder checks)
          configFile: path.resolve(__dirname, 'tsconfig.json'),
        },
        exclude: /node_modules/,
      },

      // CSS (si tu componente importa .css)
      {
        test: /\.css$/i,
        use: [
          'style-loader', // inyecta <style> en runtime (ideal para embed bundle)
          {
            loader: 'css-loader',
            options: { importLoaders: 1 },
          },
          {
            loader: 'postcss-loader',
            options: {
              postcssOptions: {
                plugins: [require('autoprefixer')],
              },
            },
          },
        ],
      },

      // Assets (SVG/PNG/woff ...): copiarlos a /dist y devolver URL
      {
        test: /\.(png|jpe?g|gif|svg|webp|woff2?|ttf|eot)$/i,
        type: 'asset/resource',
        generator: {
          filename: 'assets/[name][hash:6][ext]',
        },
      },
    ],
  },

  optimization: {
    minimize: isProd,
    minimizer: [
      new TerserPlugin({
        terserOptions: {
          format: { comments: false },
          compress: { drop_console: true },
        },
        extractComments: false,
      }),
    ],
  },

  plugins: [
    new CleanWebpackPlugin({ cleanOnceBeforeBuildPatterns: ['dist'] }),
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify(
        process.env.NODE_ENV || (isProd ? 'production' : 'development')
      ),
    }),
  ],

  // Opcional: config para webpack-dev-server si querés probar localmente
  devServer: {
    static: { directory: path.join(__dirname, 'dist') },
    compress: true,
    port: 3000,
    hot: true,
  },

  performance: { hints: false },
};
