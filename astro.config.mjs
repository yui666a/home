import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://yui666a.me',
  base: '/',
  i18n: {
    defaultLocale: 'ja',
    locales: ['ja', 'en'],
    routing: {
      prefixDefaultLocale: false, // ja は / に、en は /en/ に
    },
  },
});
