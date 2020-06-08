const path = require('path');

module.exports = {
  extends: [ '@usabilla/react' ],
  rules: {
    'react/jsx-props-no-spreading': 0,
    'react/jsx-filename-extension': [2, {
      extensions: ['.js', '.ts', '.tsx']
    }],
    'import/extensions': [
      'error',
      'ignorePackages',
      {
        "js": "never",
        "jsx": "never",
        "ts": "never",
        "tsx": "never"
      },
    ],
  },
  settings: {
    'import/resolver': {
      'eslint-import-resolver-lerna': {
        packages: path.resolve(__dirname, 'packages')
      },
      node: {
        extensions: ['.js', '.json', '.ts', '.tsx']
      },
    },
  },
  overrides: [
    {
      files: ['*.ts', '*.tsx'],
      parser: '@typescript-eslint/parser',
      plugins: ['@typescript-eslint']
    }
  ]
};
