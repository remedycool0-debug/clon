import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const sourceDir = path.join(projectRoot, 'recursos');
const investorOrigin = 'https://www.investor.gov';

const pages = [
  {
    file: 'research-using-edgar',
    route:
      '/introduction-investing/getting-started/researching-investments/using-edgar-research-investments',
  },
  {
    file: 'research-ask-and-check',
    route: '/introduction-investing/getting-started/researching-investments/ask-and-check',
  },
  {
    file: 'research-using-emma',
    route:
      '/introduction-investing/getting-started/researching-investments/using-emma-researching-municipal',
  },
  {
    file: 'research-how-read-10-k',
    route: '/introduction-investing/getting-started/researching-investments/how-read-10-k',
  },
  {
    file: 'research-how-read-8-k',
    route:
      '/introduction-investing/general-resources/news-alerts/alerts-bulletins/investor-bulletins/how-read-8',
  },
  {
    file: 'research-insider-transactions',
    route:
      '/introduction-investing/general-resources/news-alerts/alerts-bulletins/investor-bulletins-69',
  },
];

await mkdir(sourceDir, { recursive: true });

for (const page of pages) {
  const response = await fetch(new URL(page.route, investorOrigin), {
    headers: { 'user-agent': 'Mozilla/5.0 local-reference-clone' },
  });

  if (!response.ok) {
    throw new Error(`${response.status} ${response.statusText}: ${page.route}`);
  }

  await writeFile(path.join(sourceDir, `${page.file}.html`), await response.text(), 'utf8');
  process.stdout.write(`Downloaded ${page.route}\n`);
}
