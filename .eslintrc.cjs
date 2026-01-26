// .eslintrc.js
module.exports = {
  extends: [
    "plugin:vue/vue3-recommended",
    "@vue/typescript/recommended",
    "prettier",
  ],
  rules: {
    "vue/multi-word-component-names": "off",
    "@typescript-eslint/no-explicit-any": "off",
    "no-console": "off",
  },
};
