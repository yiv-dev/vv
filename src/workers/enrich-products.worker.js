import { parentPort, workerData } from 'node:worker_threads';
import { chromium } from 'playwright';
import { SkipProductError } from '../lib/skip-product-error.js';
import { generateUserAgent } from '../lib/user-agent.js';
import { run as step01 } from '../steps/enrich/step-01-link.js';
import { run as step02Country } from '../steps/enrich/step-02-country.js';
import { run as step02 } from '../steps/enrich/step-02-title.js';
import { run as step03 } from '../steps/enrich/step-03-categories.js';
import { run as step04 } from '../steps/enrich/step-04-rating.js';
import { run as step05 } from '../steps/enrich/step-05-details.js';
import { run as step06Info } from '../steps/enrich/step-06-info.js';
import { run as step07 } from '../steps/enrich/step-07-reviews.js';
import { run as step08 } from '../steps/enrich/step-08-collect.js';

const { links, baseUrl, headers, timeoutMs, requestDelayMs, headless } = workerData;

const STEPS = [step01, step02Country, step02, step03, step04, step05, step06Info, step07, step08];

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * @param {string} link
 * @returns {string}
 */
function resolveUrl(link) {
  return link.startsWith('http') ? link : `${baseUrl}${link}`;
}

/**
 * @param {import('playwright').Browser} browser
 * @param {string} link
 * @returns {Promise<import('../steps/enrich/step-01-link.js').Product | null>}
 */
async function enrichLink(browser, link) {
  await sleep(requestDelayMs);

  const context = await browser.newContext({
    userAgent: generateUserAgent(),
    extraHTTPHeaders: headers,
  });
  const page = await context.newPage();
  page.setDefaultTimeout(timeoutMs);
  page.setDefaultNavigationTimeout(timeoutMs);

  /** @type {import('../steps/enrich/step-01-link.js').Product} */
  let product = {};
  const products = [];

  try {
    await page.goto(resolveUrl(link), {
      waitUntil: 'load',
      timeout: timeoutMs,
    });

    const ctx = {
      page,
      product,
      products,
      baseUrl,
      link,
      timeoutMs,
    };

    for (const step of STEPS) {
      await step(ctx);
      product = ctx.product;
    }

    return product;
  } finally {
    await context.close();
  }
}

async function run() {
  const browser = await chromium.launch({ headless });
  const enrichedProducts = [];

  try {
    for (const link of links) {
      try {
        parentPort?.postMessage({ type: 'progress', link });
        const product = await enrichLink(browser, link);
        enrichedProducts.push(product);
        parentPort?.postMessage({ type: 'product', product });
      } catch (err) {
        if (err instanceof SkipProductError) {
          parentPort?.postMessage({ type: 'skip', link, message: err.message });
          continue;
        }

        const message = err instanceof Error ? err.message : String(err);
        parentPort?.postMessage({ type: 'error', link, message });
      }
    }
  } finally {
    await browser.close();
  }

  parentPort?.postMessage({ type: 'done', products: enrichedProducts });
}

run();
