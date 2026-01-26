module.exports = {
  "extends": [],
  "rules": {},
  "env": {
    "browser": true,
    "es6": true,
    "node": true
  },
  "parser": "@babel/eslint-parser",
  "parserOptions": {
    "requireConfigFile": false,
    "babelOptions": {
      "presets": ["@babel/preset-react"]
    }
  },
  // Disable all rules
  "overrides": [
    {
      "files": ["**/*"],
      "rules": {
        "no-unused-vars": "off",
        "react-hooks/exhaustive-deps": "off",
        "import/no-anonymous-default-export": "off"
      }
    }
  ]
};