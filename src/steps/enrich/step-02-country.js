/** @typedef {import('./step-01-link.js').StepContext} StepContext */

import { SkipProductError } from '../../lib/skip-product-error.js';

const COUNTRY_TITLE = 'Страна производства';
const INFO_ITEM_SELECTOR = 'div.VV23_DetailProdPageInfoDescItem';
const TITLE_SELECTOR = 'h4.VV23_DetailProdPageInfoDescItem__Title';
const DESC_SELECTOR = 'div.VV23_DetailProdPageInfoDescItem__Desc';

/**
 * @param {string} text
 * @returns {boolean}
 */
function isRussianCountry(text) {
  const lower = text.toLowerCase();
  return lower.includes('россия') || lower.includes('рф');
}

/**
 * @param {StepContext} ctx
 */
export async function run(ctx) {
  const infoItems = ctx.page.locator(INFO_ITEM_SELECTOR);
  const itemCount = await infoItems.count();

  for (let index = 0; index < itemCount; index += 1) {
    const item = infoItems.nth(index);

    if ((await item.locator(TITLE_SELECTOR).count()) === 0) {
      continue;
    }

    const title = item.locator(TITLE_SELECTOR).first();
    const titleText = (await title.textContent())?.trim() ?? '';

    if (titleText !== COUNTRY_TITLE) {
      continue;
    }

    try {
      await title.click({ timeout: ctx.timeoutMs });
    } catch {
      ctx.product.country = '';
      return;
    }

    if ((await item.locator(DESC_SELECTOR).count()) === 0) {
      ctx.product.country = '';
      return;
    }

    const desc = item.locator(DESC_SELECTOR).first();
    const countryText = (await desc.textContent())?.trim() ?? '';

    if (!countryText) {
      ctx.product.country = '';
      return;
    }

    if (!isRussianCountry(countryText)) {
      throw new SkipProductError(`Non-Russian country "${countryText}" for ${ctx.product.link}`);
    }

    ctx.product.country = countryText;
    return;
  }

  ctx.product.country = '';
}
