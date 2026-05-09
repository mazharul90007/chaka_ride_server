const path = require('path');
const nodeExternals = require('webpack-node-externals');

module.exports = function (options) {
  return {
    ...options,
    output: {
      ...options.output,
      libraryTarget: 'commonjs',
    },
    externals: [
      nodeExternals({
        allowlist: [
          /^better-/, 
          /^@better-/, 
          /^@noble/, 
          /^jose/, 
          /^rou3/, 
          /^nanoid/
        ],
      }),
    ],
  };
};
