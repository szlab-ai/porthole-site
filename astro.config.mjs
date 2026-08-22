import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
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
  integrations: [
    sitemap({
      // 每条 <url> 带上 en / zh-Hans 的 xhtml:link 互指，和 <head> 里的 hreflang 一致。
      i18n: {
        defaultLocale: 'en',
        locales: { en: 'en', zh: 'zh-Hans' },
      },
      // 排除 noindex 的根跳转页和 404，避免给 Google 提交不该收录的 URL。
      filter: (page) =>
        !/\/porthole-site\/$/.test(page) && !/\/404\/?$/.test(page),
    }),
  ],
  vite: {
    plugins: [tailwindcss()],
  },
});
