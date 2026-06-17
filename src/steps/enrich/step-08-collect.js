/** @typedef {import('./step-01-link.js').StepContext} StepContext */

/**
 * @param {StepContext} ctx
 */
export async function run(ctx) {
  ctx.products.push(ctx.product);
}
