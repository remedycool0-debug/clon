import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const sourceDir = path.join(projectRoot, 'recursos');
const outputDir = path.join(projectRoot, 'public', 'investor-pages');

const corePages = {
  'report-a-scam': '/report-a-scam',
  home: '/',
  'five-questions-ask-you-invest':
    '/introduction-investing/getting-started/five-questions-ask-you-invest',
  'understanding-fees': '/introduction-investing/getting-started/understanding-fees',
  'asset-allocation': '/introduction-investing/getting-started/asset-allocation',
  'investing-your-own': '/introduction-investing/getting-started/investing-your-own',
  'online-investing':
    '/introduction-investing/getting-started/investing-your-own/online-investing',
  'direct-investing':
    '/introduction-investing/getting-started/investing-your-own/direct-investing',
  'working-investment-professional':
    '/introduction-investing/getting-started/working-investment-professional',
  brokers: '/introduction-investing/getting-started/working-investment-professional/brokers',
  'using-brokercheck':
    '/introduction-investing/getting-started/working-investment-professional/using-brokercheck',
  'investment-advisers':
    '/introduction-investing/getting-started/working-investment-professional/investment-advisers',
  'investment-adviser-registration':
    '/introduction-investing/getting-started/working-investment-professional/investment-advisers-0',
  'check-out-your-investment-professional':
    '/introduction-investing/getting-started/working-investment-professional/check-out-your-investment-professional',
  'using-iapd':
    '/introduction-investing/getting-started/working-investment-professional/using-iapd',
  'using-sali':
    '/introduction-investing/getting-started/working-investment-professional/sec-action-lookup',
  'ask-questions':
    '/introduction-investing/getting-started/working-investment-professional/ask-questions',
  'research-using-edgar':
    '/introduction-investing/getting-started/researching-investments/using-edgar-research-investments',
  'research-ask-and-check':
    '/introduction-investing/getting-started/researching-investments/ask-and-check',
  'research-using-emma':
    '/introduction-investing/getting-started/researching-investments/using-emma-researching-municipal',
  'research-how-read-10-k':
    '/introduction-investing/getting-started/researching-investments/how-read-10-k',
  'research-how-read-8-k':
    '/introduction-investing/general-resources/news-alerts/alerts-bulletins/investor-bulletins/how-read-8',
  'research-insider-transactions':
    '/introduction-investing/general-resources/news-alerts/alerts-bulletins/investor-bulletins-69',
};

let sidebarManifest = [];
let globalMenuManifest = [];

try {
  sidebarManifest = JSON.parse(
    await readFile(path.join(projectRoot, 'recursos', 'sidebar-pages.json'), 'utf8'),
  );
} catch (error) {
  if (error.code !== 'ENOENT') throw error;
}

try {
  globalMenuManifest = JSON.parse(
    await readFile(path.join(projectRoot, 'recursos', 'global-menu-pages.json'), 'utf8'),
  );
} catch (error) {
  if (error.code !== 'ENOENT') throw error;
}

const pages = {
  ...corePages,
  ...Object.fromEntries(sidebarManifest.map((page) => [page.file, page.route])),
  ...Object.fromEntries(globalMenuManifest.map((page) => [page.file, page.route])),
};
const routeLookup = Object.fromEntries(Object.values(pages).map((route) => [route, route]));
// The app root intentionally shows the cloned background-check page. Keep the
// Investor.gov homepage on a separate local route so the Home breadcrumb can
// navigate without replacing the clone's entry page.
routeLookup['/'] = '/investor-home';
routeLookup['/research-before-you-invest/methods-investing/working-investment-professional'] =
  '/introduction-investing/getting-started/working-investment-professional';

const localOverrides = `
<style data-local-investor-overrides>
  #block-auxiliaryheader {
    display: none !important;
  }
  @media (min-width: 960px) {
    #block-investor-main-menu > ul.menu { display: flex; }
    #block-investor-main-menu > ul.menu > li { width: 20%; flex: 1 1 20%; }
    #block-investor-main-menu > ul.menu > li > a {
      display: flex; align-items: center; justify-content: center;
      padding: 10px 16px !important; min-height: 68px; height: auto !important;
    }
  }
  #block-investor-main-menu .menu-item-report-scam > a {
    font-weight: 700;
  }
  #block-investor-main-menu .menu-item-report-scam > a:focus-visible {
    outline: 3px solid #ffcf63;
    outline-offset: -4px;
  }
</style>`;

