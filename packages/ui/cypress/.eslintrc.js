module.exports = {
  plugins: ["cypress", "no-only-tests", "@typescript-eslint"],
  parser: "@typescript-eslint/parser",
  extends: ["plugin:cypress/recommended", "../../../.eslintrc.json"],
  env: {
    "cypress/globals": true,
  },
  rules: {
    "no-only-tests/no-only-tests": [1, { fix: true }],
  },
};
