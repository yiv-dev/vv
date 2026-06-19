/** @typedef {import('./step-01-link.js').StepContext} StepContext */

const RATING_SELECTOR = 'div.Rating__text';

/**
 * @param {StepContext} ctx
 */
export async function run(ctx) {
  const locator = ctx.page.locator(RATING_SELECTOR);

  if ((await locator.count()) === 0) {
    ctx.product.rating = '';
    return;
  }

  ctx.product.rating = (await locator.first().textContent())?.trim() ?? '';
}
