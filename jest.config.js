module.exports = {
  preset: '@react-native/jest-preset',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  moduleNameMapper: {
    '^@components/(.*)$': '<rootDir>/src/components/$1',
    '^@screens/(.*)$': '<rootDir>/src/features/$1',
    '^@hooks/(.*)$': '<rootDir>/src/hooks/$1',
    '^@utils/(.*)$': '<rootDir>/src/utils/$1',
    '^@services/(.*)$': '<rootDir>/src/services/$1',
    '^@store/(.*)$': '<rootDir>/src/store/$1',
    '^@assets/(.*)$': '<rootDir>/src/assets/$1',
    '^@app-types/(.*)$': '<rootDir>/src/types/$1',
    '^@constants/(.*)$': '<rootDir>/src/constants/$1',
    '^@api/(.*)$': '<rootDir>/src/api/$1',
    '^@features/(.*)$': '<rootDir>/src/features/$1',
    '^@navigation/(.*)$': '<rootDir>/src/navigation/$1',
    '^@theme/(.*)$': '<rootDir>/src/theme/$1',
    '^@app/(.*)$': '<rootDir>/src/$1',
    '\\.(css)$': '<rootDir>/__mocks__/styleMock.js',
    '\\.(ttf|otf|png|jpg|jpeg)$': '<rootDir>/__mocks__/fontStub.js',
  },
  // Several suites mount the full business tab navigator, which legitimately
  // takes a few seconds. Without this the default 5s cap turns a slow parallel
  // run into a spurious timeout failure.
  testTimeout: 20000,
  // Jest's default matches everything under __tests__, so shared helpers and
  // fixtures would be collected as empty suites.
  testPathIgnorePatterns: [
    '/node_modules/',
    '<rootDir>/__tests__/helpers/',
    // Scratch/debug tests — see .gitignore.
    '/zz_',
    '/zz-',
    '/scratch-',
  ],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  transformIgnorePatterns: [
    'node_modules/(?!(react-native|@react-native|react-native-.*|@react-navigation|nativewind|react-native-css-interop|@tanstack|zustand|@expo-google-fonts|@expo/vector-icons|expo|expo-.*|expo-modules-core)/)',
  ],
  collectCoverageFrom: ['src/**/*.{ts,tsx}', '!src/**/*.d.ts', '!src/**/index.ts'],
};
