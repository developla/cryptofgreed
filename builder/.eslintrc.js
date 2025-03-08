module.exports = {
  env: {
    node: true,
  },
  parserOptions: {
    ecmaVersion: 2020,
  },
  rules: {
    "global-require": "off",
    "@typescript-eslint/no-var-requires": "off",
    "import/no-commonjs": "off",
    "import/no-require": "off",
  },
  overrides: [
    {
      files: ["hardhat.config.js", "scripts/**/*.js"],
      rules: {
        "@typescript-eslint/no-var-requires": "off",
        "no-undef": "off",
        "import/no-commonjs": "off",
        "import/no-require": "off",
      },
    },
  ],
};
