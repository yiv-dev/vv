import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, '..');

/**
 * @param {string | undefined} raw
 * @param {number} fallback
 * @returns {number}
 */
function parsePositiveInt(raw, fallback) {
  if (raw === undefined || raw === '') {
    return fallback;
  }

  const value = Number(raw);
  if (!Number.isInteger(value) || value < 1) {
    throw new Error('ENRICH_RESULT_ROWS_PER_FILE must be a positive integer');
  }

  return value;
}

export const config = {
  baseUrl: 'https://vkusvill.ru',
  linksFile: join(rootDir, 'start-links.json'),
  collectedLinksFile: join(rootDir, 'collected_links.json'),
  outputDir: join(rootDir, 'output'),
  requestDelayMs: 15_000,
  workerThreads: 1,
  fetch: {
    timeoutMs: 10_000,
    headers: {
      Accept: 'text/html,application/xhtml+xml',
      'Accept-Language': 'ru-RU,ru;q=0.9',
    },
  },
  enrich: {
    workerThreads: 1,
    headless: true,
    outputDir: join(rootDir, 'output'),
    actionTimeoutMs: 60_000,
    resultRowsPerFile: parsePositiveInt(process.env.ENRICH_RESULT_ROWS_PER_FILE, 10),
  },
};
