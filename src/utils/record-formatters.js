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

export function formatDurationShort(totalSeconds) {
  const seconds = Number(totalSeconds);
  if (Number.isNaN(seconds) || seconds < 0) return '00:00';

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;

  if (hours > 0) {
    return formatDurationHms(seconds);
  }

  return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
}

export function formatAveragePace(pace) {
  const numericPace = Number(pace);
  if (Number.isNaN(numericPace)) return '-';

  const minutes = Math.floor(numericPace);
  const seconds = Math.round((numericPace - minutes) * 60);

  return `${minutes}'${String(seconds).padStart(2, '0')}"`;
}

export function formatRecordTimeMeta(isoString) {
  const parts = getKoreaWallClock(isoString);
  if (!parts) return '';

  const period = parts.hour < 12 ? '오전' : '오후';
  const hour12 = parts.hour % 12 || 12;
  const minutes = String(parts.minute).padStart(2, '0');

  return `${parts.month}.${parts.day}(${parts.weekday}) · ${period} ${hour12}:${minutes}`;
}

export function formatRecordTitle(isoString) {
  const parts = getKoreaWallClock(isoString);
  if (!parts) return '러닝 기록';

  return `${parts.month}월 ${parts.day}일 러닝`;
}

export function formatKoreanEndTime(isoString, durationSeconds) {
  const startDate = new Date(isoString);
  if (Number.isNaN(startDate.getTime())) return '';

  const endDate = new Date(startDate.getTime() + Number(durationSeconds) * 1000);
  return formatKoreanDateTime(endDate.toISOString());
}
