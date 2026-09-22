module.exports = function babelConfig(api) {
  const isTest = api.env('test') || process.env.BABEL_ENV === 'test';

  return {
    presets: [
      ...(isTest ? ['babel-preset-expo'] : ['babel-preset-expo']),
      ...(isTest ? [] : ['nativewind/babel']),
    ],
    plugins: [
      [
        'module-resolver',
        {
          root: ['./src'],
          extensions: ['.ios.js', '.android.js', '.js', '.ts', '.tsx', '.json'],
          alias: {
            '@components': './src/components',
            '@screens': './src/features',
            '@hooks': './src/hooks',
            '@utils': './src/utils',
            '@services': './src/services',
            '@store': './src/store',
            '@assets': './src/assets',
            '@app-types': './src/types',
            '@constants': './src/constants',
            '@api': './src/api',
            '@features': './src/features',
            '@navigation': './src/navigation',
            '@theme': './src/theme',
            '@app': './src',
          },
        },
      ],
      ...(isTest ? [] : ['react-native-reanimated/plugin']),
    ],
  };
};
