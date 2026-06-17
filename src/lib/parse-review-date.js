const RUSSIAN_MONTHS = {
  янв: '01',
  фев: '02',
  мар: '03',
  апр: '04',
  май: '05',
  июн: '06',
  июл: '07',
  авг: '08',
  сен: '09',
  окт: '10',
  ноя: '11',
  дек: '12',
};

/**
 * @param {string} raw
 * @returns {string}
 */
export function parseReviewDate(raw) {
  const trimmed = raw.trim().split('·')[0]?.trim() ?? '';
  console.log("🚀 ~ parse-review-date.js:22 ~ parseReviewDate ~ trimmed:", trimmed);
  const match = trimmed.match(/(\d{1,2})\s+([^\s\d]+)\s+(\d{4})/u);
  console.log("🚀 ~ parse-review-date.js:24 ~ parseReviewDate ~ match:", match);

  if (!match) {
    return '';
  }

  const [, dayRaw, monthName, year] = match;
  const month = RUSSIAN_MONTHS[monthName.toLowerCase()];

  if (!month) {
    return '';
  }

  const day = String(dayRaw).padStart(2, '0');
  return `${day}.${month}.${year}`;
}
