import UnoCSS from '@unocss/astro';
import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://yui666a.me',
  base: '/',
  integrations: [UnoCSS({ injectReset: false })],
  i18n: {
    defaultLocale: 'ja',
    locales: ['ja', 'en'],
    routing: {
      prefixDefaultLocale: true,
    },
  },
  redirects: {
    '/': '/ja/',
  },
});
