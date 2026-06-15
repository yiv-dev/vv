import * as cheerio from 'cheerio';

const PRODUCT_SELECTOR = 'a.ProductCard__imageLink.js-product-detail-link';
const PAGER_SELECTOR = 'div.VV_Pager.js-lk-pager a';

/**
 * @param {string} html
 * @returns {string[]}
 */
export function extractProductLinks(html) {
  const $ = cheerio.load(html);
  console.log("🚀 ~ extractProductLinks ~ $:", $(PRODUCT_SELECTOR));
  return $(PRODUCT_SELECTOR)
    .map((_, el) => $(el).attr('href')?.trim())
    .get()
    .filter(Boolean);
}

/**
 * @param {string} html
 * @returns {string[]}
 */
export function extractPagerLinks(html) {
  const $ = cheerio.load(html);
  return $(PAGER_SELECTOR)
    .map((_, el) => $(el).attr('href')?.trim())
    .get()
    .filter(Boolean);
}
