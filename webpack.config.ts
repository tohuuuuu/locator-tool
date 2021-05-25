/* eslint-env node */
import webpack from 'webpack';
import path from 'path';
import {execSync} from 'child_process';

import HtmlWebpackPlugin from 'html-webpack-plugin';
import CleanWebpackPlugin from 'clean-webpack-plugin';
import CompressionPlugin from 'compression-webpack-plugin';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';

const productionBuild = process.env.npm_lifecycle_script !== 'webpack-dev-server';

const config: webpack.Configuration = {
  mode: productionBuild ? 'production' : 'development',
  entry: ['./app/index', './app/vendor', './app/vendor-leaflet'],
  output: {
    path: productionBuild ? path.join(__dirname, 'dist') : undefined,
    filename: '[name].[chunkhash].js',
    sourceMapFilename: '[name].[chunkhash].map'
  },
  optimization: {
    splitChunks: {chunks: 'all'}
  },
  performance: {
    hints: false
  },
  resolve: {
    extensions: ['.ts', '.js'],
    alias: {
      '@': __dirname
    }
  },
  module: {
    rules: [
      {
        test: /\.ts/,
        loader: 'ts-loader',
        exclude: /node_modules/
      },
      {
        test: /\.html$/,
        loader: ['html-loader?exportAsEs6Default=true']
      },
      {
        test: /\.css$/,
        use: [MiniCssExtractPlugin.loader, 'css-loader']
      },
      {
        test: /sprite.octicons.svg$/,
        loader: 'raw-loader'
      },
      {
        test: /\.(png|jpg|gif|svg|eot|ttf|woff|woff2)$/,
        exclude: /sprite.octicons.svg$/,
        loader: 'url-loader',
        options: {
          limit: 10000
        }
      }
    ]
  },
  plugins: [
    productionBuild ? new CleanWebpackPlugin(['./dist']) : undefined,
    new MiniCssExtractPlugin({
      filename: '[name].[contenthash].css'
    }),
    new HtmlWebpackPlugin({
      template: './app/index.html',
      favicon: './app/locator-tool.svg',
      inject: 'body'
    }),
    new webpack.DefinePlugin({
      __BUILD_DATE__: JSON.stringify(
        parseInt(execSync('git log -1 --format=%cd --date=unix', {encoding: 'utf8'}).trim()) * 1000
      ),
      __BUILD_VERSION__: JSON.stringify(
        execSync('git describe --always', {encoding: 'utf8'}).trim()
      )
    }),
    productionBuild ? new CompressionPlugin() : undefined
  ].filter(plugin => !!plugin),
  devtool: productionBuild ? 'source-map' : 'cheap-module-eval-source-map',
  devServer: {
    port: 8184
  }
};

export default config;
