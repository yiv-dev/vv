import * as cheerio from 'cheerio';

/**
 * @param {string} html
 * @returns {{ title: string, links: string[] }}
 */
export function parseCategoryPage(html) {
  const $ = cheerio.load(html);
  const title = $('title').text().trim();

  const links = $('a[href^="/goods/"]')
    .map((_, el) => $(el).attr('href'))
    .get()
    .filter((href, index, arr) => arr.indexOf(href) === index);

  return { title, links };
}
