import {
  formatAveragePace,
  formatDurationShort,
  formatKoreanDateTime,
  formatKoreanEndTime,
  formatRecordTimeMeta,
  formatRecordTitle,
} from './record-formatters';

const DEFAULT_DETAIL_FIELDS = {
  mapLocationLabel: '러닝 경로',
  location: '위치 정보 없음',
  runningType: '야외 러닝',
  memo: '',
};

export function mapApiRecordToRunningRecord(apiRecord) {
  const recordId = String(apiRecord.recordId);

  return {
    id: recordId,
    timeMeta: formatRecordTimeMeta(apiRecord.startTime),
    title: formatRecordTitle(apiRecord.startTime),
    distanceKm: apiRecord.distance ?? 0,
    avgPace: formatAveragePace(apiRecord.averagePace),
    duration: formatDurationShort(apiRecord.durationSeconds),
    calories: apiRecord.calories ?? 0,
    elevationGain: apiRecord.elevationGain ?? 0,
    avgHeartRate: apiRecord.averageHeartRate ?? 0,
    cadence: apiRecord.cadence ?? 0,
    mapLocationLabel: DEFAULT_DETAIL_FIELDS.mapLocationLabel,
    location: DEFAULT_DETAIL_FIELDS.location,
    startTime: formatKoreanDateTime(apiRecord.startTime),
    endTime: formatKoreanEndTime(apiRecord.startTime, apiRecord.durationSeconds),
    runningType: DEFAULT_DETAIL_FIELDS.runningType,
    memo: DEFAULT_DETAIL_FIELDS.memo,
  };
}
