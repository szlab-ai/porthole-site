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

Porthole does not operate a backend, analytics, advertising, or tracking service. It is not affiliated with or endorsed by Telegram.

Contact: **szlab.ai@outlook.com**
