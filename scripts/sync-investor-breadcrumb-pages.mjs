import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const investorOrigin = 'https://www.investor.gov';

const globalMenuManifest = JSON.parse(
  await readFile(path.join(projectRoot, 'recursos', 'global-menu-pages.json'), 'utf8'),
);
const introductionPage = globalMenuManifest.find(
  (page) => page.route === '/introduction-investing',
);

if (!introductionPage) {
  throw new Error('The Introduction to Investing page is missing from the global menu manifest.');
}

const pages = [
  { route: '/', output: path.join(projectRoot, 'recursos', 'home.html') },
  {
    route: introductionPage.route,
    output: path.join(
      projectRoot,
      'recursos',
      'global-menu-pages',
      `${introductionPage.file}.html`,
    ),
  },
  {
    route: '/introduction-investing/getting-started/working-investment-professional',
    output: path.join(projectRoot, 'recursos', 'working-investment-professional.html'),
  },
  {
    route:
      '/introduction-investing/getting-started/working-investment-professional/check-out-your-investment-professional',
    output: path.join(projectRoot, 'recursos', 'check-out-your-investment-professional.html'),
  },
];

for (const page of pages) {
  const response = await fetch(new URL(page.route, investorOrigin), {
    headers: { 'user-agent': 'Mozilla/5.0 local-reference-clone' },
  });

  if (!response.ok) {
    throw new Error(`${response.status} ${response.statusText}: ${page.route}`);
  }

  await mkdir(path.dirname(page.output), { recursive: true });
  await writeFile(page.output, await response.text(), 'utf8');
  process.stdout.write(`Downloaded ${page.route}\n`);
}
