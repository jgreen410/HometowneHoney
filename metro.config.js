const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

const config = getDefaultConfig(__dirname);

// Exclude react-native-maps from web bundle
const { resolver } = config;
resolver.platforms = resolver.platforms || {};
config.resolver = {
  ...resolver,
  // For web platform, use a stub for react-native-maps
  extraNodeModules: {
    ...(resolver.extraNodeModules || {}),
  },
};

module.exports = withNativeWind(config, { input: "./global.css" });
