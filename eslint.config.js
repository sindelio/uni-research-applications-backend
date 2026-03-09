import jestPlugin from 'eslint-plugin-jest';

const jsConfig = { // Config for JS code
  files: ['**/*.js'],
  ignores: ['src/logs/*'],
  languageOptions: {
    ecmaVersion: 'latest',
    sourceType:  'module',
  },
  plugins: { jestPlugin },
  rules: {
    indent: [
      'error',
      2,
    ],
    'linebreak-style': [
      'error',
      'unix',
    ],
    quotes: [
      'error',
      'single',
    ],
    semi: [
      'error',
      'always',
    ],
    'max-len': [
      'error',
      {
        code: 100,
        tabWidth: 2,
        ignoreTrailingComments: true,
        ignoreStrings: true,
        ignoreTemplateLiterals: true,
        ignoreRegExpLiterals: true,
      },
    ],
    'prefer-const': ['error'],
    'dot-location': [
      'error',
      'property',
    ],
    'brace-style': [
      'error',
      '1tbs',
    ],
    'comma-dangle': [
      'error',
      {
        arrays: 'always-multiline',
        objects: 'always-multiline',
        imports: 'always-multiline',
        exports: 'always-multiline',
        functions: 'only-multiline',
      },
    ],
    'array-bracket-spacing': [
      'error',
      'never',
    ],
    'object-curly-spacing': [
      'error',
      'always',
    ],
    'function-call-argument-newline': [
      'error',
      'consistent',
    ],
    'space-before-function-paren': [
      'error',
      {
        anonymous: 'always',
        named: 'never',
      },
    ],
    'arrow-parens': [
      'error',
      'always',
    ],
    'arrow-spacing': [
      'error',
      {
        before: true,
        after: true,
      },
    ],
    'arrow-body-style': [
      'error',
      'as-needed',
    ],
    'no-var': ['error'],
    'no-unused-vars': [
      'error',
      { args: 'none' },
    ],
    'no-use-before-define': ['error'],
    'no-multi-spaces': ['error'],
    'no-console': ['error'],
    'no-param-reassign': ['error'],
    'no-proto': ['error'],
    'no-eval': ['error'],
    'no-import-assign': ['error'],
    'no-global-assign': ['error'],
  },
};

const configs = [jsConfig];

export default configs;
