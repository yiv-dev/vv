/**
 * @typedef {import('playwright').Page} Page
 * @typedef {{ link?: string, title?: string, categories?: string[], rating?: string, details?: string, brand?: string, reviews?: object[] }} Product
 * @typedef {{ page: Page, product: Product, products: Product[], baseUrl: string, link: string, timeoutMs: number }} StepContext
 */

/**
 * @param {StepContext} ctx
 */
export async function run(ctx) {
  const url = ctx.link.startsWith('http') ? ctx.link : `${ctx.baseUrl}${ctx.link}`;
  ctx.product = { link: url };
}
