# Porthole Cloudflare Web Analytics 接入设计

> 日期：2026-08-06
>
> 状态：用户已批准设计方向；先验证 Cloudflare 端到端链路，再决定正式全站启用
>
> 范围：页面 PV、Visits、来源、地区、设备与页面性能；不包含 App Store 点击事件

## 目标

在不迁移域名、不改变 GitHub Pages 部署方式的前提下，为 Porthole 产品站接入 Cloudflare Web Analytics。先通过隔离的 smoke 页面证明 Cloudflare 账户、Beacon Token、浏览器上报与数据看板整条链路可用，再将同一个 Beacon 组件接入所有正式内容页。

本次继续使用：

- 站点：`https://szlab-ai.github.io/porthole-site/`
- Cloudflare Web Analytics hostname：`szlab-ai.github.io`
- 部署：GitHub Actions → GitHub Pages
- 应用：Astro 7 静态输出

## 已确认决策

- 使用 Cloudflare Web Analytics，不使用 GA4、Plausible 或自托管分析服务。
- 首期只统计被动页面指标，不统计 App Store 按钮点击或其他自定义事件。
- 不配置自定义域名，不把站点迁移到 Cloudflare Pages，也不将流量代理到 Cloudflare。
- 先跑通 Cloudflare，再接入全站。
- 中英文隐私政策正文保持不变；首页现有隐私与信任文案也不在本次范围内。
- README 可记录真实的技术配置与维护方法。
- Cloudflare 账户侧操作由 Codex 在对话中一次只指导一步；用户确认当前步骤完成后再继续。用户不需要向 Codex 提供账户密码、两步验证码或其他登录凭据。

## 已知口径风险

当前中英文隐私页写明 Porthole 不含第三方分析软件，README 也写明站点不使用 analytics。用户已明确要求隐私文案保持不变，因此本设计不会修改两份隐私政策或首页文案。

正式全站启用 Cloudflare Web Analytics 后，上述隐私页表述可能被理解为与网站实际技术行为不一致。此项作为用户接受的已知风险记录，不由实施者自行修改法律文案。README 属于技术文档，应在正式接入阶段移除“不使用 analytics”的过时技术描述并记录实际配置。

## 方案选择

### 采用：独立组件 + 构建时变量

新增一个只负责渲染 Cloudflare Beacon 的 Astro 组件。GitHub Actions 从 Repository Variable 读取 Token，并将它作为 `PUBLIC_CLOUDFLARE_WEB_ANALYTICS_TOKEN` 提供给 Astro 构建。组件只有在生产构建且 Token 非空时才输出脚本。

Token 会按 Cloudflare 官方方式出现在最终 HTML 中，因此它不是账户密钥。使用构建变量的目的在于分离配置、避免本地开发误记流量，并让停用过程可控。

### 不采用：源码硬编码 Token

硬编码改动较少，但会把环境配置与页面代码耦合，也更容易让本地构建或临时预览产生真实统计。

### 不采用：Cloudflare 代理自动注入

现有站点位于 GitHub Pages 的共享 `github.io` hostname 下，且用户要求域名保持现状。自动注入不适用于当前部署形态，因此使用 Cloudflare 官方的手工 Beacon。

## 架构与数据流

```text
GitHub Repository Variable
        ↓ GitHub Actions 构建时注入
Astro CloudflareAnalytics 组件
        ↓ 输出到静态 HTML
浏览器加载 static.cloudflareinsights.com/beacon.min.js
        ↓ 页面 load / 离开时上报
cloudflareinsights.com/cdn-cgi/rum
        ↓
Cloudflare Web Analytics Dashboard
```

Beacon 使用 `type="module"`，按 Cloudflare 当前手工安装示例加载。它是页面的非关键外部脚本；加载失败、被广告拦截器屏蔽或上报失败时，不影响页面内容、导航和 App Store 链接。

## 第一阶段：隔离 Smoke Test

### Cloudflare 控制台准备

Codex 将逐步指导用户完成以下账户侧操作，每一步都等待用户确认：

1. 登录 Cloudflare Dashboard。
2. 进入 Web Analytics。
3. 选择 Add a site。
4. hostname 只填写 `szlab-ai.github.io`，不填写 `https://`、路径或结尾斜杠。
5. 创建站点并取得官方 JS snippet / Site Token。
6. 在 GitHub 仓库的 Actions variables 中创建 `CLOUDFLARE_WEB_ANALYTICS_TOKEN`。

Site Token 可从 Cloudflare 生成的 snippet 中提取，但不在聊天、提交记录、README 或截图中回显完整值。Codex 不接触 Cloudflare 登录密码、两步验证码或账户级 API Token。

### Smoke 页面

新增临时路由 `/analytics-smoke/`，满足以下条件：

- 使用独立、最小 HTML 页面，不经 `BaseLayout.astro`。
- 输出 `<meta name="robots" content="noindex, nofollow">`。
- 不加入 Header、Footer、首页入口、语言导航或其他内部链接。
- 只在这个页面引用 `CloudflareAnalytics.astro`。
- 不修改任何正式页面，也不统计普通访问者。

同时新增 `CloudflareAnalytics.astro`。第一阶段只由 smoke 页面调用；正式内容页不会出现 Beacon。

### 为什么需要一次临时线上部署

Cloudflare 会校验 Beacon 来源 hostname。若 Web Analytics 站点配置为 `szlab-ai.github.io`，单纯从 `localhost` 上报可能因 hostname 不一致被 CORS 拒绝。因此本地只能验证构建产物和脚本标记，真正的上报闭环需要从当前 GitHub Pages hostname 发起。

流程如下：

