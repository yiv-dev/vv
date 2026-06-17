/**
 * @param {Date} [date]
 * @returns {string}
 */
export function formatOutputFilename(date = new Date()) {
  const pad = (value, length = 2) => String(value).padStart(length, '0');

  const day = pad(date.getDate());
  const month = pad(date.getMonth() + 1);
  const year = date.getFullYear();
  const hours = pad(date.getHours());
  const minutes = pad(date.getMinutes());
  const seconds = pad(date.getSeconds());
  const milliseconds = pad(date.getMilliseconds(), 3);

  return `${day}-${month}-${year}--${hours}-${minutes}-${seconds}-${milliseconds}.json`;
}
