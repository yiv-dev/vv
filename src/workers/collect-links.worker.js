import { parentPort, workerData } from 'node:worker_threads';
import { chromium } from 'playwright';
import {
  extractPagerLinksFromPage,
  extractProductLinksFromPage,
  PRODUCT_SELECTOR,
} from '../lib/link-extractor.js';
import { generateUserAgent } from '../lib/user-agent.js';

const { paths, baseUrl, headers, timeoutMs, requestDelayMs } = workerData;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * @param {string} path
 * @returns {string}
 */
function resolveUrl(path) {
  return path.startsWith('http') ? path : `${baseUrl}${path}`;
}

/**
 * @param {string} path
 * @returns {string}
 */
function normalizePath(path) {
  if (path.startsWith('http')) {
    const url = new URL(path);
    return `${url.pathname}${url.search}`;
  }
  return path;
}

/**
 * @param {import('playwright').Browser} browser
 * @param {string} path
 * @returns {Promise<{ page: import('playwright').Page, context: import('playwright').BrowserContext }>}
 */
async function openPage(browser, path) {
  await sleep(requestDelayMs);

  const context = await browser.newContext({
    userAgent: generateUserAgent(),
    extraHTTPHeaders: headers,
  });
  const page = await context.newPage();

  await page.goto(resolveUrl(path), {
    waitUntil: 'load',
    timeout: timeoutMs,
  });
  await page.locator(PRODUCT_SELECTOR).first().waitFor({
    state: 'attached',
    timeout: timeoutMs,
  }).catch(() => { });

  return { page, context };
}

/**
 * @param {import('playwright').Browser} browser
 * @param {string} categoryPath
 * @returns {Promise<string[]>}
 */
async function collectFromCategory(browser, categoryPath) {
  const collected = new Set();
  const visited = new Set();

  const visit = async (path) => {
    const normalized = normalizePath(path);
    if (visited.has(normalized)) return;
    visited.add(normalized);

    const { page, context } = await openPage(browser, path);

    try {
      for (const href of await extractProductLinksFromPage(page)) {
        collected.add(href);
      }

      const pagerLinks = [...new Set(await extractPagerLinksFromPage(page))];
      for (const pagerPath of pagerLinks) {
        await visit(pagerPath);
      }
    } finally {
      await context.close();
    }
  };

  await visit(categoryPath);
  return [...collected];
}

async function run() {
  const browser = await chromium.launch({ headless: false });
  const allLinks = [];

  try {
    for (const path of paths) {
      try {
        parentPort?.postMessage({ type: 'progress', path });
        const links = await collectFromCategory(browser, path);
        console.log("🚀 ~ collect-links.worker.js:103 ~ run ~ links:", links);
        allLinks.push(...links);
        parentPort?.postMessage({ type: 'categoryDone', path, count: links.length });
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        parentPort?.postMessage({ type: 'error', path, message });
      }
    }
  } finally {
    await browser.close();
  }

  parentPort?.postMessage({ type: 'done', links: allLinks });
}

run();
