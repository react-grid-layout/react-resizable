const babelParser = require('@babel/eslint-parser');
const reactPlugin = require('eslint-plugin-react');
const jestPlugin = require('eslint-plugin-jest');
const js = require('@eslint/js');

module.exports = [
  js.configs.recommended,
  {
    files: ['**/*.js', '**/*.jsx'],
    languageOptions: {
      parser: babelParser,
      parserOptions: {
        requireConfigFile: false,
        babelOptions: {
          presets: ['@babel/preset-react', '@babel/preset-flow']
        }
      },
      globals: {
        // Browser
        window: 'readonly',
        document: 'readonly',
        console: 'readonly',
        HTMLElement: 'readonly',
        // Node
        require: 'readonly',
        module: 'readonly',
        exports: 'readonly',
        __dirname: 'readonly',
        process: 'readonly',
        global: 'readonly',
        // Jest
        jest: 'readonly',
        describe: 'readonly',
        test: 'readonly',
        expect: 'readonly',
        beforeEach: 'readonly',
        afterEach: 'readonly',
        it: 'readonly',
        // Flow
        ReactElement: 'readonly',
        ReactClass: 'readonly',
        SyntheticEvent: 'readonly',
        ClientRect: 'readonly'
      }
    },
    plugins: {
      react: reactPlugin,
      jest: jestPlugin
    },
    rules: {
      ...jestPlugin.configs.recommended.rules,
      'strict': 'off',
      'quotes': 'off',
      'curly': ['warn', 'multi-line'],
      'camelcase': 'off',
      'comma-dangle': 'off',
      'dot-notation': 'off',
      'no-console': 'off',
      'no-use-before-define': ['warn', 'nofunc'],
      'no-underscore-dangle': 'off',
      'no-unused-vars': 'off',
      'new-cap': 'off',
      'react/jsx-uses-vars': 'warn',
      'semi': ['warn', 'always']
    }
  }
];
