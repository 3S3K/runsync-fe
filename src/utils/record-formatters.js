const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'];

function getKoreaWallClock(isoString) {
  const date = new Date(isoString);
  if (Number.isNaN(date.getTime())) return null;

  const seoulOffsetMinutes = 9 * 60;
  const seoulDate = new Date(
    date.getTime() + (seoulOffsetMinutes + date.getTimezoneOffset()) * 60 * 1000,
  );

  return {
    month: seoulDate.getUTCMonth() + 1,
    day: seoulDate.getUTCDate(),
    weekday: WEEKDAYS[seoulDate.getUTCDay()],
    hour: seoulDate.getUTCHours(),
    minute: seoulDate.getUTCMinutes(),
  };
}

export function formatDurationHms(totalSeconds) {
  const seconds = Number(totalSeconds);
  if (Number.isNaN(seconds) || seconds < 0) return '00:00:00';

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;

  return [hours, minutes, remainingSeconds]
    .map((unit) => String(unit).padStart(2, '0'))
    .join(':');
}

export function formatKoreanDateTime(isoString) {
  const parts = getKoreaWallClock(isoString);
  if (!parts) return '';

  const hours = String(parts.hour).padStart(2, '0');
  const minutes = String(parts.minute).padStart(2, '0');

  return `${parts.month}.${parts.day}(${parts.weekday}) ${hours}:${minutes}`;
}
