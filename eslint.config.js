import globals from 'globals';
import pluginJs from '@eslint/js';
import tseslint from 'typescript-eslint';

/** @type { import("eslint").Linter.Config } */
export default [
  { files: ['**/*.ts'] },
  { files: ['spec/**/*.ts'], languageOptions: { globals: globals.jasmine } },
  { languageOptions: { globals: globals.node } },
  pluginJs.configs.recommended,
  ...tseslint.configs.strict,
  ...tseslint.configs.stylistic,
];
