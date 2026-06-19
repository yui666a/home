import { defineConfig } from 'astro/config';
import UnoCSS from '@unocss/astro';

export default defineConfig({
  site: 'https://yui666a.me',
  base: '/',
  integrations: [UnoCSS({ injectReset: false })],
  i18n: {
    defaultLocale: 'ja',
    locales: ['ja', 'en'],
    routing: {
      prefixDefaultLocale: false, // ja は / に、en は /en/ に
    },
  },
});
