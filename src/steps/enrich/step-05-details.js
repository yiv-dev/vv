/** @typedef {import('./step-01-link.js').StepContext} StepContext */

const ACCORDION_BODY =
  '#vv23-detail-page-tabs-id-1 > div > div > div > div:nth-child(1) > div > div.VV23_DetailProdPageAccordion__Body.js-vv23-detail-prod-page-accordion__content';

const DETAILS_TOGGLE = `${ACCORDION_BODY} > div > div:nth-child(5) > h4`;
const DETAILS_CONTENT = `${ACCORDION_BODY} > div > div:nth-child(5) > div`;

const FALLBACK_DETAILS_SELECTOR = 'div.VV23_DetailProdPageInfoDescItem__Desc._sostav';

/**
 * @param {StepContext} ctx
 */
export async function run(ctx) {
  const toggle = ctx.page.locator(DETAILS_TOGGLE);

  if ((await toggle.count()) > 0) {
    const toggleFirst = toggle.first();
    if (await toggleFirst.isVisible()) {
      await toggleFirst.click();
    }

    const details = ctx.page.locator(DETAILS_CONTENT).first();
    ctx.product.details = (await details.textContent())?.trim() ?? '';
    return;
  }

  const fallback = ctx.page.locator(FALLBACK_DETAILS_SELECTOR);
  if ((await fallback.count()) > 0) {
    ctx.product.details = (await fallback.first().textContent())?.trim() ?? '';
    return;
  }

  ctx.product.details = '';
}
