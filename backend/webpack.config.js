const path = require('path');
const nodeExternals = require('webpack-node-externals');
const { sentryWebpackPlugin } = require("@sentry/webpack-plugin");

module.exports = function(options) {
  return {
    ...options,
    entry: ['./src/main.ts'],
    target: 'node',
    externals: [nodeExternals()],
    module: {
      rules: [
        {
          test: /\.ts$/,
          loader: 'ts-loader',
          exclude: /node_modules/,
        },
      ],
    },
    resolve: {
      extensions: ['.ts', '.js'],
    },
    output: {
      path: path.resolve(__dirname, 'dist'),
      filename: 'main.js',
    },
    devtool: "source-map",
    plugins: [
      sentryWebpackPlugin({
        authToken: process.env.SENTRY_AUTH_TOKEN,
        org: "poney-market",
        project: "node-nestjs",
        include: './dist',
        ignore: ['node_modules', 'webpack.config.js'],
        configFile: 'sentry.properties',
        release: {
          name: process.env.npm_package_version || '1.0.0'
        }
      })
    ],
  };
};