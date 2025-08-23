const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

const config = getDefaultConfig(__dirname);

// Adicionar alias para resolver os imports @
config.resolver.alias = {
  '@': './src',
  '@/components': './src/components',
  '@/assets': './src/assets',
  '@/hooks': './src/hooks',
  '@/store': './src/store',
  '@/utils': './src/utils',
  '@/types': './src/types',
};

module.exports = withNativeWind(config, {
  input: "./global.css",
  inlineRem: 16,
});