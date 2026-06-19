/** @typedef {import('./step-01-link.js').StepContext} StepContext */

const TITLE_SELECTOR = 'h1.Product__title.js-datalayer-catalog-list-name';

/**
 * @param {StepContext} ctx
 */
export async function run(ctx) {
  const locator = ctx.page.locator(TITLE_SELECTOR);

  if ((await locator.count()) === 0) {
    ctx.product.title = '';
    return;
  }

  ctx.product.title = (await locator.first().textContent())?.trim() ?? '';
}
