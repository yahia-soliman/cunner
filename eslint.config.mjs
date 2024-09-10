import globals from 'globals';
import pluginJs from '@eslint/js';
import tseslint from 'typescript-eslint';

/** @type { import("eslint").Linter.Config } */
export default [
  { files: ['**/*.ts'] },
  { files: ['spec/**/*.js'],
    languageOptions: { globals: globals.jasmine }
  },
  { languageOptions: { globals: globals.node } },
  pluginJs.configs.recommended,
  ...tseslint.configs.recommended,
];
