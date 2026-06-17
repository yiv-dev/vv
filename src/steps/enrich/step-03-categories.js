/** @typedef {import('./step-01-link.js').StepContext} StepContext */

const BREADCRUMBS_SELECTOR =
  'div.Breadcrumbs.swiper-container.js-main-breadcrumbs.js-main-breadcrumbs-slider span';

/**
 * @param {StepContext} ctx
 */
export async function run(ctx) {
  const texts = await ctx.page.locator(BREADCRUMBS_SELECTOR).allTextContents();
  const trimmed = texts.map((text) => text.trim()).filter(Boolean);
  ctx.product.categories = [...new Set(trimmed)];
}
