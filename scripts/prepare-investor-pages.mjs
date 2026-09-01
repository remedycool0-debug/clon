import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const sourceDir = path.join(projectRoot, 'recursos');
const outputDir = path.join(projectRoot, 'public', 'investor-pages');

const corePages = {
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

const localOverrides = `
<style data-local-investor-overrides>
  #block-auxiliaryheader {
    display: none !important;
  }
</style>`;

const localNavigation = `
<script data-local-investor-navigation>
(function () {
  var localRoutes = ${JSON.stringify(routeLookup)};

  function routeFor(link) {
    try {
      var url = new URL(link.href, document.baseURI);
      return url.hostname === 'www.investor.gov' && localRoutes[url.pathname]
        ? localRoutes[url.pathname]
        : null;
    } catch (error) {
      return null;
    }
  }

  function prepareLinks() {
    document.querySelectorAll('a[href]').forEach(function (link) {
      var route = routeFor(link);
      if (!route) return;
      link.href = window.top.location.origin + route;
      link.target = '_top';
    });
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
  const isSidebarPage = slug.startsWith('sidebar-');
  const isGlobalMenuPage = slug.startsWith('global-');
  const sourcePath = path.join(
    sourceDir,
    ...(isSidebarPage
      ? ['sidebar-pages', `${slug}.html`]
      : isGlobalMenuPage
        ? ['global-menu-pages', `${slug}.html`]
        : [`${slug}.html`]),
  );
  const outputPath = path.join(outputDir, `${slug}.html`);
  let html = await readFile(sourcePath, 'utf8');

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
