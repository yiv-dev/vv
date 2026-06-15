import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { config } from './config.js';
import { fetchPage } from './fetcher.js';
import { parseCategoryPage } from './parser.js';

async function loadCategoryPaths() {
  const raw = await readFile(config.linksFile, 'utf-8');
  const paths = JSON.parse(raw);
  return [...new Set(paths)];
}

async function main() {
  const paths = await loadCategoryPaths();
  const target = paths[0];

  if (!target) {
    throw new Error('No category paths in startt-links.json');
  }

  console.log(`Fetching ${config.baseUrl}${target}...`);
  const html = await fetchPage(target);
  const parsed = parseCategoryPage(html);

  await mkdir(config.outputDir, { recursive: true });
  const outFile = `${config.outputDir}/sample.json`;
  await writeFile(outFile, JSON.stringify({ path: target, ...parsed }, null, 2));

  console.log(`Parsed "${parsed.title}" — ${parsed.links.length} links → ${outFile}`);
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