1. 用空 Token 构建，验证正式页面与 smoke 页面都不包含 Beacon。
2. 用占位 Token 构建，验证只有 smoke 页面恰好包含一个 Beacon。
3. 用户本地 review smoke 改动。
4. 用户确认后，才提交并部署临时 smoke 页面。
5. 访问 `/porthole-site/analytics-smoke/` 一次。
6. 在浏览器网络面板确认脚本加载成功，并出现成功的 RUM POST 请求。
7. 等待 Cloudflare Web Analytics 看板出现该路径的 page view / visit。
8. 记录验证结果；第一阶段即告跑通。

第一阶段不会把 Beacon 接入 `/en/`、`/zh/`、privacy 或 support 页面。

## 第二阶段：正式全站接入

只有第一阶段通过且用户再次确认后才进行：

- 删除临时 `/analytics-smoke/` 路由。
- 在 `BaseLayout.astro` 的 `</body>` 前引用 `CloudflareAnalytics.astro`。
- `/en/`、`/zh/`、两种语言的 privacy 和 support 页面统一统计。
- 根路径 `src/pages/index.astro` 不使用 `BaseLayout`，继续不加载 Beacon，避免一次入口访问被根跳转和目标首页重复计算。
- GitHub Actions 继续从同一个 Repository Variable 注入 Token。
- README 增加 Cloudflare 配置、指标范围、停用与验证说明；不改隐私政策正文和首页营销文案。
- 本地 review 通过后再部署正式版本。

## 组件边界

### `src/components/CloudflareAnalytics.astro`

职责：读取构建环境和公开 Site Token，按条件输出一个 Cloudflare Beacon script。

约束：

- `import.meta.env.PROD` 必须为 `true`。
- `PUBLIC_CLOUDFLARE_WEB_ANALYTICS_TOKEN` 去除首尾空白后必须非空。
- 条件不满足时不输出任何 DOM 或脚本。
- 同一页面最多渲染一次。
- 不承担路由过滤、用户同意管理或自定义事件逻辑。

### `.github/workflows/deploy.yml`

职责：在 Astro build 步骤中建立以下映射：

```text
GitHub variable: CLOUDFLARE_WEB_ANALYTICS_TOKEN
Build env:       PUBLIC_CLOUDFLARE_WEB_ANALYTICS_TOKEN
```

缺少 Repository Variable 时构建仍须成功，产物不包含 Beacon。

### `src/layouts/BaseLayout.astro`

第二阶段职责：统一调用 Analytics 组件。它不读取 Token，也不包含 Cloudflare URL 或脚本细节。

## 指标范围与解释

正式接入后，Cloudflare Dashboard 用于查看：

- Page views 与 Visits。
- 页面路径，包括英文、中文、privacy 和 support 页面。
- Referrer、国家或地区、设备、浏览器和操作系统。
- 页面加载时间和 Core Web Vitals。

不承诺以下能力：

- App Store 点击量或自定义事件。
- UTM 查询参数分析。
- 登录用户识别、跨设备去重或精确的传统 UV。
- 被广告拦截器屏蔽后的缺失流量补算。
- 接入前的历史数据回填。

数据用于观察趋势，不作为财务结算或精确用户人数依据。

## 故障与停用

- Beacon 失败：页面继续正常工作，不显示错误 UI。
- Token 缺失：构建成功，Analytics 组件不输出。
- Cloudflare 看板无数据：检查 hostname、页面源代码、脚本请求、RUM POST 与广告拦截器，不能通过在同页重复添加脚本规避。
- 紧急停用：删除 GitHub Repository Variable 后重新运行 Pages workflow；新产物不包含 Beacon。
- 代码级回滚：从 `BaseLayout.astro` 移除组件调用并重新部署。

删除变量不会改变已经部署的静态 HTML，因此停用动作必须伴随一次重新构建和部署。

## 验收标准

### 第一阶段

- 无 Token 的 `npm run build` 成功，全部构建产物均无 Cloudflare Beacon。
- 使用占位 Token 的生产构建中，只有 smoke 页面包含一次 `static.cloudflareinsights.com/beacon.min.js`。
- 根跳转页和六个正式内容页不包含 Beacon。
- smoke 页面不可由站内导航到达，并包含 `noindex, nofollow`。
- 用户本地 review 后才允许临时部署。
- 线上 smoke 页面能够成功加载 Beacon、发送 RUM POST，并在 Cloudflare Dashboard 出现相应数据。

### 第二阶段

- smoke 页面被删除，访问返回 GitHub Pages 的 404。
- 六个正式内容页各包含且只包含一个 Beacon。
- 根跳转页不包含 Beacon。
- 空 Token 构建仍成功且无 Beacon。
- `npm run build` 与 `git diff --check` 通过。
- Cloudflare 不可用或脚本被拦截时，网站功能与视觉不受影响。
- README 的技术说明与实际部署配置一致；隐私政策和首页文案保持不变。
- 用户本地 review 并明确批准后才发布正式版本。

## 不在本次范围

- App Store 点击事件、转化漏斗、UTM、自定义事件。
- GA4、Plausible、Google Tag Manager 或自建统计服务。
- Cookie Banner、同意管理平台或用户画像。
- 自定义域名、Cloudflare DNS、Cloudflare Proxy、Cloudflare Pages。
- 修改中英文隐私政策、支持页正文或首页隐私营销文案。
- 回填历史访问数据。

## 参考

- Cloudflare Web Analytics Get started：<https://developers.cloudflare.com/web-analytics/get-started/>
- Cloudflare Web Analytics FAQ：<https://developers.cloudflare.com/web-analytics/faq/>
- Data origin and collection：<https://developers.cloudflare.com/web-analytics/data-metrics/data-origin-and-collection/>
