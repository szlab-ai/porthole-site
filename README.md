# Porthole

Product site for **Porthole**, an independent, unofficial Telegram viewer designed for Apple TV.

- [Download Porthole on the App Store](https://apps.apple.com/us/app/porthole-tv/id6788416143)
- [Visit the product site](https://szlab-ai.github.io/porthole-site/)

## Pages

| English | 简体中文 |
|---|---|
| [Home](https://szlab-ai.github.io/porthole-site/en/) | [首页](https://szlab-ai.github.io/porthole-site/zh/) |
| [Privacy Policy](https://szlab-ai.github.io/porthole-site/en/privacy/) | [隐私政策](https://szlab-ai.github.io/porthole-site/zh/privacy/) |
| [Support](https://szlab-ai.github.io/porthole-site/en/support/) | [支持](https://szlab-ai.github.io/porthole-site/zh/support/) |

## Development

The site is a static [Astro](https://astro.build/) project styled with Tailwind CSS. It requires Node.js 22.12 or later.

```sh
npm install
npm run dev
```

Useful commands:

| Command | Purpose |
|---|---|
| `npm run dev` | Start the local development server |
| `npm run build` | Build the static site into `dist/` |
| `npm run preview` | Preview the production build locally |

The project is configured for the `/porthole-site/` GitHub Pages base path. English and Simplified Chinese routes are generated under `/en/` and `/zh/`, and the root page redirects to English.

## Deployment

Pushes to `main` trigger [the GitHub Pages workflow](.github/workflows/deploy.yml), which builds the Astro site and deploys it to GitHub Pages. The site intentionally continues to use its current GitHub Pages URL rather than a custom domain.

## Analytics

The product site uses Cloudflare Web Analytics for aggregate page views, visits, referrers, device information, and page-performance metrics. The Beacon is enabled only in production builds when the GitHub Actions repository variable `CLOUDFLARE_WEB_ANALYTICS_TOKEN` is configured. Local development and builds without that variable do not load analytics.

Cloudflare Web Analytics does not provide App Store click events in this configuration. To disable analytics, remove the repository variable and run the GitHub Pages workflow again so the deployed static HTML is rebuilt without the Beacon.

The Porthole app does not operate a developer backend or contain in-app analytics, advertising, or tracking software. The product site uses the aggregate analytics described above. Porthole is not affiliated with or endorsed by Telegram.

Contact: **szlab.ai@outlook.com**
