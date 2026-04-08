module.exports = {
  root: true,
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaVersion: "latest",
    sourceType: "module"
  },
  plugins: ["@typescript-eslint"],
  extends: [
    "next/core-web-vitals",
    "plugin:@typescript-eslint/recommended"
  ],
  ignorePatterns: [
    ".next/",
    "node_modules/",
    "dist/",
    "build/",
    "coverage/",
    "*.min.js"
  ],
  rules: {
    "@typescript-eslint/no-explicit-any": "error",
    "@typescript-eslint/explicit-function-return-type": "off",
    "no-console": ["warn", { allow: ["warn", "error"] }]
  }
};

