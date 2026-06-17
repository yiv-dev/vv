/** @typedef {import('./step-01-link.js').StepContext} StepContext */

const TITLE_SELECTOR = 'h1.Product__title.js-datalayer-catalog-list-name';

/**
 * @param {StepContext} ctx
 */
export async function run(ctx) {
  const locator = ctx.page.locator(TITLE_SELECTOR).first();
  await locator.waitFor({ state: 'visible', timeout: ctx.timeoutMs });
  const title = (await locator.textContent())?.trim() ?? '';

  if (!title) {
    throw new Error(`Title not found for ${ctx.product.link}`);
  }

  ctx.product.title = title;
}
