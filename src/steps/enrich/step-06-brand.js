/** @typedef {import('./step-01-link.js').StepContext} StepContext */

const BRAND_SELECTOR =
  'div.VV23_DetailProdPageAccordion__Body.js-vv23-detail-prod-page-accordion__content > div > div:nth-child(6) > div';

const INFO_ITEM_SELECTOR = 'div.VV23_DetailProdPageInfoDescItem';
const INFO_DESC_SELECTOR = 'div.VV23_DetailProdPageInfoDescItem__Desc';

/**
 * @param {StepContext} ctx
 */
export async function run(ctx) {
  const brand = ctx.page.locator(BRAND_SELECTOR);

  if ((await brand.count()) > 0) {
    ctx.product.brand = (await brand.first().textContent())?.trim() ?? '';
    return;
  }

  const infoItems = ctx.page.locator(INFO_ITEM_SELECTOR);
  const itemCount = await infoItems.count();
  const info = [];

  for (let index = 0; index < itemCount; index += 1) {
    const desc = infoItems.nth(index).locator(INFO_DESC_SELECTOR).first();
    const text = (await desc.textContent())?.trim() ?? '';
    if (text) {
      info.push(text);
    }
  }

  ctx.product.brand = '';
  ctx.product.info = info;
}
