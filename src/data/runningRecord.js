/**
 * 임시 러닝 기록 데이터 (API fallback)
 */
export const runningRecords = {
  1: {
    id: '1',
    timeMeta: '오늘 · 오전 8:58',
    title: '일요일 오전 러닝',
    distanceKm: 2.59,
    avgPace: "6'43\"",
    duration: '17:28',
    calories: 134,
    elevationGain: 5,
    avgHeartRate: 0,
    cadence: 173,
    mapLocationLabel: '대전광역시 대전문창초',
    location: '대전 동구 대학로 62 대전대학교',
    startTime: '5.12(월) 19:30',
    endTime: '5.12(월) 20:18',
    runningType: '야외 러닝',
    memo: '오늘 러닝 완료',
  },
};

export function getRunningRecord(id) {
  return runningRecords[id] ?? null;
}

export function getRunningRecordStats(record) {
  return [
    { id: 'pace', label: '평균 페이스', value: record.avgPace },
    { id: 'duration', label: '시간', value: record.duration },
    { id: 'calories', label: '칼로리', value: record.calories },
    { id: 'elevation', label: '고도 상승', value: `${record.elevationGain} m` },
    { id: 'heartRate', label: '평균 심박수', value: record.avgHeartRate },
    { id: 'cadence', label: '케이던스', value: record.cadence },
  ];
}

export function getRunningRecordDetails(record) {
  return [
    {
      id: 'location',
      label: '위치',
      value: record.location,
    },
    {
      id: 'timeRange',
      label: '시간',
      startLabel: '시작 시간',
      startValue: record.startTime,
      endLabel: '종료 시간',
      endValue: record.endTime,
      isTimeRange: true,
    },
    {
      id: 'runningType',
      label: '러닝 타입',
      value: record.runningType,
    },
    {
      id: 'memo',
      label: '메모',
      value: record.memo,
    },
  ];
}
