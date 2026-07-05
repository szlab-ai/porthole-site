import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

// NOTE: brief called for `@astrojs/tailwind` + `integrations: [tailwind()]` (Tailwind v3),
// but @astrojs/tailwind@6.0.2's peerDependencies only allow astro ^3-^5, and this project
// scaffolds on astro ^7.0.6 (npm ERESOLVE confirmed the conflict). Adapted to Tailwind v4's
// official Vite-plugin integration instead (@astrojs/tailwind peer-deps don't support this Astro version).
export default defineConfig({
  site: 'https://szlab-ai.github.io',
  base: '/porthole-site/',
  trailingSlash: 'always',
  i18n: {
    locales: ['en', 'zh'],
    defaultLocale: 'en',
    routing: { prefixDefaultLocale: true },
  },
  vite: {
    plugins: [tailwindcss()],
  },
});
