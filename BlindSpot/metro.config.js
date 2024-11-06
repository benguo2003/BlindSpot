const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

module.exports = {
  ...config,
  resolver: {
    ...config.resolver,
    assetExts: [...config.resolver.assetExts],
    sourceExts: [...config.resolver.sourceExts, 'env']  // Add 'env' here while preserving default config
  },
};