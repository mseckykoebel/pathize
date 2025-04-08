/* eslint-disable prettier/prettier */
module.exports = {
  presets: ['module:metro-react-native-babel-preset'],
  // https://docs.swmansion.com/react-native-reanimated/docs/fundamentals/installation/#babel-plugin
  plugins: [
    'react-native-reanimated/plugin',
  ],
  env: {
    production: {
      plugins: ['transform-remove-console'], // remove console log statements in production
    },
  },
};
