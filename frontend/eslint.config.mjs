import js from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';
import pluginVue from 'eslint-plugin-vue';
import vueParser from 'vue-eslint-parser';
import prettier from 'eslint-config-prettier';

export default tseslint.config(
  js.configs.recommended,
  tseslint.configs.recommended,
  {
    files: ['**/*.vue'],
    languageOptions: {
      parser: vueParser,
      parserOptions: {
        parser: tseslint.parser,
        extraFileExtensions: ['.vue'],  // ← removed project & tsconfigRootDir
      },
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
    plugins: {
      vue: pluginVue,
    },
    rules: {
      ...pluginVue.configs['flat/recommended'].rules,

      // Vue rules
      'vue/no-unused-vars': 'error',
      'vue/no-unused-components': 'error',
      'vue/multi-word-component-names': 'warn',

      // TypeScript rules
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': ['error', {
        argsIgnorePattern: '^_',
      }],
      '@typescript-eslint/no-explicit-any': 'error',

      // General
      'eqeqeq': ['error', 'always'],
      'no-console': 'warn',
    },
  },
  {
    files: ['**/*.ts'],
    languageOptions: {
      parserOptions: {
        // ← removed project & tsconfigRootDir
      },
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
    rules: {
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': ['error', {
        argsIgnorePattern: '^_',
      }],
      '@typescript-eslint/no-explicit-any': 'error',
      'eqeqeq': ['error', 'always'],
      'no-console': 'warn',
    },
  },
  {
    ignores: ['dist/**', 'node_modules/**', '*.config.mjs'],
  }
);