import { defineConfig } from 'astro/config';
import UnoCSS from '@unocss/astro';
import paraglide from '@inlang/paraglide-astro';

export default defineConfig({
  site: 'https://yui666a.me',
  base: '/',
  integrations: [
    UnoCSS({ injectReset: false }),
    paraglide({ project: './project.inlang', outdir: './src/paraglide' }),
  ],
  i18n: {
    defaultLocale: 'ja',
    locales: ['ja', 'en'],
    routing: {
      prefixDefaultLocale: false,
    },
  },
});
