export class SkipProductError extends Error {
  /**
   * @param {string} [message]
   */
  constructor(message = 'Product skipped') {
    super(message);
    this.name = 'SkipProductError';
  }
}
