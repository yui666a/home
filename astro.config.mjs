import { fileURLToPath } from 'node:url';
import UnoCSS from '@unocss/astro';
import { defineConfig } from 'astro/config';

// MindAR の prod ビルドだけ、bare import "three" を three-shim に差し替える。
// shim 自身は本物の three を import するので循環しない。他のファイルの
// "three" import は素通しで本物の three を使う。
const threeShim = fileURLToPath(new URL('./src/scripts/three-shim.ts', import.meta.url));
function mindarThreeShim() {
  return {
    name: 'mindar-three-shim',
    enforce: 'pre',
    async resolveId(source, importer) {
      if (source === 'three' && importer && importer.includes('mindar-image-three.prod.js')) {
        return threeShim;
      }
      return null;
    },
  };
}

export default defineConfig({
  site: 'https://yui666a.me',
  base: '/',
  integrations: [UnoCSS({ injectReset: false })],
  vite: {
    plugins: [mindarThreeShim()],
  },
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
