/* eslint-disable no-param-reassign */
/* eslint-disable unicorn/prefer-module */
const webpack = require('webpack');

module.exports = {
  webpack: {
    configure: (config) => {
      const wasmExtensionRegExp = /\.wasm$/;
      config.resolve.extensions.push('.wasm');
      config.resolve.fallback = {
        ...config.resolve.fallback,
        buffer: require.resolve('buffer'),
        stream: require.resolve('stream'),
      };
      config.plugins = [
        ...config.plugins,
        new webpack.ProvidePlugin({
          Buffer: ['buffer', 'Buffer'],
        }),
      ];
      config.experiments = {
        syncWebAssembly: true,
        asyncWebAssembly: true,
      };

      for (const rule of config.module.rules) {
        for (const oneOf of (rule.oneOf || [])) {
          if (oneOf.type === 'asset/resource') {
            oneOf.exclude.push(wasmExtensionRegExp);
          }
        }
      }

      return config;
    },
  },
};
