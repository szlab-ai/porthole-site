import type { Lang } from '../i18n/ui';

/**
 * App Store 事实来源：https://itunes.apple.com/lookup?id=6788416143
 * 这些值会直接进 JSON-LD，改动前请以 App Store Connect 的真实数据为准，
 * 不要凭印象填写（错误的 price / rating 会被 Google 判为结构化数据违规）。
 */
export const APP = {
  storeId: '6788416143',
  /** App Store 上的正式名称，与站点品牌名 "Porthole" 不同 */
  storeName: 'PortholeTV for Telegram',
  brandName: 'Porthole',
  version: '1.1.0',
  datePublished: '2026-08-04',
  operatingSystem: 'tvOS 17.0 or later',
  contentRating: '17+',
  publisherName: 'SZLab',
  email: 'szlab.ai@outlook.com',
  offer: {
    en: { price: '3.99', priceCurrency: 'USD', url: 'https://apps.apple.com/us/app/porthole-tv/id6788416143' },
    zh: { price: '32.00', priceCurrency: 'HKD', url: 'https://apps.apple.com/hk/app/porthole-tv/id6788416143' },
  },
  /** 讲解视频：时长由 ffprobe 实测 25.9s；上传日期取素材接入日 */
  video: { duration: 'PT26S', uploadDate: '2026-07-08' },
} as const;

const SHOTS = ['01-big-screen', '02-videos', '03-photos', '04-pdf', '05-light-dark'];

const copy = {
  en: {
    siteName: 'PortholeTV',
    appDescription:
      'PortholeTV (Porthole) is an independent, unofficial Telegram viewer for Apple TV. Browse your chats, groups and channels on the big screen and play their photos, videos, voice messages and documents with the Siri Remote.',
    features: [
      'Browse Telegram chats and channels on Apple TV with the Siri Remote',
      'View photos, videos, stickers and voice messages on the big screen',
      'Stream video online with adaptive quality',
      'Read PDF and other documents on the TV',
      'Focus-driven tvOS interface with light and dark appearance',
      'Connects directly to Telegram — no developer servers, no data collection',
    ],
    videoName: 'Porthole for Apple TV — product demo',
    videoDescription:
      'A short walkthrough of Porthole on Apple TV: browsing Telegram chats and channels, and playing photos and videos on the big screen.',
    breadcrumbHome: 'Home',
    pageNames: { privacy: 'Privacy Policy', support: 'Support', guide: 'How to Watch Telegram on Apple TV' },
  },
  zh: {
    siteName: 'PortholeTV',
    appDescription:
      'PortholeTV（Porthole）是专为 Apple TV 打造的独立、非官方 Telegram 查看应用。用 Siri Remote 在大屏上浏览会话、群组和频道，播放其中的图片、视频、语音和文档。',
    features: [
      '用 Siri Remote 在 Apple TV 上浏览 Telegram 会话与频道',
      '在大屏上查看图片、视频、贴纸与语音消息',
      '在线播放视频，清晰度自适应',
      '在电视上阅读 PDF 等文档',
      '为 tvOS 打造的焦点式界面，明暗外观自适应',
      '直连 Telegram —— 无开发者服务器、不收集数据',
    ],
    videoName: 'Porthole for Apple TV —— 产品演示',
    videoDescription:
      'Porthole 在 Apple TV 上的简短演示：浏览 Telegram 会话与频道，并在大屏上播放图片和视频。',
    breadcrumbHome: '首页',
    pageNames: { privacy: '隐私政策', support: '支持', guide: '如何在 Apple TV 上看 Telegram' },
  },
} as const;

type PageKind = 'home' | 'privacy' | 'support' | 'guide';

export interface SchemaInput {
  lang: Lang;
  page: PageKind;
  /** 站点根，如 https://szlab-ai.github.io */
  site: URL | string;
  /** BASE_URL，如 /porthole-site/ */
  base: string;
  /** 当前页 canonical */
  canonical: string;
  title: string;
  description: string;
  /** 页面上可见的 FAQ 问答对；给了就生成 FAQPage（支持页、教程页都用） */
  faq?: ReadonlyArray<{ q: string; a: string }>;
  /** 教程类页面的发布/更新日期，YYYY-MM-DD */
  datePublished?: string;
}

