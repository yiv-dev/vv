import { config } from './config.js';

/**
 * @param {string} path - Site path or full URL
 * @returns {Promise<string>}
 */
export async function fetchPage(path) {
  const url = path.startsWith('http') ? path : `${config.baseUrl}${path}`;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), config.fetch.timeoutMs);

  try {
    const response = await fetch(url, {
      headers: config.fetch.headers,
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status} for ${url}`);
    }

    return await response.text();
  } finally {
    clearTimeout(timeout);
  }
}
