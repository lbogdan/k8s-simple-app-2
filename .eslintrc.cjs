module.exports = {
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint', 'import'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/eslint-recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:prettier/recommended',
    'plugin:import/typescript',
  ],
  rules: {
    'prettier/prettier': 'warn',
    'import/extensions': ['warn', 'ignorePackages'],
    // '@typescript-eslint/camelcase': 'off',
    // '@typescript-eslint/explicit-function-return-type': 'off',
    // '@typescript-eslint/no-explicit-any': 'off',
    // '@typescript-eslint/no-non-null-assertion': 'off'
  },
  env: {
    node: true,
  },
};