export function buildSchema(input: SchemaInput) {
  const { lang, page, site, base, canonical, title, description, faq, datePublished } = input;
  const abs = (p: string) => new URL(`${base}${p}`, site).href;
  const home = abs(`${lang}/`);
  const c = copy[lang];
  const inLanguage = lang === 'zh' ? 'zh-Hans' : 'en';

  const orgId = `${abs('')}#organization`;
  const siteId = `${abs('')}#website`;
  const appId = `${abs('')}#app`;

  const graph: Record<string, unknown>[] = [
    {
      '@type': 'Organization',
      '@id': orgId,
      name: APP.publisherName,
      url: home,
      email: APP.email,
      logo: { '@type': 'ImageObject', url: abs('brand/porthole.png'), width: 256, height: 256 },
    },
    {
      '@type': 'WebSite',
      '@id': siteId,
      url: home,
      name: c.siteName,
      description,
      inLanguage,
      publisher: { '@id': orgId },
    },
    {
      '@type': 'SoftwareApplication',
      '@id': appId,
      name: APP.storeName,
      alternateName: APP.brandName,
      description: c.appDescription,
      url: home,
      applicationCategory: 'SocialNetworkingApplication',
      applicationSubCategory: 'Entertainment',
      operatingSystem: APP.operatingSystem,
      softwareVersion: APP.version,
      datePublished: APP.datePublished,
      contentRating: APP.contentRating,
      inLanguage: ['en', 'zh-Hans'],
      image: abs('brand/porthole.png'),
      screenshot: SHOTS.map((s) => abs(`screenshots/${s}.jpg`)),
      featureList: c.features,
      downloadUrl: APP.offer[lang].url,
      installUrl: APP.offer[lang].url,
      isAccessibleForFree: false,
      offers: {
        '@type': 'Offer',
        price: APP.offer[lang].price,
        priceCurrency: APP.offer[lang].priceCurrency,
        availability: 'https://schema.org/InStock',
        url: APP.offer[lang].url,
      },
      publisher: { '@id': orgId },
    },
  ];

  if (page === 'home') {
    graph.push({
      '@type': 'WebPage',
      '@id': canonical,
      url: canonical,
      name: title,
      description,
      inLanguage,
      isPartOf: { '@id': siteId },
      about: { '@id': appId },
      primaryImageOfPage: { '@type': 'ImageObject', url: abs('screenshots/01-big-screen.jpg'), width: 1920, height: 1080 },
    });
    graph.push({
      '@type': 'VideoObject',
      name: c.videoName,
      description: c.videoDescription,
      thumbnailUrl: [abs('video/poster.jpg')],
      contentUrl: abs('video/demo.mp4'),
      uploadDate: APP.video.uploadDate,
      duration: APP.video.duration,
      inLanguage,
      publisher: { '@id': orgId },
    });
  } else {
    graph.push({
      '@type': 'WebPage',
      '@id': canonical,
      url: canonical,
      name: title,
      description,
      inLanguage,
      isPartOf: { '@id': siteId },
      about: { '@id': appId },
      breadcrumb: {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: c.breadcrumbHome, item: home },
          { '@type': 'ListItem', position: 2, name: c.pageNames[page] },
        ],
      },
    });
  }

  if (page === 'guide') {
    graph.push({
      '@type': 'TechArticle',
      '@id': `${canonical}#article`,
      headline: c.pageNames.guide,
      description,
      inLanguage,
      mainEntityOfPage: { '@id': canonical },
      datePublished: datePublished ?? APP.datePublished,
      dateModified: datePublished ?? APP.datePublished,
      author: { '@id': orgId },
      publisher: { '@id': orgId },
      image: [abs('screenshots/01-big-screen.jpg')],
      about: { '@id': appId },
    });
  }

  if (faq?.length) {
    graph.push({
      '@type': 'FAQPage',
      '@id': `${canonical}#faq`,
      inLanguage,
      mainEntity: faq.map((item) => ({
        '@type': 'Question',
        name: item.q,
        acceptedAnswer: { '@type': 'Answer', text: item.a },
      })),
    });
  }

  return { '@context': 'https://schema.org', '@graph': graph };
}
