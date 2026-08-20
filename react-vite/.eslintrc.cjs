module.exports = {
  root: true,
  env: { browser: true, es2020: true, node: true },
  extends: [
    "eslint:recommended",
    "plugin:react/recommended",
    "plugin:react/jsx-runtime",
    "plugin:react-hooks/recommended",
  ],
  parserOptions: { ecmaVersion: "latest", sourceType: "module" },
  settings: { react: { version: "18.2" } },
  plugins: ["react-refresh"],
  overrides: [
    {
      files: ["src/context/*.jsx", "src/components/Game/Game.jsx"],
      rules: {
        // Game.jsx intentionally shares save-normalization logic alongside the
        // component so old/local/cloud saves all use one canonical path.
        "react-refresh/only-export-components": "off",
      },
    },
    {
      files: ["**/*.test.js", "**/*.test.jsx"],
      env: { jest: true },
    },
  ],
  ignorePatterns: ["dist", "node_modules"],
  rules: {
    "react-refresh/only-export-components": [
      "warn",
      { allowConstantExport: true },
    ],
    "react/prop-types": "off",
  },
};
