export default {
  "src/**/*.ts": [
    "prettier --write",
    "eslint --fix --max-warnings 0",
  ],
};
