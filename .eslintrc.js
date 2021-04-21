module.exports = {
  root: true,
  env: {
    browser: true,
    node: true,
  },
  parserOptions: {
    parser: 'babel-eslint',
  },
  extends: [
    'plugin:vue/essential',
    'plugin:vue/recommended',
    '@vue/airbnb',
  ],
  plugins: [
  ],
  // add your custom rules here
  rules: {
    'no-shadow': 0,
    'import/no-extraneous-dependencies': 0,
    'no-unused-vars': 0,
    'import/prefer-default-export': 0,
  },

  settings: {
    'import/core-modules': [
      'vuetify',
      'vuetify/es5/util/colors',
    ],
    'import/resolver': {
      alias: {
        map: [
          ['@', '.'],
        ],
        extensions: ['.vue', '.js'],
      },
    },
  },
  overrides: [
    {
      files: [
        '**/*.spec.js',
      ],
      env: {
        jest: true,
      },
    },
  ],
};
