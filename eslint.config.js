import eslintPluginAstro from 'eslint-plugin-astro';
import tseslint from 'typescript-eslint';

export default [
  {
    ignores: ['dist/', 'node_modules/', '.astro/', 'legacy_2022/'],
  },
  ...tseslint.configs.recommended,
  ...eslintPluginAstro.configs.recommended,
];
