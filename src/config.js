import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, '..');

export const config = {
  baseUrl: 'https://vkusvill.ru',
  linksFile: join(rootDir, 'start-links.json'),
  collectedLinksFile: join(rootDir, 'collected_links.json'),
  outputDir: join(rootDir, 'output'),
  requestDelayMs: 35_000,
  workerThreads: 1,
  fetch: {
    timeoutMs: 120_000,
    headers: {
      Accept: 'text/html,application/xhtml+xml',
      'Accept-Language': 'ru-RU,ru;q=0.9',
    },
  },
};
