/** @typedef {import('./step-01-link.js').StepContext} StepContext */

const BREADCRUMBS_SELECTOR =
  'div.Breadcrumbs.swiper-container.js-main-breadcrumbs.js-main-breadcrumbs-slider span';

/**
 * @param {StepContext} ctx
 */
export async function run(ctx) {
  const texts = await ctx.page.locator(BREADCRUMBS_SELECTOR).allTextContents();
  const trimmed = [...new Set(texts.map((text) => text.trim()).filter(Boolean))];
  /** @type {Record<string, string>} */
  const categories = {};

  for (const [index, text] of trimmed.entries()) {
    categories[`category_${index + 1}`] = text;
  }

  ctx.product.categories = categories;
}
