module.exports = {
  root: true,
  env: { node: true, es2022: true, browser: true },
  parser: "@typescript-eslint/parser",
  plugins: ["@typescript-eslint"],
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:react/recommended",
    "plugin:react-hooks/recommended",
    "plugin:prettier/recommended"
  ],
  settings: { react: { version: "detect" } },
  ignorePatterns: ["dist", ".next", "node_modules"],
  rules: {
    "react/react-in-jsx-scope": "off"
  }
};
