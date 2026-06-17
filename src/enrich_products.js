import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { isAbsolute, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { Worker } from 'node:worker_threads';
import { config } from './config.js';
import { formatOutputFilename } from './lib/format-output-filename.js';

const workerFile = fileURLToPath(new URL('./workers/enrich-products.worker.js', import.meta.url));
const rootDir = join(fileURLToPath(new URL('.', import.meta.url)), '..');
const MIN_WORKER_THREADS = 1;
const MAX_WORKER_THREADS = 10;

/**
 * @param {number} linkCount
 * @returns {number}
 */
function resolveWorkerCount(linkCount) {
  const clamped = Math.min(
    MAX_WORKER_THREADS,
    Math.max(MIN_WORKER_THREADS, config.enrich.workerThreads),
  );
  return Math.min(clamped, linkCount);
}

/**
 * @param {string[]} items
 * @param {number} chunkCount
 * @returns {string[][]}
 */
function chunkItems(items, chunkCount) {
  const chunks = Array.from({ length: chunkCount }, () => []);
  for (const [index, item] of items.entries()) {
    chunks[index % chunkCount].push(item);
  }
  return chunks.filter((chunk) => chunk.length > 0);
}

/**
 * @param {string} inputPath
 * @returns {string}
 */
function resolveInputPath(inputPath) {
  return isAbsolute(inputPath) ? inputPath : resolve(rootDir, inputPath);
}

/**
 * @param {string[]} links
 * @returns {Promise<object[]>}
 */
function runWorkers(links) {
  const workerCount = resolveWorkerCount(links.length);
  const chunks = chunkItems(links, workerCount);

  return new Promise((resolvePromise, reject) => {
    const products = [];
    let pending = chunks.length;
    let failed = false;

    for (const chunk of chunks) {
      const worker = new Worker(workerFile, {
        workerData: {
          links: chunk,
          baseUrl: config.baseUrl,
          headers: config.fetch.headers,
          timeoutMs: config.enrich.actionTimeoutMs,
          requestDelayMs: config.requestDelayMs,
          headless: config.enrich.headless,
        },
      });

      worker.on('message', (message) => {
        if (message.type === 'progress') {
          console.log(`[worker] ${message.link}`);
        }
        if (message.type === 'product') {
          products.push(message.product);
          console.log(JSON.stringify(message.product, null, 2));
        }
        if (message.type === 'error') {
          console.error(`[worker] ${message.link}: ${message.message}`);
        }
      });

      worker.on('error', (err) => {
        failed = true;
        reject(err);
      });

      worker.on('exit', (code) => {
        if (code !== 0 && !failed) {
          failed = true;
          reject(new Error(`Worker stopped with code ${code}`));
          return;
        }

        pending -= 1;
        if (pending === 0 && !failed) {
          resolvePromise(products);
        }
      });
    }
  });
}

async function main() {
  const inputArg = process.argv[2];

  if (!inputArg) {
    throw new Error('Usage: npm run enrich-products -- <links-file.json>');
  }

  const inputPath = resolveInputPath(inputArg);
  const raw = await readFile(inputPath, 'utf-8');
  const links = [...new Set(JSON.parse(raw))];

  if (links.length === 0) {
    throw new Error(`No links in ${inputPath}`);
  }

  const outputFilename = formatOutputFilename();
  await mkdir(config.enrich.outputDir, { recursive: true });
  const outputPath = join(config.enrich.outputDir, outputFilename);

  console.log(
    `Enriching ${links.length} products with ${resolveWorkerCount(links.length)} worker threads...`,
  );
  console.log(`Output file: ${outputPath}`);

  const products = await runWorkers(links);
  const uniqueProducts = [...new Map(products.map((product) => [product.link, product])).values()];

  await writeFile(outputPath, JSON.stringify(uniqueProducts, null, 2));
  console.log(`Saved ${uniqueProducts.length} products → ${outputPath}`);
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
