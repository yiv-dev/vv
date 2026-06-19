/** @typedef {import('./step-01-link.js').StepContext} StepContext */

const INFO_ITEM_SELECTOR = 'div.VV23_DetailProdPageInfoDescItem';
const INFO_TITLE_SELECTOR = 'button.VV23_DetailProdPageInfoDescItem__Title._link';
const INFO_DESC_SELECTOR = 'div.VV23_DetailProdPageInfoDescItem__Desc';

/**
 * @param {StepContext} ctx
 */
export async function run(ctx) {
  const infoItems = ctx.page.locator(INFO_ITEM_SELECTOR);
  const itemCount = await infoItems.count();
  const info = [];

  for (let index = 0; index < itemCount; index += 1) {
    const item = infoItems.nth(index);
    const desc = item.locator(INFO_DESC_SELECTOR).first();
    const text = (await desc.textContent())?.trim() ?? '';

    const titleEl = item.locator(INFO_TITLE_SELECTOR).first();
    if ((await titleEl.count()) > 0) {
      const title = (await titleEl.textContent())?.trim() ?? '';
      if (title && text) {
        info.push(`${title} -- ${text}`);
      }
      continue;
    }

    if (text) {
      info.push(text);
    }
  }

  ctx.product.info = info;
}
