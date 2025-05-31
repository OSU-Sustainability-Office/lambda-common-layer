// eslint.config.js

import js from '@eslint/js'
import importPlugin from 'eslint-plugin-import'
import eslintConfigPrettier from 'eslint-config-prettier/flat'
import globals from 'globals'

export default [
  js.configs.recommended,
  eslintConfigPrettier, // prevent conflicts with Prettier

  {
    files: ['**/*.js'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        ...globals.node
      }
    },
    plugins: {
      import: importPlugin
    },
    rules: {
      'import/export': 'error',
      'import/no-commonjs': 'error',
      'no-unused-vars': 'off'
    }
  }
]
