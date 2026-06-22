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
  if (!iso) {
    return '';
  }

  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return '';
  }

  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${date.getFullYear()}.${month}.${day} ${hours}:${minutes}`;
}

/**
 * 초 단위 시간을 'M:SS' 로, 1시간 이상이면 'H:MM:SS' 로 포맷한다.
 * @param {number} totalSeconds
 * @returns {string}
 */
export function formatDuration(totalSeconds) {
  const seconds = Math.max(0, Math.floor(totalSeconds || 0));
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  const mm = String(minutes).padStart(2, '0');
  const ss = String(secs).padStart(2, '0');

  return hours > 0 ? `${hours}:${mm}:${ss}` : `${mm}:${ss}`;
}
