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
  const match = trimmed.match(/(\d{1,2})\s+([^\s\d]+)\s+(\d{4})/u);

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
