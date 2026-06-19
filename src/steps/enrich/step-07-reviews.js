/** @typedef {import('./step-01-link.js').StepContext} StepContext */
/** @typedef {import('playwright').Page} Page */

const REVIEWS_TAB_SELECTOR =
  '#product-detail-tabs > div > div.VV23_DetailProdPageInfoTabs__Header.js-vv23-detail-prod-tabs__header > div > div > div:nth-child(2) > button';

const RATING_MARKS_SELECTOR = 'div.ReviewsApiCat4Row div.ReviewsApiCat4RatingBlock:not(.hidden) > div.ReviewsApiCat4RatingMarks';
const RATING_MARK_SELECTOR = 'div.ReviewsApiCat4RatingMark';
const FILLED_STAR_SELECTOR = 'svg.ReviewsApiCat4Stars__Icon._fill';
const COUNT_SELECTOR = 'div.ReviewsApiCat4RatingMark__Count';

/**
 * @param {Page} page
 * @returns {Promise<Record<string, string>>}
 */
async function collectRatingMarks(page) {
  const reviews_obj = {};

  const container = page.locator(RATING_MARKS_SELECTOR).first();
  if ((await container.count()) === 0) {
    return reviews_obj;
  }

  const marks = container.locator(RATING_MARK_SELECTOR);
  const markCount = await marks.count();

  for (let index = 0; index < markCount; index += 1) {
    const mark = marks.nth(index);
    const rating_value = String(await mark.locator(FILLED_STAR_SELECTOR).count());

    const countEl = mark.locator(COUNT_SELECTOR).first();
    if ((await countEl.count()) === 0) {
      continue;
    }

    reviews_obj[rating_value] = (await countEl.textContent())?.trim() ?? '';
  }

  return reviews_obj;
}

/**
 * @param {StepContext} ctx
 */
export async function run(ctx) {
  const reviews_obj = {};

  try {
    const reviewsTab = ctx.page.locator(REVIEWS_TAB_SELECTOR).first();
    if (await reviewsTab.isVisible()) {
      await reviewsTab.click({ timeout: ctx.timeoutMs });
      await ctx.page.waitForTimeout(500);
    }

    Object.assign(reviews_obj, await collectRatingMarks(ctx.page));
  } catch {
    // Missing reviews tab or rating marks — keep empty object.
  }

  ctx.product.reviews = reviews_obj;
}
