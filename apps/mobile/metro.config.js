const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Configure public path for GitHub Pages
if (process.env.EXPO_PUBLIC_URL) {
  config.transformer = {
    ...config.transformer,
    publicPath: process.env.EXPO_PUBLIC_URL,
  };
}

module.exports = config;
