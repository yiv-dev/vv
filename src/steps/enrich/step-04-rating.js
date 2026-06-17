/** @typedef {import('./step-01-link.js').StepContext} StepContext */

const RATING_SELECTOR = 'div.Product__rating > a > meta:nth-child(2)';

/**
 * @param {StepContext} ctx
 */
export async function run(ctx) {
  const locator = ctx.page.locator(RATING_SELECTOR).first();
  const content = await locator.getAttribute('content');
  const text = (await locator.textContent())?.trim() ?? '';
  ctx.product.rating = (content ?? text).trim();
}
