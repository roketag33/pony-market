const path = require('path');
const nodeExternals = require('webpack-node-externals');
const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin');

module.exports = function (options) {
  const isDevelopment = process.env.NODE_ENV !== 'production';

  return {
    ...options,
    mode: isDevelopment ? 'development' : 'production',
    entry: ['./src/main.ts'],
    target: 'node',
    externals: [nodeExternals()],
    module: {
      rules: [
        {
          test: /\.ts$/,
          use: {
            loader: 'ts-loader',
            options: {
              transpileOnly: isDevelopment,
            },
          },
          exclude: /node_modules/,
        },
      ],
    },
    resolve: {
      extensions: ['.ts', '.js'],
      plugins: [new TsconfigPathsPlugin()],
      alias: {
        '@': path.resolve(__dirname, 'src'),
      },
      // Ajout de la résolution des modules Prisma
      modules: ['node_modules'],
    },
  };
};
