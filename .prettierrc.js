module.exports = {
  arrowParens: 'avoid',
  singleQuote: true,
  trailingComma: 'all',
  printWidth: 90,
  plugins: [require.resolve('prettier-plugin-tailwindcss')],
  tailwindFunctions: ['cn', 'cva', 'tv'],
  tailwindAttributes: ['className', 'class'],
  pluginSearchDirs: false,
};
