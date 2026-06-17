export const PRODUCT_SELECTOR = 'a.ProductCard__imageLink.js-product-detail-link';
export const PAGER_SELECTOR = 'div.VV_Pager.js-lk-pager a';

/**
 * @param {import('playwright').Page} page
 * @returns {Promise<string[]>}
 */
export async function extractProductLinksFromPage(page) {
  return page.locator(PRODUCT_SELECTOR).evaluateAll((elements) =>
    elements
      .map((el) => el.getAttribute('href')?.trim())
      .filter(Boolean),
  );
}

/**
 * @param {import('playwright').Page} page
 * @returns {Promise<string[]>}
 */
export async function extractPagerLinksFromPage(page) {
  return page.locator(PAGER_SELECTOR).evaluateAll((elements) =>
    elements
      .map((el) => el.getAttribute('href')?.trim())
      .filter(Boolean),
  );
}
