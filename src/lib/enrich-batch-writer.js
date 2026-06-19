import { writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { createEnrichPartFilenameFactory } from './format-output-filename.js';

/**
 * @param {object} options
 * @param {string} options.outputDir
 * @param {number} options.rowsPerFile
 * @param {Date} [options.runDate]
 */
export function createEnrichBatchWriter({ outputDir, rowsPerFile, runDate = new Date() }) {
  const nextFilename = createEnrichPartFilenameFactory(runDate);
  /** @type {object[]} */
  let buffer = [];
  /** @type {Set<string>} */
  const seenLinks = new Set();
  let chain = Promise.resolve();
  let totalSaved = 0;
  let filesWritten = 0;

  const flushBuffer = async () => {
    if (buffer.length === 0) {
      return;
    }

    const batch = buffer;
    buffer = [];
    const outputPath = join(outputDir, nextFilename());
    await writeFile(outputPath, JSON.stringify(batch, null, 2));
    totalSaved += batch.length;
    filesWritten += 1;
    console.log(`Saved ${batch.length} products → ${outputPath}`);
  };

  return {
    enqueue(product) {
      chain = chain.then(async () => {
        if (seenLinks.has(product.link)) {
          return;
        }

        seenLinks.add(product.link);
        buffer.push(product);

        if (buffer.length >= rowsPerFile) {
          await flushBuffer();
        }
      });

      return chain;
    },
    finish() {
      return chain.then(() => flushBuffer()).then(() => ({ totalSaved, filesWritten }));
    },
  };
}
