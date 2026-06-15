import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, '..');

export const config = {
  baseUrl: 'https://vkusvill.ru',
  linksFile: join(rootDir, 'startt-links.json'),
  outputDir: join(rootDir, 'output'),
  fetch: {
    timeoutMs: 30_000,
    headers: {
      'User-Agent': 'Mozilla/5.0 (compatible; vv-parsing/0.1)',
      Accept: 'text/html,application/xhtml+xml',
      'Accept-Language': 'ru-RU,ru;q=0.9',
    },
  },
};
