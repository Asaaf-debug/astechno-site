export default [
  { ignores: ["dist/**", ".qa/**"] },
  {
    files: ["**/*.mjs", "script.js"],
    languageOptions: {
      ecmaVersion: "latest",
      globals: { console: "readonly", process: "readonly", URL: "readonly" },
    },
    rules: {
      "no-unused-vars": "error",
      "no-undef": "error",
      "no-unreachable": "error",
      "no-constant-condition": "error",
      "no-dupe-keys": "error",
      eqeqeq: ["error", "always"],
    },
  },
  {
    files: ["script.js"],
    languageOptions: { globals: { document: "readonly", window: "readonly" } },
  },
];
