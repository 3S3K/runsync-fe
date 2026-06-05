const DEFAULT_LATITUDE = 37.5665;
const DEFAULT_LONGITUDE = 126.978;

export function toIsoDateTime(date = new Date()) {
  return date.toISOString();
}

export function buildRunSessionStartPayload(startedAt = Date.now()) {
  return {
    startTime: toIsoDateTime(new Date(startedAt)),
  };
}

export function buildRunSessionEndPayload({ endTime, totalDistance } = {}) {
  const resolvedEndTime = endTime ? new Date(endTime) : new Date();

  return {
    endTime: resolvedEndTime.toISOString(),
    totalDistance: totalDistance != null ? Number(totalDistance) : 0,
  };
}

export function buildLocationUpdatePayload({
  latitude = DEFAULT_LATITUDE,
  longitude = DEFAULT_LONGITUDE,
  distanceKm = 0,
  durationSeconds = 0,
}) {
  return {
    lastLatitude: latitude,
    lastLongitude: longitude,
    currentDistance: Number(distanceKm) || 0,
    currentDurationTime: Math.max(0, Math.round(durationSeconds)),
  };
}

const DEFAULT_RUN_RECORD_DETAIL = {
  averagePace: 6.43,
  calories: 450,
  averageHeartRate: 172,
  cadence: 167,
  elevationGain: 5,
};

export function buildRunRecordDetailPayload({
  averagePace = DEFAULT_RUN_RECORD_DETAIL.averagePace,
  calories = DEFAULT_RUN_RECORD_DETAIL.calories,
  averageHeartRate = DEFAULT_RUN_RECORD_DETAIL.averageHeartRate,
  cadence = DEFAULT_RUN_RECORD_DETAIL.cadence,
  elevationGain = DEFAULT_RUN_RECORD_DETAIL.elevationGain,
} = {}) {
  return {
    averagePace: Number(averagePace),
    calories: Math.round(Number(calories)),
    averageHeartRate: Math.round(Number(averageHeartRate)),
    cadence: Math.round(Number(cadence)),
    elevationGain: Number(elevationGain),
  };
}

export function estimateAveragePaceMinPerKm(distanceKm, durationSeconds) {
  const distance = Number(distanceKm);
  const duration = Number(durationSeconds);

  if (!distance || distance <= 0 || !duration || duration <= 0) {
    return null;
  }

  return Number(((duration / 60) / distance).toFixed(2));
}

export function getDefaultRunCoordinates() {
  return {
    latitude: DEFAULT_LATITUDE,
    longitude: DEFAULT_LONGITUDE,
  };
}

export function toSessionIdNumber(sessionId) {
  const numericSessionId = Number(sessionId);

  if (!Number.isFinite(numericSessionId)) {
    throw new Error(`Invalid sessionId: ${sessionId}`);
  }

  return numericSessionId;
}
