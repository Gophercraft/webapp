const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  entry: './src/index.tsx',
  module: {
    rules: [
      // Load Typescript react files
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
      // Load HTML
      {
        test: /\.(html)$/,
        use: ['html-loader']
      },
      // Load stylesheets
      {
        test: /\.css$/i,
        use: [
          'style-loader',
          'css-loader'
        ],
      },
      // Copy images into static/img directory
      {
        test: /\.(png|svg|jpg|jpeg|gif)$/i,
        type: 'asset/resource',
        generator: {
          filename: 'static/img/[name]-[contenthash][ext][query]',
        },
      },
      // Copy font files into static/font directory
      {
        test: /\.(ttf|otf)$/i,
        type: 'asset/resource',
        generator: {
          filename: 'static/font/[name]-[contenthash][ext][query]',
        },
      }
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './src/index.html',
    })
  ],
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
  },
  devServer: {
    static: {
      directory: path.join(__dirname, 'public'),
    },
    client: {
      overlay: false,
    },
    proxy: [
      {
        context: ['/api'],
        target: 'http://localhost:32776',
      },
    ],
    compress: true,
    port: 9000,
  },
  output: {
    filename: 'static/js/[name]-[contenthash].js',
    path: path.resolve(__dirname, 'public'),
  },
};
