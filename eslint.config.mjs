import n from 'eslint-plugin-n'
import promise from 'eslint-plugin-promise'

export default [
  {
    files: ['**/*.js'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module'
    },
    plugins: {
      n,
      promise
    },
    rules: {
      indent: ['error', 4],
      'n/no-missing-import': 'off',
      'n/no-unpublished-import': 'off',
      'promise/always-return': 'off',
      'promise/no-return-wrap': 'off'
    }
  },
  {
    files: ['test/**/*.js'],
    languageOptions: {
      globals: {
        jest: 'readonly',
        describe: 'readonly',
        it: 'readonly',
        expect: 'readonly',
        beforeEach: 'readonly',
        afterEach: 'readonly'
      }
    }
  }
]