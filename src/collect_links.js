import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { Worker } from 'node:worker_threads';
import { config } from './config.js';

const workerFile = fileURLToPath(new URL('./workers/collect-links.worker.js', import.meta.url));
const outputFile = config.collectedLinksFile;
const MIN_WORKER_THREADS = 1;
const MAX_WORKER_THREADS = 10;

/**
 * @param {number} pathCount
 * @returns {number}
 */
function resolveWorkerCount(pathCount) {
  const clamped = Math.min(
    MAX_WORKER_THREADS,
    Math.max(MIN_WORKER_THREADS, config.workerThreads),
  );
  return Math.min(clamped, pathCount);
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
 * @param {string[]} paths
 * @returns {Promise<string[]>}
 */
function runWorkers(paths) {
  const workerCount = resolveWorkerCount(paths.length);
  const chunks = chunkItems(paths, workerCount);

  return new Promise((resolve, reject) => {
    const collected = [];
    let pending = chunks.length;
    let failed = false;

    for (const chunk of chunks) {
      const worker = new Worker(workerFile, {
        workerData: {
          paths: chunk,
          baseUrl: config.baseUrl,
          headers: config.fetch.headers,
          timeoutMs: config.fetch.timeoutMs,
          requestDelayMs: config.requestDelayMs,
        },
      });

      worker.on('message', (message) => {
        if (message.type === 'progress') {
          console.log(`[worker] ${message.path}`);
        }
        if (message.type === 'categoryDone') {
          console.log(`[worker] ${message.path} → ${message.count} links`);
        }
        if (message.type === 'error') {
          console.error(`[worker] ${message.path}: ${message.message}`);
        }
        if (message.type === 'done') {
          collected.push(...message.links);
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
          resolve(collected);
        }
      });
    }
  });
}

async function main() {
  const raw = await readFile(config.linksFile, 'utf-8');
  const paths = [...new Set(JSON.parse(raw))];

  if (paths.length === 0) {
    throw new Error('No links in startt-links.json');
  }

  console.log(`Collecting from ${paths.length} categories with ${resolveWorkerCount(paths.length)} worker threads...`);
  const links = await runWorkers(paths);
  const uniqueLinks = [...new Set(links)].sort();

  await writeFile(outputFile, JSON.stringify(uniqueLinks, null, 2));
  console.log(`Saved ${uniqueLinks.length} links → ${outputFile}`);
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
