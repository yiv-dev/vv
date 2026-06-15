const pick = (items) => items[Math.floor(Math.random() * items.length)];

/**
 * @returns {string}
 */
export function generateUserAgent() {
  const chromeMajor = 120 + Math.floor(Math.random() * 15);
  const firefoxMajor = 120 + Math.floor(Math.random() * 10);
  const build = Math.floor(Math.random() * 9999);

  const agents = [
    `Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/${chromeMajor}.0.${build}.0 Safari/537.36`,
    `Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/${chromeMajor}.0.${build}.0 Safari/537.36`,
    `Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/${chromeMajor}.0.${build}.0 Safari/537.36`,
    `Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:${firefoxMajor}.0) Gecko/20100101 Firefox/${firefoxMajor}.0`,
    `Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:${firefoxMajor}.0) Gecko/20100101 Firefox/${firefoxMajor}.0`,
    `Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.${Math.floor(Math.random() * 5)} Safari/605.1.15`,
  ];

  return pick(agents);
}
