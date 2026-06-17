/** @typedef {import('./step-01-link.js').StepContext} StepContext */
/** @typedef {import('playwright').Page} Page */

import { parseReviewDate } from '../../lib/parse-review-date.js';

const REVIEWS_TAB_SELECTOR =
  '#product-detail-tabs > div > div.VV23_DetailProdPageInfoTabs__Header.js-vv23-detail-prod-tabs__header > div > div > div:nth-child(2) > button';

const LOAD_MORE_SELECTOR = 'div.js-product-api-reviews-more > button';
const REVIEW_ITEM_SELECTOR = 'div.ReviewsApiCat4List div.ReviewsApiCat4ListItem.js-product-api-review';
const RATE_SELECTOR = 'div.ReviewsApiCat4ListItemRate';
const BODY_SELECTOR = 'div.ReviewsApiCat4ListItemBody';
const DATE_SELECTOR = 'div.ReviewsApiCat4ListItemCardDate';

const LOW_RATES = new Set(['1', '2', '3']);

/**
 * @param {unknown} err
 * @returns {boolean}
 */
function isTimeoutError(err) {
  return err instanceof Error && err.name === 'TimeoutError';
}

/**
 * @param {Page} page
 * @returns {Promise<object[]>}
 */
async function collectReviewsFromPage(page) {
  const reviews = [];
  const reviewItems = page.locator(REVIEW_ITEM_SELECTOR);
  const count = await reviewItems.count();

  for (let index = 0; index < count; index += 1) {
    const item = reviewItems.nth(index);
    const rate = (await item.locator(RATE_SELECTOR).first().textContent())?.trim() ?? '';

    if (!LOW_RATES.has(rate)) {
      continue;
    }

    const text = (await item.locator(BODY_SELECTOR).first().textContent())?.trim() ?? '';
    const date = (await item.locator(DATE_SELECTOR).first().textContent())?.trim() ?? '';

    reviews.push({
      rate,
      text,
      date,
      formated_date: parseReviewDate(date),
    });
  }

  return reviews;
}

/**
 * @param {StepContext} ctx
 */
export async function run(ctx) {
  try {
    const reviewsTab = ctx.page.locator(REVIEWS_TAB_SELECTOR).first();
    if (await reviewsTab.isVisible()) {
      await reviewsTab.click({ timeout: ctx.timeoutMs });
      await ctx.page.waitForTimeout(500);
    }

    const loadMore = ctx.page.locator(LOAD_MORE_SELECTOR).first();
    while (await loadMore.isVisible().catch(() => false)) {
      try {
        await loadMore.click({ timeout: ctx.timeoutMs });
        await ctx.page.waitForTimeout(500);
      } catch (err) {
        if (isTimeoutError(err)) {
          break;
        }
        throw err;
      }
    }
  } catch (err) {
    if (!isTimeoutError(err)) {
      throw err;
    }
  }

  ctx.product.reviews = await collectReviewsFromPage(ctx.page);
}