const localNavigation = `
<script data-local-investor-navigation>
(function () {
  var localRoutes = ${JSON.stringify(routeLookup)};

  function prepareLink(link) {
    try {
      var rawHref = link.getAttribute('href');
      if (!rawHref) return;
      if (rawHref.charAt(0) === '#') {
        link.href = window.location.href.split('#')[0] + rawHref;
        link.target = '_self';
        return;
      }
      if (link.hasAttribute('data-official-resource')) {
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        return;
      }

      var currentPage = window.top.location.href;
      var isLogo = link.matches('.banner-seal a, .banner-org-name a, a[rel="home"]');
      if (isLogo) {
        link.href = currentPage;
        link.target = '_top';
        return;
      }

      var url = new URL(link.href, document.baseURI);
      if (url.protocol !== 'http:' && url.protocol !== 'https:') return;
      if (url.origin === window.location.origin &&
          url.pathname === window.location.pathname && url.hash) {
        link.target = '_self';
        return;
      }
      if (url.origin === window.top.location.origin) {
        link.target = '_top';
        return;
      }

      var isInvestorLink =
        url.hostname === 'www.investor.gov' || url.hostname === 'investor.gov';
      var route = isInvestorLink ? localRoutes[url.pathname] : null;
      link.href = route
        ? window.top.location.origin + route + url.hash
        : window.top.location.origin + '/';
      link.target = '_top';
    } catch (error) {
      return;
    }
  }

  function prepareLinks() {
    document.querySelectorAll('a[href]').forEach(prepareLink);
  }

  document.addEventListener('DOMContentLoaded', prepareLinks);
  new MutationObserver(prepareLinks).observe(document.documentElement, {
    childList: true,
    subtree: true
  });
})();
</script>`;

await mkdir(outputDir, { recursive: true });

for (const slug of Object.keys(pages)) {
  const isScamPage = slug === 'report-a-scam';
  const isSidebarPage = slug.startsWith('sidebar-');
  const isGlobalMenuPage = slug.startsWith('global-');
  const sourcePath = path.join(
    sourceDir,
    ...(isSidebarPage
      ? ['sidebar-pages', `${slug}.html`]
      : isGlobalMenuPage
        ? ['global-menu-pages', `${slug}.html`]
        : [`${isScamPage ? 'check-out-your-investment-professional' : slug}.html`]),
  );
  const outputPath = path.join(outputDir, `${slug}.html`);
  let html = await readFile(sourcePath, 'utf8');

  // Extend only the global menu, leaving the article's sidebar intact.
  const menuStart = html.indexOf('id="block-investor-main-menu"');
  const menuEnd = html.indexOf('</nav>', menuStart);
  const menuClose = html.lastIndexOf('</ul>', menuEnd);
  if (menuStart < 0 || menuClose < menuStart) {
    throw new Error(`Missing global navigation in ${slug}`);
  }
  html = html.slice(0, menuClose).trimEnd() + `
    <li class="menu-item menu-item-report-scam menu-item-last menu-index-5">
      <a href="/report-a-scam"${isScamPage ? ' aria-current="page"' : ''}>Report a Scam</a>
    </li>
  ` + html.slice(menuClose);

  if (isScamPage) {
    const content = await readFile(path.join(projectRoot, 'scripts', 'report-a-scam.html'), 'utf8');
    html = html.replace(/<article\b[\s\S]*?<\/article>/, content);
    html = html.replace(/<title>[\s\S]*?<\/title>/, '<title>Report a Scam | Reporting &amp; Asset Recovery Guide</title>');
    html = html.replace(/<link rel="canonical"[^>]*>/, '');
    html = html.replace(/<meta name="description"[^>]*>/, '<meta name="description" content="Learn how to report a scam, preserve evidence, protect your accounts, and understand asset recovery options." />');
    html = html.replace(/(<nav class="breadcrumb"[\s\S]*?<ol>)[\s\S]*?<\/ol>/, '$1<li><a href="/">Home</a></li><li>Report a Scam</li></ol>');
  }

  const baseTag = '<base href="https://www.investor.gov/">';
  if (html.includes('<head>')) {
    html = html.replace('<head>', `<head>\n${baseTag}\n${localOverrides}`);
  } else {
    html = html.replace(
      /<html([^>]*)>/i,
      `<html$1>\n<head>\n${baseTag}\n${localOverrides}\n`,
    );
  }

  html = html.replace('</body>', `${localNavigation}\n</body>`);
  await writeFile(outputPath, html, 'utf8');
}

console.log(`Prepared ${Object.keys(pages).length} Investor.gov pages in ${outputDir}`);
