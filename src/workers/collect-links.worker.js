import axios from 'axios';
import { parentPort, workerData } from 'node:worker_threads';
import { extractPagerLinks, extractProductLinks } from '../lib/link-extractor.js';
import { generateUserAgent } from '../lib/user-agent.js';

const { paths, baseUrl, headers, timeoutMs, requestDelayMs } = workerData;

const client = axios.create({
  baseURL: baseUrl,
  timeout: timeoutMs,
  validateStatus: (status) => status >= 200 && status < 400,
});

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * @param {string} path
 * @returns {Promise<string>}
 */
async function fetchPage(path) {
  await sleep(requestDelayMs);
  const response = await client.get(path, {
    headers: {
      ...headers,
      'User-Agent': generateUserAgent(),
    },
  });
  return response.data;
}

/**
 * @param {string} categoryPath
 * @returns {Promise<string[]>}
 */
async function collectFromCategory(categoryPath) {
  const collected = new Set();
  const visited = new Set();

  const visit = async (path) => {
    const normalized = path.startsWith('http') ? new URL(path).pathname + new URL(path).search : path;
    if (visited.has(normalized)) return;
    visited.add(normalized);

    const html = await fetchPage(path);
    for (const href of extractProductLinks(html)) {
      collected.add(href);
    }

    const pagerLinks = [...new Set(extractPagerLinks(html))];
    for (const pagerPath of pagerLinks) {
      await visit(pagerPath);
    }
  };

  await visit(categoryPath);
  return [...collected];
}

async function run() {
  const allLinks = [];

  for (const path of paths) {
    try {
      parentPort?.postMessage({ type: 'progress', path });
      const links = await collectFromCategory(path);
      allLinks.push(...links);
      parentPort?.postMessage({ type: 'categoryDone', path, count: links.length });
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      parentPort?.postMessage({ type: 'error', path, message });
    }
  }

  parentPort?.postMessage({ type: 'done', links: allLinks });
}

run();
