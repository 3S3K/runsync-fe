/**
 * ISO date-time 문자열을 'YYYY.MM.DD' 로 포맷한다. 유효하지 않으면 빈 문자열.
 * @param {string} iso
 * @returns {string}
 */
export function formatYmd(iso) {
  if (!iso) {
    return '';
  }

  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return '';
  }

  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}.${month}.${day}`;
}

/**
 * ISO date-time 문자열을 'YYYY.MM.DD HH:mm' 로 포맷한다. 유효하지 않으면 빈 문자열.
 * @param {string} iso
 * @returns {string}
 */
export function formatYmdHm(iso) {
  const ymd = formatYmd(iso);
  if (!ymd) {
    return '';
  }

  const date = new Date(iso);
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${ymd} ${hours}:${minutes}`;
}
