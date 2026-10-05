module.exports = {
  root: true,
  extends: ['airbnb', 'airbnb/hooks', '@react-native', 'prettier'],
  parserOptions: {
    project: './tsconfig.json',
    tsconfigRootDir: __dirname,
  },
  rules: {
    'react/require-default-props': 'off',
    'react/jsx-props-no-spreading': 'off',
    'react/no-unstable-nested-components': 'off',
    'react/function-component-definition': [
      'error',
      {
        namedComponents: ['function-declaration', 'arrow-function'],
        unnamedComponents: 'arrow-function',
      },
    ],
    'import/prefer-default-export': 'off',
    'import/extensions': [
      'error',
      'ignorePackages',
      {
        ts: 'never',
        tsx: 'never',
      },
    ],
    'no-shadow': 'off',
    /*
     * `onTouchEnd`/`onTouchStart` on a plain `View` is silently dead: it does
     * not fire for `fireEvent.press` and gives the row no press semantics (no
     * ripple, no `accessibilityRole="button"`, no keyboard/assistive
     * activation). Use `Pressable` (or `Button` / `BusinessActionTile` /
     * `BusinessSettingRow`) for anything tappable. This has been reintroduced
     * by mistake four times, so it is now a hard error. `no-restricted-properties`
     * only covers property *access*, so JSX attributes need a selector rule.
     */
    'no-restricted-syntax': [
      'error',
      {
        selector: 'JSXAttribute[name.name=/^(onTouchEnd|onTouchStart)$/]',
        message:
          'onTouchEnd/onTouchStart is dead on a plain View and provides no press semantics. Use Pressable for tappable elements.',
      },
      {
        // A fixed pixel size that spans a phone viewport always overflows the
        // 24px content gutter and does not adapt to narrow devices. Size from
        // flex / max-w-* / percentage instead.
        selector:
          'JSXAttribute[name.name="className"][value.value=/(^|\s)[wh]-\\[(?:3[2-9]\\d|[4-9]\\d\\d|[1-9]\\d{3,})px\\]/]',
        message:
          'Fixed px size of 320px or more overflows the content gutter on small screens. Use flex / max-w-* / percentage sizing instead.',
      },
    ],
    '@typescript-eslint/no-shadow': 'error',
    'no-unused-vars': 'off',
    '@typescript-eslint/no-unused-vars': [
      'error',
      { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
    ],
    'react-native/no-unused-styles': 'error',
    'react-native/no-inline-styles': 'warn',
    'react-native/no-color-literals': 'off',
    'react-native/no-raw-text': ['error', { skip: ['Text', 'ThemedText', 'VemtapText'] }],
    'react/jsx-no-bind': 'off',
    'react/jsx-filename-extension': [
      'error',
      { extensions: ['.js', '.jsx', '.ts', '.tsx'] },
    ],
    'no-console': ['warn', { allow: ['warn', 'error'] }],
  },
  overrides: [
    {
      files: ['src/services/offlineReplay.ts'],
      rules: {
        'no-restricted-syntax': 'off',
        'no-continue': 'off',
        'no-await-in-loop': 'off',
      },
    },
    {
      files: ['*.js', '*.jsx'],
      rules: {
        '@typescript-eslint/naming-convention': 'off',
        '@typescript-eslint/no-shadow': 'off',
        '@typescript-eslint/no-unused-vars': 'off',
        '@typescript-eslint/dot-notation': 'off',
        '@typescript-eslint/no-use-before-define': 'off',
        '@typescript-eslint/lines-between-class-members': 'off',
        '@typescript-eslint/no-explicit-any': 'off',
        '@typescript-eslint/no-non-null-assertion': 'off',
        '@typescript-eslint/no-empty-function': 'off',
        '@typescript-eslint/no-inferrable-types': 'off',
        '@typescript-eslint/no-var-requires': 'off',
        '@typescript-eslint/no-require-imports': 'off',
        '@typescript-eslint/no-redundant-type-constituents': 'off',
        '@typescript-eslint/prefer-optional-chain': 'off',
        '@typescript-eslint/prefer-nullish-coalescing': 'off',
        '@typescript-eslint/no-unnecessary-condition': 'off',
        '@typescript-eslint/no-unnecessary-type-assertion': 'off',
        '@typescript-eslint/unbound-method': 'off',
        '@typescript-eslint/no-floating-promises': 'off',
        '@typescript-eslint/await-thenable': 'off',
        '@typescript-eslint/no-misused-promises': 'off',
        '@typescript-eslint/no-unsafe-assignment': 'off',
        '@typescript-eslint/no-unsafe-member-access': 'off',
        '@typescript-eslint/no-unsafe-call': 'off',
        '@typescript-eslint/no-unsafe-return': 'off',
        '@typescript-eslint/no-unsafe-argument': 'off',
        '@typescript-eslint/no-unsafe-enum-comparison': 'off',
        '@typescript-eslint/require-await': 'off',
        '@typescript-eslint/restrict-template-expressions': 'off',
        '@typescript-eslint/restrict-plus-operands': 'off',
        '@typescript-eslint/no-base-to-string': 'off',
        '@typescript-eslint/no-duplicate-type-constituents': 'off',
        '@typescript-eslint/no-empty-object-type': 'off',
        '@typescript-eslint/no-wrapper-object-types': 'off',
        '@typescript-eslint/no-unsafe-declaration-merging': 'off',
        '@typescript-eslint/no-extraneous-class': 'off',
        '@typescript-eslint/class-methods-use-this': 'off',
        '@typescript-eslint/init-declarations': 'off',
        '@typescript-eslint/max-params': 'off',
        '@typescript-eslint/max-lines-per-function': 'off',
        '@typescript-eslint/no-dynamic-delete': 'off',
        '@typescript-eslint/no-invalid-void-type': 'off',
        '@typescript-eslint/no-magic-numbers': 'off',
        '@typescript-eslint/no-meaningless-operator': 'off',
        '@typescript-eslint/no-mixed-enums': 'off',
        '@typescript-eslint/no-non-null-asserted-nullish-coalescing': 'off',
        '@typescript-eslint/no-unnecessary-boolean-literal-compare': 'off',
        '@typescript-eslint/no-unnecessary-template-expression': 'off',
        '@typescript-eslint/no-unnecessary-type-arguments': 'off',
        '@typescript-eslint/no-unnecessary-type-parameters': 'off',
        '@typescript-eslint/no-unnecessary-type-constraint': 'off',
        '@typescript-eslint/no-unsafe-type-assertion': 'off',
        '@typescript-eslint/no-useless-constructor': 'off',
        '@typescript-eslint/prefer-as-const': 'off',
        '@typescript-eslint/prefer-find': 'off',
        '@typescript-eslint/prefer-for-of': 'off',
        '@typescript-eslint/prefer-function-type': 'off',
        '@typescript-eslint/prefer-includes': 'off',
        '@typescript-eslint/prefer-namespace-keyword': 'off',
        '@typescript-eslint/prefer-reduce-type-parameter': 'off',
        '@typescript-eslint/prefer-regexp-exec': 'off',
        '@typescript-eslint/prefer-return-this-type': 'off',
        '@typescript-eslint/prefer-string-starts-ends-with': 'off',
        '@typescript-eslint/prefer-ts-expect-error': 'off',
        '@typescript-eslint/related-getter-setter-pairs': 'off',
        '@typescript-eslint/return-await': 'off',
        '@typescript-eslint/switch-exhaustiveness-check': 'off',
        '@typescript-eslint/unified-signatures': 'off',
        'prefer-destructuring': 'off',
        'import/named': 'off',
        'import/namespace': 'off',
        'import/default': 'off',
        'import/no-named-as-default': 'off',
        'import/no-named-as-default-member': 'off',
        'import/no-unresolved': 'off',
      },
    },
  ],
  ignorePatterns: [
    'node_modules/',
    'coverage/',
    '*.config.js',
    'babel.config.js',
    'metro.config.js',
    'jest.config.js',
    'tailwind.config.js',
    '.eslintrc.js',
    'fastlane/',
    'android/',
    'ios/',
    'scripts/',
    '__mocks__/',
    'index.js',
    'jest.setup.js',
    'app.config.js',
    // Scratch/debug tests — see .gitignore.
    '**/zz_*',
    '**/zz-*',
    '**/scratch-*',
  ],
  settings: {
    'import/resolver': {
      typescript: {
        project: './tsconfig.json',
      },
      node: {
        extensions: ['.js', '.jsx', '.ts', '.tsx'],
      },
    },
  },
};
