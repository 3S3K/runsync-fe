import { apiFetch } from './http';

/**
 * 러닝 세션 시작.
 * @param {string} startTime ISO date-time 문자열
 * @param {number} [artRunSessionId] 협동 러닝에서 시작할 때만 전달 (결과 연동용). 일반 러닝은 생략.
 * @returns {Promise<{ sessionId: number, status: string }>}
 */
export async function startRunSession(startTime, artRunSessionId) {
  const payload = { startTime };
  if (artRunSessionId != null) {
    payload.artRunSessionId = artRunSessionId;
  }

  const body = await apiFetch('/api/run-sessions', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  return body?.data;
}

/**
 * 러닝 중 위치/진행 상황 저장 (진행 스냅샷).
 * @param {number} sessionId
 * @param {{ lastLatitude: number, lastLongitude: number, currentDistance: number, currentDurationTime: number }} location
 *   currentDistance: 누적 거리(km), currentDurationTime: 경과 시간(초)
 * @returns {Promise<void>}
 */
export async function updateRunLocation(sessionId, location) {
  await apiFetch(`/api/run-sessions/${sessionId}/location`, {
    method: 'PATCH',
    body: JSON.stringify(location),
  });
}

/**
 * 러닝 종료.
 * @param {number} sessionId
 * @param {{ endTime: string, totalDistance: number }} payload endTime: ISO date-time, totalDistance: km
 * @returns {Promise<{ sessionId: number, status: string }>}
 */
export async function endRunSession(sessionId, payload) {
  const body = await apiFetch(`/api/run-sessions/${sessionId}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
  return body?.data;
}

/**
 * 러닝 종료 후 세부 기록 저장. (사용자가 직접 입력한 값)
 * @param {number} sessionId
 * @param {{ averagePace?: number, calories?: number, averageHeartRate?: number, cadence?: number, elevationGain?: number }} record
 * @returns {Promise<{ recordId: number }>}
 */
export async function saveRunRecord(sessionId, record) {
  const body = await apiFetch(`/api/run-sessions/${sessionId}/records`, {
    method: 'PATCH',
    body: JSON.stringify(record),
  });
  return body?.data;
}
